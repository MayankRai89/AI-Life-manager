import apiClient from "./client";

export const taskApi = {
  getTasks: async (params = {}) => {
    const response = await apiClient.get("/tasks", { params });
    return response.data;
  },

  getTaskById: async (id) => {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await apiClient.post("/tasks", taskData);
    return response.data;
  },

  updateTask: async (id, taskData) => {
    const response = await apiClient.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  updateTaskStatus: async (id, status) => {
    const response = await apiClient.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await apiClient.delete(`/tasks/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get("/tasks/stats");
    return response.data;
  },
};

export default taskApi;
