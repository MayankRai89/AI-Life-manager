import express from "express";
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskStats,
} from "../controller/task.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  validate,
  createTaskValidationRules,
  updateTaskValidationRules,
} from "../middleware/validate.middleware.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(getTasks)
  .post(validate(createTaskValidationRules), createTask);

router.get("/stats", getTaskStats);

router
  .route("/:id")
  .get(getTaskById)
  .put(validate(updateTaskValidationRules), updateTask)
  .delete(deleteTask);

router.patch("/:id/status", updateTaskStatus);

export default router;
