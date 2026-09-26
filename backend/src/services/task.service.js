import Task from "../model/task.model.js";
import { AppError } from "../middleware/errorHandler.middleware.js";

/**
 * Create a new task
 */
export const createTask = async (userId, taskData) => {
  return await Task.create({
    ...taskData,
    userId,
  });
};

/**
 * Get all tasks for a user with filters, search & pagination
 */
export const getTasks = async (userId, options = {}) => {
  const {
    category,
    priority,
    status,
    search,
    sortBy = "createdAt",
    order = "desc",
    page = 1,
    limit = 20,
  } = options;

  const query = { userId };

  if (category) query.category = category.toLowerCase();
  if (priority) query.priority = priority.toLowerCase();
  if (status) query.status = status.toLowerCase();

  // Search in title, description, or tags
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

  return {
    tasks,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalTasks / limitNum),
      totalTasks,
    },
  };
};

/**
 * Get a single task by ID
 */
export const getTaskById = async (userId, taskId) => {
  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  return task;
};

/**
 * Update a task by ID
 */
export const updateTask = async (userId, taskId, updateData) => {
  const task = await Task.findOneAndUpdate(
    { _id: taskId, userId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!task) {
    throw new AppError("Task not found", 404);
  }
  return task;
};

/**
 * Update task status
 */
export const updateTaskStatus = async (userId, taskId, status) => {
  if (!status) {
    throw new AppError("Please provide a valid status", 400);
  }

  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) {
    throw new AppError("Task not found", 404);
  }

  task.status = status;
  await task.save();
  return task;
};

/**
 * Delete a task by ID
 */
export const deleteTask = async (userId, taskId) => {
  const task = await Task.findOneAndDelete({ _id: taskId, userId });
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  return true;
};

/**
 * Get task aggregate statistics
 */
export const getTaskStats = async (userId) => {
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

  return {
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
};

/**
 * Get tasks suited for current user energy level (for AI scheduling)
 */
export const getTasksByEnergyFit = async (userId, energyFit) => {
  return await Task.find({
    userId,
    status: { $in: ["pending", "in_progress"] },
    "aiMetadata.energyFit": energyFit,
  }).sort({ priority: -1, dueDate: 1 });
};

export default {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskStats,
  getTasksByEnergyFit,
};
