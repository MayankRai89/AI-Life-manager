import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import aiApi from "../../api/aiApi";
import { MOCK_AI_PLAN, MOCK_NUDGE } from "../../mock/mockData";
import { updateTaskScoresFromAI } from "./taskSlice";

export const fetchAIDayPlan = createAsyncThunk(
  "ai/fetchAIDayPlan",
  async (_, { rejectWithValue }) => {
    try {
      const data = await aiApi.getDailySuggestion();
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
    },
  },
  extraReducers: (builder) => {
    builder
      // Day Plan
      .addCase(fetchAIDayPlan.pending, (state) => {
        state.loadingPlan = true;
        state.error = null;
      })
      .addCase(fetchAIDayPlan.fulfilled, (state, action) => {
        state.loadingPlan = false;
        if (action.payload?.suggestion) {
          // If suggestion returned as markdown/text or structured
          state.dayPlan = {
            ...state.dayPlan,
            summary: action.payload.suggestion,
            meta: action.payload.meta,
          };
        }
      })
      .addCase(fetchAIDayPlan.rejected, (state, action) => {
        state.loadingPlan = false;
        // Keep current plan as graceful fallback
      })
      // Prioritize Tasks
      .addCase(fetchAIPrioritizedTasks.pending, (state) => {
        state.loadingScores = true;
      })
      .addCase(fetchAIPrioritizedTasks.fulfilled, (state, action) => {
        state.loadingScores = false;
        if (action.payload) {
          state.taskScores = action.payload;
        }
      })
      .addCase(fetchAIPrioritizedTasks.rejected, (state) => {
        state.loadingScores = false;
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
      });
  },
});

export const { dismissNudge, restoreNudge, setNudge, clearAIError } = aiSlice.actions;
export default aiSlice.reducer;
