const spotifyService = require("../services/spotify.services");

async function getSongSuggestions(req, res, next) {
  try {
    const mood = req.query.mood || req.query.moodTag || "calm";
    const count = parseInt(req.query.count, 10) || 4;

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
