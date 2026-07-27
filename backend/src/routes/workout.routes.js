const express = require("express");
const router = express.Router();
const workoutController = require("../controllers/workout.controllers");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

router.get("/exercises", workoutController.getExercises);

module.exports = router;
