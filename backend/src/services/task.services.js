const Task = require("../models/Task.model");

async function getUserTasks(userId) {
  return await Task.find({ userId }).sort({ createdAt: -1 });
}

async function createTask(userId, data) {
  return await Task.create({
    userId,
    title: data.title,
    description: data.description || "",
    priority: data.priority || "medium",
    category: data.category || "general",
    dueDate: data.dueDate || null,
  });
}

async function updateTask(userId, taskId, updateData) {
  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) {
    const err = new Error("Task not found");
    err.statusCode = 404;
    throw err;
  }

  if (updateData.status && updateData.status === "done" && task.status !== "done") {
    updateData.completedAt = new Date();
  } else if (updateData.status && updateData.status !== "done") {
    updateData.completedAt = null;
  }

  Object.assign(task, updateData);
  return await task.save();
}

async function deleteTask(userId, taskId) {
  const task = await Task.findOneAndDelete({ _id: taskId, userId });
  if (!task) {
    const err = new Error("Task not found");
    err.statusCode = 404;
    throw err;
  }
  return { success: true };
}

module.exports = {
  getUserTasks,
  createTask,
  updateTask,
  deleteTask,
};
