// src/api/error.ts
import type { AxiosError } from "axios"

export type ApiErrorBody = {
  error?: string
  message?: string
  path?: string
  status?: number
  timestamp?: string
}

export class AppError extends Error {
  readonly status?: number
  readonly path?: string
  readonly code?: string

  constructor(
    message: string,
    opts?: { status?: number; path?: string; code?: string },
  ) {
    super(message)
    this.name = "AppError"
    this.status = opts?.status
    this.path = opts?.path
    this.code = opts?.code
  }
}

export const isAxiosError = (e: any): e is AxiosError => {
  return !!e?.isAxiosError
}

export const extractErrorMessage = (e: any): string => {
  if (isAxiosError(e)) {
    const data = e.response?.data as ApiErrorBody | undefined
    return data?.message || e.message || "Ошибка сети. Проверьте подключение."
  }

  if (e instanceof Error) return e.message
  return "Неизвестная ошибка"
}

export const toAppError = (e: any): AppError => {
  if (isAxiosError(e)) {
    const status = e.response?.status
    const data = e.response?.data as ApiErrorBody | undefined
    return new AppError(extractErrorMessage(e), {
      status,
      path: data?.path,
      code: data?.error,
    })
  }

  return new AppError(extractErrorMessage(e))
}
