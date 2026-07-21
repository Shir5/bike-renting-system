import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { toAppError } from "./errors";
import { secureAuthStore } from "./secureAuthStore";
import { API_URL } from "./config";

const REFRESH_PATH = "/auth/refresh";

type ToastFn = (msg: string) => void;
let toastError: ToastFn | null = null;

export const registerToastError = (fn: ToastFn) => {
  toastError = fn;
};

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 20000,
});

const isAuthEndpoint = (url?: string) => {
  if (!url) return false;
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/refresh")
  );
};

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = await secureAuthStore.getRefreshToken();
  if (!refreshToken) return null;

  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await axios.post(
        `${API_URL}${REFRESH_PATH}`,
        { refresh_token: refreshToken },
        { timeout: 20000 },
      );

      const newAccess = res.data?.access_token as string | undefined;
      const newRefresh =
        (res.data?.refresh_token as string | undefined) ?? refreshToken;

      if (!newAccess) return null;

      await secureAuthStore.setAuth({
        accessToken: newAccess,
        refreshToken: newRefresh,
      });

      return newAccess;
    } catch {
      await secureAuthStore.clear();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await secureAuthStore.getAccessToken();

  if (token && !isAuthEndpoint(config.url)) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  const authHeader =
    (config.headers as any)?.Authorization ??
    (config.headers as any)?.authorization;

  console.log(
    "[API REQ]",
    (config.method ?? "GET").toUpperCase(),
    config.url,
    "| hasAuthHeader:",
    !!authHeader,
    "| token:",
    token ? `yes(len=${token.length})` : "no",
  );

  return config;
});

api.interceptors.response.use(
  (resp) => resp,
  async (error: AxiosError) => {
    console.log(
      "[API ERR]",
      error.response?.status,
      error.config?.method?.toUpperCase(),
      error.config?.url,
      "| data:",
      error.response?.data,
    );

    const original = error.config as any;
    const status = error.response?.status;

    if (status === 401 && original && !original._retry) {
      if (!isAuthEndpoint(original.url)) {
        original._retry = true;

        const newToken = await refreshAccessToken();
        if (newToken) {
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${newToken}`;
          return api.request(original);
        }
      }
    }

    const appErr = toAppError(error);

    if (toastError && appErr.status !== 401) toastError(appErr.message);

    return Promise.reject(appErr);
  },
);
