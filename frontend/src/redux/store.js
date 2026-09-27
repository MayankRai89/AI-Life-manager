import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import taskReducer from "./slices/taskSlice";
import moodReducer from "./slices/moodSlice";
import aiReducer from "./slices/aiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    mood: moodReducer,
    ai: aiReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
