import Task from "../model/task.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { AppError } from "../middleware/errorHandler.middleware.js";

/**
 * @desc    Get all tasks for authenticated user (with filters & search)
 * @route   GET /api/tasks
 * @access  Private
 */
export const getTasks = asyncHandler(async (req, res) => {
  const {
    category,
    priority,
    status,
    search,
    sortBy = "createdAt",
    order = "desc",
    page = 1,
    limit = 20,
  } = req.query;

  const query = { userId: req.user._id };

  if (category) query.category = category.toLowerCase();
  if (priority) query.priority = priority.toLowerCase();
  if (status) query.status = status.toLowerCase();

  // Keyword search in title & description
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $in: [new RegExp(search, "i")] } },
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;
  const sortOrder = order === "asc" ? 1 : -1;

  const [tasks, totalTasks] = await Promise.all([
    Task.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limitNum),
    Task.countDocuments(query),
  ]);

  res.status(200).json({
    status: "success",
    results: tasks.length,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalTasks / limitNum),
      totalTasks,
    },
    data: {
      tasks,
    },
  });
});

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
export const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  res.status(200).json({
    status: "success",
    data: {
      task,
    },
  });
});

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
export const createTask = asyncHandler(async (req, res) => {
  const taskData = {
    ...req.body,
    userId: req.user._id,
  };

  const newTask = await Task.create(taskData);

  res.status(201).json({
    status: "success",
    message: "Task created successfully",
    data: {
      task: newTask,
    },
  });
});

/**
 * @desc    Update task by ID
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  res.status(200).json({
    status: "success",
    message: "Task updated successfully",
    data: {
      task,
    },
  });
});

/**
 * @desc    Quick update task status
 * @route   PATCH /api/tasks/:id/status
 * @access  Private
 */
export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    throw new AppError("Please provide a valid status", 400);
  }

  const task = await Task.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  task.status = status;
  await task.save();

  res.status(200).json({
    status: "success",
    message: `Task marked as ${status}`,
    data: {
      task,
    },
  });
});

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  res.status(200).json({
    status: "success",
    message: "Task deleted successfully",
  });
});

/**
 * @desc    Get user's task statistics (completed, pending, overdue, priority breakdown)
 * @route   GET /api/tasks/stats
 * @access  Private
 */
export const getTaskStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [statusCounts, priorityCounts, overdueCount] = await Promise.all([
    Task.aggregate([
      { $match: { userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Task.aggregate([
      { $match: { userId } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]),
    Task.countDocuments({
      userId,
      status: { $nin: ["completed", "archived", "cancelled"] },
      dueDate: { $lt: new Date() },
    }),
  ]);

  const stats = {
    byStatus: statusCounts.reduce(
      (acc, cur) => ({ ...acc, [cur._id]: cur.count }),
      {}
    ),
    byPriority: priorityCounts.reduce(
      (acc, cur) => ({ ...acc, [cur._id]: cur.count }),
      {}
    ),
    overdue: overdueCount,
  };

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});
