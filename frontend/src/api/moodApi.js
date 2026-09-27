import apiClient from "./client";

export const moodApi = {
  getMoods: async (params = {}) => {
    const response = await apiClient.get("/moods", { params });
    return response.data;
  },

  getLatestMood: async () => {
    const response = await apiClient.get("/moods/latest");
    return response.data;
  },

  createMoodCheckIn: async (moodData) => {
    const response = await apiClient.post("/moods", moodData);
    return response.data;
  },

  getMoodAnalytics: async (days = 30) => {
    const response = await apiClient.get("/moods/analytics", { params: { days } });
    return response.data;
  },

  getMoodById: async (id) => {
    const response = await apiClient.get(`/moods/${id}`);
    return response.data;
  },

  updateMood: async (id, moodData) => {
    const response = await apiClient.put(`/moods/${id}`, moodData);
    return response.data;
  },

  deleteMood: async (id) => {
    const response = await apiClient.delete(`/moods/${id}`);
    return response.data;
  },
};

export default moodApi;
