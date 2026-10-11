import apiClient from "./client";

export const aiApi = {
  getDailySuggestion: async (forceRefresh = false) => {
    const response = await apiClient.get("/ai/daily-suggestion", {
      params: forceRefresh ? { forceRefresh: true } : {},
    });
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

  submitPlanFeedback: async (id, { rating, reason }) => {
    const response = await apiClient.patch(`/ai/daily-suggestion/${id}/feedback`, {
      rating,
      reason,
    });
    return response.data;
  },

  getNudge: async (minutesSinceLastBreak = 0) => {
    const response = await apiClient.get("/ai/nudge", {
      params: { minutesSinceLastBreak },
    });
    return response.data;
  },
};

export default aiApi;
