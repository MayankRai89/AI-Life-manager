import apiClient from "./client";

export const adminApi = {
  getFeedback: async (params = {}) => {
    const response = await apiClient.get("/admin/feedback", { params });
    return response.data;
  },

  getStats: async (params = {}) => {
    const response = await apiClient.get("/admin/stats", { params });
    return response.data;
  },
};

export default adminApi;
