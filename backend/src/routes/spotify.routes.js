const express = require('express');
const router = express.Router();
const spotifyController = require('../controllers/spotify.controllers');
const { optionalAuth } = require('../middleware/auth.middleware');

// GET /api/spotify/recommendations?mood=happy&count=4
router.get('/recommendations', optionalAuth, spotifyController.getSongSuggestions);

module.exports = router;
