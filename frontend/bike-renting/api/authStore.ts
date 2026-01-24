import AsyncStorage from "@react-native-async-storage/async-storage"

const ACCESS_TOKEN_KEY = "accessToken"
const REFRESH_TOKEN_KEY = "refreshToken"
const USER_ID_KEY = "userId"
const USERNAME_KEY = "username"

export type AuthSnapshot = {
  accessToken: string | null
  refreshToken: string | null
  userId: number | null
  username: string | null
}

export const authStore = {
  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(ACCESS_TOKEN_KEY)
  },

  async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(REFRESH_TOKEN_KEY)
  },

  async getUserId(): Promise<number | null> {
    const raw = await AsyncStorage.getItem(USER_ID_KEY)
    return raw ? Number(raw) : null
  },

  async getUsername(): Promise<string | null> {
    const raw = await AsyncStorage.getItem(USERNAME_KEY)
    return raw ?? null
  },

  async setTokens(payload: {
    accessToken: string
    refreshToken?: string | null
    userId?: number | null
    username?: string | null
  }): Promise<void> {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, payload.accessToken)

    if (payload.refreshToken !== undefined) {
      if (payload.refreshToken) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken)
      } else {
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY)
      }
    }

    if (payload.userId !== undefined) {
      if (payload.userId === null) await AsyncStorage.removeItem(USER_ID_KEY)
      else await AsyncStorage.setItem(USER_ID_KEY, String(payload.userId))
    }

    if (payload.username !== undefined) {
      if (!payload.username) await AsyncStorage.removeItem(USERNAME_KEY)
      else await AsyncStorage.setItem(USERNAME_KEY, payload.username)
    }
  },

  async clear(): Promise<void> {
    await AsyncStorage.multiRemove([
      ACCESS_TOKEN_KEY,
      REFRESH_TOKEN_KEY,
      USER_ID_KEY,
      USERNAME_KEY,
    ])
  },

  async snapshot(): Promise<AuthSnapshot> {
    const [accessToken, refreshToken, userIdRaw, username] = await Promise.all([
      AsyncStorage.getItem(ACCESS_TOKEN_KEY),
      AsyncStorage.getItem(REFRESH_TOKEN_KEY),
      AsyncStorage.getItem(USER_ID_KEY),
      AsyncStorage.getItem(USERNAME_KEY),
    ])

    return {
      accessToken,
      refreshToken,
      userId: userIdRaw ? Number(userIdRaw) : null,
      username: username ?? null,
    }
  },
}
