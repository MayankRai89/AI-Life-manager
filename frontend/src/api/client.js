import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:3000/api");

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 seconds timeout
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let slowRequestsCount = 0;
const activeRequestTimers = new Map();

function emitColdStartStatus(show) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("app-cold-start-status", { detail: { show } })
    );
  }
}

const clearSlowTimer = (config) => {
  if (!config) return;
  const timer = activeRequestTimers.get(config);
  if (timer) {
    clearTimeout(timer);
    activeRequestTimers.delete(config);
  }
  if (config.__wasSlow) {
    slowRequestsCount = Math.max(0, slowRequestsCount - 1);
    if (slowRequestsCount === 0) {
      emitColdStartStatus(false);
    }
  }
};

// Request interceptor: Attach JWT token from localStorage if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ai_life_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Schedule 4-second cold start notification
    const timer = setTimeout(() => {
      config.__wasSlow = true;
      slowRequestsCount++;
      emitColdStartStatus(true);
    }, 4000);
    activeRequestTimers.set(config, timer);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    clearSlowTimer(response.config);
    return response;
  },
  (error) => {
    clearSlowTimer(error.config);
    if (error.response?.status === 401) {
      // Clear token if expired/unauthorized
      localStorage.removeItem("ai_life_token");
      localStorage.removeItem("ai_life_user");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
