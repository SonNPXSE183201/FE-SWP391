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
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to rewrite /api/ → /api/v1/ for Gateway routing
axiosInstance.interceptors.request.use(
  (config) => {
    if (config.url?.startsWith('/api/')) {
      config.url = config.url.replace('/api/', '/api/v1/');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Intercept responses for global error handling (e.g., 401 Unauthorized)
axiosInstance.interceptors.response.use(
  (response) => {
    // Map 'success' (lowercase from C# JSON serialization) to 'IsSuccess' for frontend compatibility
    if (response.data && typeof response.data === 'object') {
      const successVal = response.data.success ?? response.data.isSuccess ?? response.data.IsSuccess;
      if (successVal !== undefined) {
        response.data.IsSuccess = successVal;
        response.data.success = successVal;
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const authState = useAuthStore.getState();
      const token = authState.token;
      const refreshToken = authState.refreshToken;

      if (token && refreshToken) {
        try {
          // Dynamic import to avoid potential circular dependencies
          const { authApi } = await import('../features/auth/api/auth.api');
          const response = await authApi.refreshToken({ token, refreshToken });

          if (response.IsSuccess && response.Data) {
            const newToken = response.Data.Token;
            const newRefreshToken = response.Data.RefreshToken;

            // Update auth store
            if (authState.user && newToken && newRefreshToken) {
              authState.setAuth(authState.user, newToken, newRefreshToken);
            }

            processQueue(null, newToken);
            originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
            return axiosInstance(originalRequest);
          } else {
            throw new Error('Refresh token invalid');
          }
        } catch (refreshError) {
          processQueue(refreshError as Error, null);
          useAuthStore.getState().logout();
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        useAuthStore.getState().logout();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
