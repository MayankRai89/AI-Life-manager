const express = require("express");
const router = express.Router();
const moodController = require("../controllers/mood.controllers");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

router.post("/", moodController.createMoodCheckin);
router.get("/latest", moodController.getLatestMoodCheckin);

module.exports = router;
