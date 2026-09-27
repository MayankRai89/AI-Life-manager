import { useSelector, useDispatch } from "react-redux";
import {
  fetchTodayMood,
  submitMoodCheckin,
  setSelectedMoodPreset,
  setEnergyLevel,
  setStressLevel,
  setMoodNote,
} from "../redux/slices/moodSlice";
import { fetchAIDayPlan, fetchAIPrioritizedTasks } from "../redux/slices/aiSlice";

export function useMoodCheckin() {
  const dispatch = useDispatch();
  const moodState = useSelector((state) => state.mood);

  return {
    ...moodState,
    loadTodayMood: () => dispatch(fetchTodayMood()),
    setPreset: (presetId) => dispatch(setSelectedMoodPreset(presetId)),
    setEnergy: (val) => dispatch(setEnergyLevel(val)),
    setStress: (val) => dispatch(setStressLevel(val)),
    setNote: (note) => dispatch(setMoodNote(note)),
    submitCheckin: async (payload) => {
      const res = await dispatch(submitMoodCheckin(payload));
      if (!res.error) {
        dispatch(fetchAIDayPlan());
        dispatch(fetchAIPrioritizedTasks());
      }
      return res;
    },
  };
}

export default useMoodCheckin;
