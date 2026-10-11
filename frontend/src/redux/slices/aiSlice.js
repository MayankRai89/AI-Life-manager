import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import aiApi from "../../api/aiApi";
import { MOCK_AI_PLAN, MOCK_NUDGE } from "../../mock/mockData";
import { updateTaskScoresFromAI } from "./taskSlice";

export const fetchAIDayPlan = createAsyncThunk(
  "ai/fetchAIDayPlan",
  async (forceRefresh = false, { rejectWithValue }) => {
    try {
      const data = await aiApi.getDailySuggestion(forceRefresh);
      return data.data || data;
    } catch (err) {
      // In development or if no mood logged yet, provide a generated fallback based on current state
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchAIPrioritizedTasks = createAsyncThunk(
  "ai/fetchAIPrioritizedTasks",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const data = await aiApi.getPrioritizeTasks();
      // If backend returns prioritized task array or text:
      if (data.data?.tasks) {
        dispatch(updateTaskScoresFromAI(data.data.tasks));
      }
      return data.data || data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const sendAIChatMessage = createAsyncThunk(
  "ai/sendAIChatMessage",
  async (message, { rejectWithValue }) => {
    try {
      const data = await aiApi.sendChat(message);
      return {
        userMessage: message,
        aiReply: data.data?.reply || data.reply || "I'm here to support your focus and wellbeing.",
        meta: data.data?.meta,
      };
    } catch (err) {
      return {
        userMessage: message,
        aiReply: "Remember to take steady breaths. I'm here to help adjust your workload according to your energy.",
      };
    }
  }
);

export const submitPlanFeedback = createAsyncThunk(
  "ai/submitPlanFeedback",
  async ({ planId, rating, reason }, { rejectWithValue }) => {
    try {
      const data = await aiApi.submitPlanFeedback(planId, { rating, reason });
      return data.data || data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchAINudge = createAsyncThunk(
  "ai/fetchAINudge",
  async (minutesSinceLastBreak = 0, { rejectWithValue }) => {
    try {
      const data = await aiApi.getNudge(minutesSinceLastBreak);
      return data.data || data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const aiSlice = createSlice({
  name: "ai",
  initialState: {
    dayPlan: MOCK_AI_PLAN,
    taskScores: [],
    latestNudge: MOCK_NUDGE,
    isNudgeDismissed: false,
    chatMessages: [
      {
        sender: "ai",
        text: "Hello! I'm your AI Life Assistant. How can I support your schedule or headspace right now?",
        timestamp: new Date().toISOString(),
      },
    ],
    // Distinct loading states per AI action
    loadingPlan: false,
    loadingScores: false,
    loadingNudge: false,
    loadingChat: false,
    error: null,
    planError: null,
    scoresError: null,
    nudgeError: null,
  },
  reducers: {
    dismissNudge: (state) => {
      state.isNudgeDismissed = true;
    },
    restoreNudge: (state) => {
      state.isNudgeDismissed = false;
    },
    setNudge: (state, action) => {
      state.latestNudge = action.payload;
      state.isNudgeDismissed = false;
    },
    clearAIError: (state) => {
      state.error = null;
      state.planError = null;
      state.scoresError = null;
      state.nudgeError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Day Plan
      .addCase(fetchAIDayPlan.pending, (state) => {
        state.loadingPlan = true;
        state.error = null;
        state.planError = null;
      })
      .addCase(fetchAIDayPlan.fulfilled, (state, action) => {
        state.loadingPlan = false;
        state.planError = null;
        if (action.payload) {
          state.dayPlan = {
            ...state.dayPlan,
            ...(typeof action.payload === "object" ? action.payload : {}),
            summary:
              action.payload.summary ||
              action.payload.suggestion ||
              state.dayPlan.summary,
            _id:
              action.payload._id ||
              action.payload.plan?._id ||
              state.dayPlan?._id,
            plan: action.payload.plan || state.dayPlan?.plan,
            feedback:
              action.payload.feedback ||
              action.payload.plan?.feedback ||
              state.dayPlan?.feedback ||
              null,
            orderedTaskIds:
              action.payload.orderedTaskIds || state.dayPlan.orderedTaskIds,
            focusTasks:
              action.payload.focusTasks ||
              action.payload.plan?.focusTasks ||
              state.dayPlan?.focusTasks,
            wellnessActivities:
              action.payload.wellnessActivities ||
              action.payload.plan?.wellnessActivities ||
              state.dayPlan?.wellnessActivities,
            notes:
              action.payload.notes ||
              action.payload.plan?.notes ||
              state.dayPlan.notes,
            meta: action.payload.meta || state.dayPlan.meta,
          };
        }
      })
      .addCase(fetchAIDayPlan.rejected, (state, action) => {
        state.loadingPlan = false;
        state.planError =
          action.payload || "Unable to generate daily suggestion. Please try again.";
      })
      // Submit Plan Feedback
      .addCase(submitPlanFeedback.fulfilled, (state, action) => {
        const fb = action.payload?.feedback || action.payload?.plan?.feedback;
        if (fb && state.dayPlan) {
          state.dayPlan.feedback = fb;
          if (state.dayPlan.plan) {
            state.dayPlan.plan.feedback = fb;
          }
        }
      })
      // Prioritize Tasks
      .addCase(fetchAIPrioritizedTasks.pending, (state) => {
        state.loadingScores = true;
        state.scoresError = null;
      })
      .addCase(fetchAIPrioritizedTasks.fulfilled, (state, action) => {
        state.loadingScores = false;
        state.scoresError = null;
        if (action.payload) {
          state.taskScores = action.payload;
        }
      })
      .addCase(fetchAIPrioritizedTasks.rejected, (state, action) => {
        state.loadingScores = false;
        state.scoresError =
          action.payload || "Unable to prioritize tasks. Please try again.";
      })
      // Chat
      .addCase(sendAIChatMessage.pending, (state) => {
        state.loadingChat = true;
      })
      .addCase(sendAIChatMessage.fulfilled, (state, action) => {
        state.loadingChat = false;
        state.chatMessages.push({
          sender: "user",
          text: action.payload.userMessage,
          timestamp: new Date().toISOString(),
        });
        state.chatMessages.push({
          sender: "ai",
          text: action.payload.aiReply,
          timestamp: new Date().toISOString(),
        });
      })
      .addCase(sendAIChatMessage.rejected, (state) => {
        state.loadingChat = false;
      })
      // Nudges
      .addCase(fetchAINudge.pending, (state) => {
        state.loadingNudge = true;
        state.nudgeError = null;
      })
      .addCase(fetchAINudge.fulfilled, (state, action) => {
        state.loadingNudge = false;
        state.nudgeError = null;
        if (action.payload) {
          state.latestNudge = action.payload;
          state.isNudgeDismissed = false;
        }
      })
      .addCase(fetchAINudge.rejected, (state, action) => {
        state.loadingNudge = false;
        state.nudgeError =
          action.payload || "Could not retrieve wellness nudge.";
      });
  },
});

export const { dismissNudge, restoreNudge, setNudge, clearAIError } = aiSlice.actions;
export default aiSlice.reducer;
