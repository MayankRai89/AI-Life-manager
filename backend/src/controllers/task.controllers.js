const taskService = require("../services/task.services");

async function getTasks(req, res, next) {
  try {
    const tasks = await taskService.getUserTasks(req.user.id);
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
}

async function createTask(req, res, next) {
  try {
    const task = await taskService.createTask(req.user.id, req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const updated = await taskService.updateTask(req.user.id, req.params.id, req.body);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    await taskService.deleteTask(req.user.id, req.params.id);
    res.status(200).json({ success: true, message: "Task deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
