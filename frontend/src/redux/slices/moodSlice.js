import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import moodApi from "../../api/moodApi";
import { MOCK_INITIAL_MOOD } from "../../mock/mockData";

export const fetchTodayMood = createAsyncThunk(
  "mood/fetchTodayMood",
  async (_, { rejectWithValue }) => {
    try {
      const data = await moodApi.getLatestMood();
      return data.data?.moodCheckIn || data.moodCheckIn || data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const submitMoodCheckin = createAsyncThunk(
  "mood/submitMoodCheckin",
  async (moodPayload, { rejectWithValue }) => {
    try {
      const data = await moodApi.createMoodCheckIn(moodPayload);
      return data.data?.moodCheckIn || data.moodCheckIn || data;
    } catch (err) {
      // Return optimistic fallback object
      const fallback = {
        _id: `mood-${Date.now()}`,
        ...moodPayload,
        checkInTime: new Date().toISOString(),
      };
      return fallback;
    }
  }
);

export const fetchMoodAnalytics = createAsyncThunk(
  "mood/fetchMoodAnalytics",
  async (days = 30, { rejectWithValue }) => {
    try {
      const data = await moodApi.getMoodAnalytics(days);
      return data.data || data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const moodSlice = createSlice({
  name: "mood",
  initialState: {
    currentMood: MOCK_INITIAL_MOOD,
    selectedMoodPreset: "calm",
    energyLevel: 7,
    stressLevel: 3,
    note: "",
    analytics: null,
    loading: false,
    submitting: false,
    error: null,
    justSubmitted: false,
  },
  reducers: {
    setSelectedMoodPreset: (state, action) => {
      state.selectedMoodPreset = action.payload;
    },
    setEnergyLevel: (state, action) => {
      state.energyLevel = action.payload;
    },
    setStressLevel: (state, action) => {
      state.stressLevel = action.payload;
    },
    setMoodNote: (state, action) => {
      state.note = action.payload;
    },
    resetJustSubmitted: (state) => {
      state.justSubmitted = false;
    },
    clearMoodError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch latest mood
      .addCase(fetchTodayMood.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTodayMood.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.mood) {
          state.currentMood = action.payload;
          state.selectedMoodPreset = action.payload.mood;
          state.energyLevel = action.payload.energyLevel || state.energyLevel;
          state.stressLevel = action.payload.stressLevel || state.stressLevel;
        }
      })
      .addCase(fetchTodayMood.rejected, (state) => {
        state.loading = false;
      })
      // Submit mood check-in
      .addCase(submitMoodCheckin.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitMoodCheckin.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentMood = action.payload;
        state.selectedMoodPreset = action.payload.mood;
        state.justSubmitted = true;
      })
      .addCase(submitMoodCheckin.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      // Analytics
      .addCase(fetchMoodAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      });
  },
});

export const {
  setSelectedMoodPreset,
  setEnergyLevel,
  setStressLevel,
  setMoodNote,
  resetJustSubmitted,
  clearMoodError,
} = moodSlice.actions;

export default moodSlice.reducer;
