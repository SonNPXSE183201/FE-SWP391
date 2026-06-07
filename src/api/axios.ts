import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

export interface ApiResponse<T> {
  IsSuccess: boolean;
  StatusCode: number;
  Message: string;
  Data?: T;
  Errors?: Record<string, string[]>;
}

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5010',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercept responses for global error handling (e.g., 401 Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration, logout, etc.
      useAuthStore.getState().logout();
      // Optional: Redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
