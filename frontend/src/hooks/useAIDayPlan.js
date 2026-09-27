import { useSelector, useDispatch } from "react-redux";
import {
  fetchAIDayPlan,
  fetchAIPrioritizedTasks,
  dismissNudge,
  restoreNudge,
  sendAIChatMessage,
} from "../redux/slices/aiSlice";

export function useAIDayPlan() {
  const dispatch = useDispatch();
  const aiState = useSelector((state) => state.ai);

  return {
    ...aiState,
    loadDayPlan: () => dispatch(fetchAIDayPlan()),
    prioritizeTasks: () => dispatch(fetchAIPrioritizedTasks()),
    dismissWellnessNudge: () => dispatch(dismissNudge()),
    restoreWellnessNudge: () => dispatch(restoreNudge()),
    sendChatMessage: (msg) => dispatch(sendAIChatMessage(msg)),
  };
}

export default useAIDayPlan;
