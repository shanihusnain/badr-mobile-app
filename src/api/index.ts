import { forceSignOut } from "@/src/api/authSession";
import { refreshAccessToken } from "@/src/api/refreshAccessToken";
import { getAccessToken } from "@/src/storage/tokenStorage";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { router } from "expo-router";

const getBaseUrl = () => {
  return process.env.EXPO_PUBLIC_API_URL;
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const SKIP_REFRESH_URLS = [
  "api/auth/login",
  "api/auth/google",
  "api/auth/facebook",
  "api/auth/register",
  "api/auth/refresh-token",
  "api/auth/logout",
  "api/auth/reset-password",
  "api/auth/forgot-password",
];

const shouldSkipRefresh = (url?: string) => {
  if (!url) return false;
  return SKIP_REFRESH_URLS.some((path) => url.includes(path));
};

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined;

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      shouldSkipRefresh(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newAccessToken = await refreshAccessToken();
      processQueue(null, newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      await forceSignOut();
      router.replace("/(auth)/login");
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
