import apiClient from "./client";

export const authApi = {
  register: async (userData) => {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await apiClient.put("/auth/profile", userData);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await apiClient.post(`/auth/reset-password/${token}`, {
      password,
    });
    return response.data;
  },

  deleteAccount: async (password) => {
    const response = await apiClient.delete("/auth/me", {
      data: { password },
    });
    return response.data;
  },
};

export default authApi;
