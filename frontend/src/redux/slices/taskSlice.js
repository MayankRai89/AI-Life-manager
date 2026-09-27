import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import taskApi from "../../api/taskApi";
import { MOCK_INITIAL_TASKS } from "../../mock/mockData";

export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await taskApi.getTasks(params);
      return data.data?.tasks || data.tasks || data;
    } catch (err) {
      // In offline/initial dev mode, keep existing mock tasks
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const addTask = createAsyncThunk(
  "tasks/addTask",
  async (taskData, { rejectWithValue }) => {
    try {
      const data = await taskApi.createTask(taskData);
      return data.data?.task || data.task || data;
    } catch (err) {
      // Return a simulated task if backend fails
      const fallbackTask = {
        _id: `task-${Date.now()}`,
        ...taskData,
        status: taskData.status || "pending",
        aiScore: Math.floor(Math.random() * 25) + 70,
        createdAt: new Date().toISOString(),
      };
      return fallbackTask;
    }
  }
);

export const editTask = createAsyncThunk(
  "tasks/editTask",
  async ({ id, taskData }, { rejectWithValue }) => {
    try {
      const data = await taskApi.updateTask(id, taskData);
      return data.data?.task || data.task || { _id: id, ...taskData };
    } catch (err) {
      return { _id: id, ...taskData };
    }
  }
);

export const toggleStatus = createAsyncThunk(
  "tasks/toggleStatus",
  async ({ id, nextStatus }, { rejectWithValue }) => {
    try {
      const data = await taskApi.updateTaskStatus(id, nextStatus);
      return data.data?.task || { _id: id, status: nextStatus };
    } catch (err) {
      return { _id: id, status: nextStatus };
    }
  }
);

export const removeTask = createAsyncThunk(
  "tasks/removeTask",
  async (id, { rejectWithValue }) => {
    try {
      await taskApi.deleteTask(id);
      return id;
    } catch (err) {
      return id;
    }
  }
);

const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    tasks: MOCK_INITIAL_TASKS,
    selectedTask: null,
    loading: false,
    error: null,
    filter: {
      status: "all",
      priority: "all",
      category: "all",
      searchQuery: "",
    },
  },
  reducers: {
    setFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload;
    },
    updateTaskScoresFromAI: (state, action) => {
      // action.payload: array of { taskId, score, reason }
      const scoreMap = new Map();
      action.payload.forEach((item) => {
        scoreMap.set(item.taskId, item);
      });
      state.tasks = state.tasks.map((t) => {
        if (scoreMap.has(t._id)) {
          const match = scoreMap.get(t._id);
          return {
            ...t,
            aiScore: match.score,
            aiReason: match.reason || t.aiReason,
          };
        }
        return t;
      });
    },
    clearTaskError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload) && action.payload.length > 0) {
          state.tasks = action.payload;
        }
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        // Keep initial mock tasks if API fails
      })
      // Add Task
      .addCase(addTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      })
      // Edit Task
      .addCase(editTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = { ...state.tasks[index], ...action.payload };
        }
      })
      // Toggle Status
      .addCase(toggleStatus.fulfilled, (state, action) => {
        const task = state.tasks.find((t) => t._id === action.payload._id);
        if (task) {
          task.status = action.payload.status;
          if (task.status === "completed") {
            task.completedAt = new Date().toISOString();
          } else {
            task.completedAt = null;
          }
        }
      })
      // Delete Task
      .addCase(removeTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
      });
  },
});

export const { setFilter, setSelectedTask, updateTaskScoresFromAI, clearTaskError } =
  taskSlice.actions;
export default taskSlice.reducer;
