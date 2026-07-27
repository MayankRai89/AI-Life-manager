const aiService = require("../services/ai.services");

async function dayPlan(req, res, next) {
  try {
    const { mood, mood_score, note } = req.body;
    const plan = await aiService.generateDayPlan(req.user.id, {
      mood,
      mood_score,
      note,
    });
    res.status(200).json(plan);
  } catch (err) {
    next(err);
  }
}

async function savePlan(req, res, next) {
  try {
    const { tasks } = req.body;
    const result = await aiService.savePlan(req.user.id, tasks);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  dayPlan,
  savePlan,
};
