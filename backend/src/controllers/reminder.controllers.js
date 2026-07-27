const Reminder = require("../models/Remainder.model");

async function getReminders(req, res, next) {
  try {
    const reminders = await Reminder.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(reminders);
  } catch (err) {
    next(err);
  }
}

async function createReminder(req, res, next) {
  try {
    const reminder = await Reminder.create({
      ...req.body,
      userId: req.user.id,
    });
    res.status(201).json(reminder);
  } catch (err) {
    next(err);
  }
}

async function updateReminder(req, res, next) {
  try {
    const updated = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteReminder(req, res, next) {
  try {
    await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
};
