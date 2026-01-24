import * as SecureStore from "expo-secure-store"

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

async function setItem(key: string, value: string) {
  await SecureStore.setItemAsync(key, value)
}

async function getItem(key: string) {
  return SecureStore.getItemAsync(key)
}

async function delItem(key: string) {
  await SecureStore.deleteItemAsync(key)
}

export const authStore = {
  async getAccessToken(): Promise<string | null> {
    return (await getItem(ACCESS_TOKEN_KEY)) ?? null
  },

  async getRefreshToken(): Promise<string | null> {
    return (await getItem(REFRESH_TOKEN_KEY)) ?? null
  },

  async setTokens(payload: {
    accessToken: string | null
    refreshToken?: string | null
    userId?: number | null
    username?: string | null
  }): Promise<void> {
    if (payload.accessToken)
      await setItem(ACCESS_TOKEN_KEY, payload.accessToken)
    else await delItem(ACCESS_TOKEN_KEY)

    if (payload.refreshToken !== undefined) {
      if (payload.refreshToken)
        await setItem(REFRESH_TOKEN_KEY, payload.refreshToken)
      else await delItem(REFRESH_TOKEN_KEY)
    }

    if (payload.userId !== undefined) {
      if (payload.userId === null) await delItem(USER_ID_KEY)
      else await setItem(USER_ID_KEY, String(payload.userId))
    }

    if (payload.username !== undefined) {
      if (!payload.username) await delItem(USERNAME_KEY)
      else await setItem(USERNAME_KEY, payload.username)
    }
  },

  async clear(): Promise<void> {
    await Promise.all([
      delItem(ACCESS_TOKEN_KEY),
      delItem(REFRESH_TOKEN_KEY),
      delItem(USER_ID_KEY),
      delItem(USERNAME_KEY),
    ])
  },

  async snapshot(): Promise<AuthSnapshot> {
    const [accessToken, refreshToken, userIdRaw, username] = await Promise.all([
      getItem(ACCESS_TOKEN_KEY),
      getItem(REFRESH_TOKEN_KEY),
      getItem(USER_ID_KEY),
      getItem(USERNAME_KEY),
    ])

    return {
      accessToken: accessToken ?? null,
      refreshToken: refreshToken ?? null,
      userId: userIdRaw ? Number(userIdRaw) : null,
      username: username ?? null,
    }
  },
}
