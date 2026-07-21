import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_ID_KEY = "userId";
const USERNAME_KEY = "username";

export type AuthSnapshot = {
  accessToken: string | null;
  refreshToken: string | null;
  userId: number | null;
  username: string | null;
};

const getItem = async (key: string): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
};

const setItem = async (key: string, value: string): Promise<void> => {
  await SecureStore.setItemAsync(key, value);
};

const removeItem = async (key: string): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // ignore
  }
};

export const secureAuthStore = {
  async getAccessToken(): Promise<string | null> {
    return getItem(ACCESS_TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    return getItem(REFRESH_TOKEN_KEY);
  },

  async getUserId(): Promise<number | null> {
    const raw = await getItem(USER_ID_KEY);
    return raw ? Number(raw) : null;
  },

  async getUsername(): Promise<string | null> {
    return getItem(USERNAME_KEY);
  },

  async setAuth(payload: {
    accessToken: string;
    refreshToken?: string | null;
    userId?: number | null;
    username?: string | null;
  }): Promise<void> {
    await setItem(ACCESS_TOKEN_KEY, payload.accessToken);

    if (payload.refreshToken !== undefined) {
      if (payload.refreshToken)
        await setItem(REFRESH_TOKEN_KEY, payload.refreshToken);
      else await removeItem(REFRESH_TOKEN_KEY);
    }

    if (payload.userId !== undefined) {
      if (payload.userId === null) await removeItem(USER_ID_KEY);
      else await setItem(USER_ID_KEY, String(payload.userId));
    }

    if (payload.username !== undefined) {
      if (!payload.username) await removeItem(USERNAME_KEY);
      else await setItem(USERNAME_KEY, payload.username);
    }
  },

  async clear(): Promise<void> {
    await Promise.all([
      removeItem(ACCESS_TOKEN_KEY),
      removeItem(REFRESH_TOKEN_KEY),
      removeItem(USER_ID_KEY),
      removeItem(USERNAME_KEY),
    ]);
  },

  async snapshot(): Promise<AuthSnapshot> {
    const [accessToken, refreshToken, userId, username] = await Promise.all([
      secureAuthStore.getAccessToken(),
      secureAuthStore.getRefreshToken(),
      secureAuthStore.getUserId(),
      secureAuthStore.getUsername(),
    ]);

    return {
      accessToken,
      refreshToken,
      userId,
      username,
    };
  },
};
