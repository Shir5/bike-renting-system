// src/api/error.ts
import type { AxiosError } from "axios";

export type ApiErrorBody = {
  error?: string;
  message?: string;
  path?: string;
  status?: number;
  timestamp?: string;
};

export class AppError extends Error {
  readonly status?: number;
  readonly path?: string;
  readonly code?: string;

  constructor(
    message: string,
    opts?: { status?: number; path?: string; code?: string },
  ) {
    super(message);
    this.name = "AppError";
    this.status = opts?.status;
    this.path = opts?.path;
    this.code = opts?.code;
  }
}

export const isAxiosError = (error: unknown): error is AxiosError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    error.isAxiosError === true
  );
};

export const extractErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;
    return (
      data?.message || error.message || "Ошибка сети. Проверьте подключение."
    );
  }

  if (error instanceof Error) return error.message;
  return "Неизвестная ошибка";
};

export const toAppError = (error: unknown): AppError => {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as ApiErrorBody | undefined;
    return new AppError(extractErrorMessage(error), {
      status,
      path: data?.path,
      code: data?.error,
    });
  }

  return new AppError(extractErrorMessage(error));
};
