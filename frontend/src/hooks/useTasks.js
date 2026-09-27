import { useSelector, useDispatch } from "react-redux";
import {
  fetchTasks,
  addTask,
  editTask,
  toggleStatus,
  removeTask,
  setFilter,
} from "../redux/slices/taskSlice";
import { fetchAIPrioritizedTasks } from "../redux/slices/aiSlice";

export function useTasks() {
  const dispatch = useDispatch();
  const taskState = useSelector((state) => state.tasks);

  return {
    ...taskState,
    loadTasks: (params) => dispatch(fetchTasks(params)),
    createTask: (taskData) => dispatch(addTask(taskData)),
    updateTask: (id, taskData) => dispatch(editTask({ id, taskData })),
    toggleTaskStatus: (id, nextStatus) => dispatch(toggleStatus({ id, nextStatus })),
    deleteTask: (id) => dispatch(removeTask(id)),
    updateFilter: (filterUpdate) => dispatch(setFilter(filterUpdate)),
    prioritizeWithAI: () => dispatch(fetchAIPrioritizedTasks()),
  };
}

export default useTasks;
