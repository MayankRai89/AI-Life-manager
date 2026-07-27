const express = require("express");
const router = express.Router();
const aiController = require("../controllers/ai.controllers");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

router.post("/day-plan", aiController.dayPlan);
router.post("/save-plan", aiController.savePlan);

module.exports = router;
