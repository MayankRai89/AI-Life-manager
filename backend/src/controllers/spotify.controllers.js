const spotifyService = require("../services/spotify.services");
const MoodCheckin = require("../models/moodCheckIn.model");

async function getSongSuggestions(req, res, next) {
  try {
    let mood = req.query.mood || req.query.moodTag;
    const count = parseInt(req.query.count, 10) || 4;

    // If mood is not explicitly provided, check if user is authenticated and fetch their latest check-in
    if (!mood && req.user?.id) {
      const latestCheckin = await MoodCheckin.findOne({ userId: req.user.id }).sort({ checkinAt: -1 });
      if (latestCheckin && latestCheckin.mood) {
        mood = latestCheckin.mood;
      }
    }

    // Default to 'calm' if still not set
    if (!mood) {
      mood = "calm";
    }

    const result = await spotifyService.getSongSuggestionForMood(mood, count);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSongSuggestions,
};
