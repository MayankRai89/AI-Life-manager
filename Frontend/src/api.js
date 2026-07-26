import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Backend base URL
  withCredentials: true,
});

// Remove manual token interceptor as we now use HTTP-only cookies
api.interceptors.request.use((config) => {
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors (token expiration, etc.)
    if (error.response && error.response.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
