import { api } from "@/api/client"
import { secureAuthStore } from "@/api/secureAuthStore"
import axios, { AxiosError } from "axios"


const API_URL = "http://100.83.112.14:8080/api/v1"

export type JwtResponse = {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
  user_id: number
  username?: string
}

const extractErrorMessage = (error: unknown): string => {
  const err = error as AxiosError<any>
  return (
    err?.response?.data?.message || err?.message || "Неизвестная ошибка запроса"
  )
}

export async function registerUser(data: {
  username: string
  password: string
}): Promise<JwtResponse> {
  try {
    const res = await api.post<JwtResponse>("/auth/register", data)

    if (res.data?.access_token && typeof res.data.user_id === "number") {
      await secureAuthStore.setAuth({
        accessToken: res.data.access_token,
        refreshToken: res.data.refresh_token ?? null,
        userId: res.data.user_id,
        username: res.data.username ?? data.username,
      })
      return res.data
    }

    throw new Error("Сервер не вернул access_token или user_id.")
  } catch (error: any) {
    throw new Error(extractErrorMessage(error))
  }
}

export async function loginUser(credentials: {
  username: string
  password: string
}): Promise<JwtResponse> {
  try {
    const res = await api.post<JwtResponse>("/auth/login", credentials)

    if (res.data?.access_token && typeof res.data.user_id === "number") {
      await secureAuthStore.setAuth({
        accessToken: res.data.access_token,
        refreshToken: res.data.refresh_token ?? null,
        userId: res.data.user_id,
        username: res.data.username ?? credentials.username,
      })
      return res.data
    }

    throw new Error("Сервер не вернул access_token или user_id.")
  } catch (error: any) {
    throw new Error(extractErrorMessage(error))
  }
}

export async function logout(): Promise<void> {
  await secureAuthStore.clear()
}

export const authHttp = axios.create({
  baseURL: API_URL,
  timeout: 20000,
})
