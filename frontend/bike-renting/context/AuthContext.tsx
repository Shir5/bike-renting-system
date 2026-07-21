import React, { createContext, ReactNode, useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import type { AuthSnapshot } from "@/api/secureAuthStore";

export type AuthContextType = {
  // старое
  userToken: string | null;
  user: number | null;
  login: (token: string, userId: number) => Promise<void>;
  logout: () => Promise<void>;

  // новое (может пригодиться дальше)
  refreshToken: string | null;
  username: string | null;
  isReady: boolean;
  signIn: (payload: { username: string; password: string }) => Promise<void>;
  signUp: (payload: { username: string; password: string }) => Promise<void>;

  // FIX: соответствует useAuth.restoreSession
  restoreSession: () => Promise<AuthSnapshot>;
};

export const AuthContext = createContext<AuthContextType>({
  userToken: null,
  user: null,
  login: async () => {},
  logout: async () => {},

  refreshToken: null,
  username: null,
  isReady: false,
  signIn: async () => {},
  signUp: async () => {},
  restoreSession: async () => ({
    accessToken: null,
    refreshToken: null,
    userId: null,
    username: null,
  }),
});

type Props = { children: ReactNode };

export function AuthProvider({ children }: Props) {
  const {
    accessToken,
    refreshToken,
    userId,
    username,
    isReady,
    restoreSession,
    signIn,
    signUp,
    signOut,
    setSession,
  } = useAuth();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (!isReady) {
    return (
      <ActivityIndicator
        size="large"
        color="#0000ff"
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      />
    );
  }

  return (
    <AuthContext.Provider
      value={{
        // старое API (совместимость)
        userToken: accessToken,
        user: userId,
        login: async (token: string, id: number) => {
          await setSession({
            accessToken: token,
            userId: id,
          });
        },
        logout: async () => {
          await signOut();
        },

        // новое API
        refreshToken,
        username,
        isReady,
        restoreSession,
        signIn,
        signUp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
