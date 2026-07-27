const express = require("express");
const router = express.Router();
const reminderController = require("../controllers/reminder.controllers");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

router.get("/", reminderController.getReminders);
router.post("/", reminderController.createReminder);
router.put("/:id", reminderController.updateReminder);
router.delete("/:id", reminderController.deleteReminder);

module.exports = router;
