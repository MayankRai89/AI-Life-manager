import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authApi from "../../api/authApi";
import { MOCK_USER } from "../../mock/mockData";

const storedToken = localStorage.getItem("ai_life_token");
const storedUser = localStorage.getItem("ai_life_user");

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : MOCK_USER,
  token: storedToken || "demo-token",
  isAuthenticated: !!storedToken || true, // Defaults to authenticated demo mode if not explicitly logged out
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authApi.login(credentials);
      if (data.token) {
        localStorage.setItem("ai_life_token", data.token);
      }
      if (data.user) {
        localStorage.setItem("ai_life_user", JSON.stringify(data.user));
      }
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login failed";
      return rejectWithValue(msg);
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authApi.register(userData);
      if (data.token) {
        localStorage.setItem("ai_life_token", data.token);
      }
      if (data.user) {
        localStorage.setItem("ai_life_user", JSON.stringify(data.user));
      }
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Registration failed";
      return rejectWithValue(msg);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const data = await authApi.getMe();
      if (data.user) {
        localStorage.setItem("ai_life_user", JSON.stringify(data.user));
      }
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch user");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("ai_life_token");
      localStorage.removeItem("ai_life_user");
    },
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("ai_life_user", JSON.stringify(state.user));
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload.data?.user || state.user;
        state.token = action.payload.token || state.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload.data?.user || state.user;
        state.token = action.payload.token || state.token;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Me
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        if (action.payload.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
      });
  },
});

export const { logout, updateUserProfile, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
