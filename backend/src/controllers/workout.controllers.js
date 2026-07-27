const exercisesList = [
  {
    id: "1",
    code: "barbell_bench_press",
    primaryMuscles: [{ id: "m1", name: "Chest" }],
    secondaryMuscles: [{ id: "m2", name: "Triceps" }, { id: "m3", name: "Shoulders" }],
  },
  {
    id: "2",
    code: "pull_ups",
    primaryMuscles: [{ id: "m4", name: "Lats" }, { id: "m5", name: "Upper Back" }],
    secondaryMuscles: [{ id: "m6", name: "Biceps" }],
  },
  {
    id: "3",
    code: "barbell_squat",
    primaryMuscles: [{ id: "m7", name: "Quadriceps" }, { id: "m8", name: "Glutes" }],
    secondaryMuscles: [{ id: "m9", name: "Hamstrings" }, { id: "m10", name: "Core" }],
  },
  {
    id: "4",
    code: "overhead_shoulder_press",
    primaryMuscles: [{ id: "m3", name: "Shoulders" }],
    secondaryMuscles: [{ id: "m2", name: "Triceps" }, { id: "m5", name: "Upper Back" }],
  },
  {
    id: "5",
    code: "plank_hold",
    primaryMuscles: [{ id: "m10", name: "Core" }],
    secondaryMuscles: [{ id: "m3", name: "Shoulders" }, { id: "m8", name: "Glutes" }],
  },
  {
    id: "6",
    code: "dumbell_bicep_curl",
    primaryMuscles: [{ id: "m6", name: "Biceps" }],
    secondaryMuscles: [{ id: "m11", name: "Forearms" }],
  },
];

async function getExercises(req, res, next) {
  try {
    res.status(200).json(exercisesList);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getExercises,
};
