import apiClient from "./client";

export const aiApi = {
  getDailySuggestion: async () => {
    const response = await apiClient.get("/ai/daily-suggestion");
    return response.data;
  },

  getMoodAnalysis: async (days = 30) => {
    const response = await apiClient.get("/ai/mood-analysis", { params: { days } });
    return response.data;
  },

  getPrioritizeTasks: async () => {
    const response = await apiClient.get("/ai/prioritize-tasks");
    return response.data;
  },

  sendChat: async (message) => {
    const response = await apiClient.post("/ai/chat", { message });
    return response.data;
  },
};

export default aiApi;
