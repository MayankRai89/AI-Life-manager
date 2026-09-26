import * as taskService from "../services/task.service.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * @desc    Get all tasks for authenticated user (with filters & search)
 * @route   GET /api/tasks
 * @access  Private
 */
export const getTasks = asyncHandler(async (req, res) => {
  const result = await taskService.getTasks(req.user._id, req.query);

  res.status(200).json({
    status: "success",
    results: result.tasks.length,
    pagination: result.pagination,
    data: {
      tasks: result.tasks,
    },
  });
});

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
export const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskService.getTaskById(req.user._id, req.params.id);

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
  const newTask = await taskService.createTask(req.user._id, req.body);

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
  const updatedTask = await taskService.updateTask(
    req.user._id,
    req.params.id,
    req.body
  );

  res.status(200).json({
    status: "success",
    message: "Task updated successfully",
    data: {
      task: updatedTask,
    },
  });
});

/**
 * @desc    Quick update task status
 * @route   PATCH /api/tasks/:id/status
 * @access  Private
 */
export const updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await taskService.updateTaskStatus(
    req.user._id,
    req.params.id,
    req.body.status
  );

  res.status(200).json({
    status: "success",
    message: `Task marked as ${req.body.status}`,
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
  await taskService.deleteTask(req.user._id, req.params.id);

  res.status(200).json({
    status: "success",
    message: "Task deleted successfully",
  });
});

/**
 * @desc    Get user's task statistics
 * @route   GET /api/tasks/stats
 * @access  Private
 */
export const getTaskStats = asyncHandler(async (req, res) => {
  const stats = await taskService.getTaskStats(req.user._id);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});
