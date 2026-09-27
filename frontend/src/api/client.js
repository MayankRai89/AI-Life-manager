import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Attach JWT token from localStorage if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ai_life_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired/unauthorized
      localStorage.removeItem("ai_life_token");
      localStorage.removeItem("ai_life_user");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
