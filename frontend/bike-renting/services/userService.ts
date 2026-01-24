// src/services/userService.ts
import { api } from "@/api/client"

export interface UserResponse {
  username: string
  balance: number
  debt: number
}

export const fetchUserInfo = async (): Promise<UserResponse | null> => {
  try {
    const response = await api.get<UserResponse>("/auth/info")

    if (
      response.data &&
      typeof response.data.username === "string" &&
      typeof response.data.balance === "number" &&
      typeof response.data.debt === "number"
    ) {
      return response.data
    }

    return null
  } catch {
    return null
  }
}
