const MoodCheckin = require("../models/moodCheckIn.model");

async function createMoodCheckin(req, res, next) {
  try {
    const { mood, moodScore, energyLevel, notes, tags } = req.body;
    const checkin = await MoodCheckin.create({
      userId: req.user.id,
      mood: mood || "neutral",
      moodScore: moodScore || 5,
      energyLevel: energyLevel || 5,
      notes: notes || "",
      tags: tags || [],
    });
    res.status(201).json(checkin);
  } catch (err) {
    next(err);
  }
}

async function getLatestMoodCheckin(req, res, next) {
  try {
    const latest = await MoodCheckin.findOne({ userId: req.user.id }).sort({ checkinAt: -1 });
    res.status(200).json(latest || null);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createMoodCheckin,
  getLatestMoodCheckin,
};
