import { useCallback, useEffect, useMemo, useState } from "react"
import { secureAuthStore, AuthSnapshot } from "@/api/secureAuthStore"
import { loginUser, registerUser } from "@/services/authApi"

export type UseAuthState = AuthSnapshot & {
  isReady: boolean
}

export const useAuth = () => {
  const [state, setState] = useState<UseAuthState>({
    accessToken: null,
    refreshToken: null,
    userId: null,
    username: null,
    isReady: false,
  })

  // 1) Restore from SecureStore on app start
  const restoreSession = useCallback(async (): Promise<AuthSnapshot> => {
    const snap = await secureAuthStore.snapshot()
    setState({ ...snap, isReady: true })
    return snap
  }, [])

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  // 2) IMPORTANT: compatibility layer (old AuthContext.login(token, id))
  // Use when you already have token/userId (e.g., legacy login screen)
  const setSession = useCallback(
    async (payload: {
      accessToken: string
      refreshToken?: string | null
      userId: number
      username?: string | null
    }) => {
      await secureAuthStore.setAuth({
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken ?? null,
        userId: payload.userId,
        username: payload.username ?? null,
      })

      setState((prev) => ({
        ...prev,
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken ?? prev.refreshToken ?? null,
        userId: payload.userId,
        username: payload.username ?? prev.username ?? null,
        isReady: true,
      }))
    },
    [],
  )

  // 3) SignIn: via backend
  const signIn = useCallback(
    async (payload: { username: string; password: string }) => {
      const res = await loginUser(payload)

      await secureAuthStore.setAuth({
        accessToken: res.access_token,
        refreshToken: res.refresh_token ?? null,
        userId: res.user_id,
        username: res.username ?? payload.username,
      })

      setState({
        accessToken: res.access_token,
        refreshToken: res.refresh_token ?? null,
        userId: res.user_id,
        username: res.username ?? payload.username,
        isReady: true,
      })
    },
    [],
  )

  // 4) SignUp: via backend
  const signUp = useCallback(
    async (payload: { username: string; password: string }) => {
      const res = await registerUser(payload)

      await secureAuthStore.setAuth({
        accessToken: res.access_token,
        refreshToken: res.refresh_token ?? null,
        userId: res.user_id,
        username: res.username ?? payload.username,
      })

      setState({
        accessToken: res.access_token,
        refreshToken: res.refresh_token ?? null,
        userId: res.user_id,
        username: res.username ?? payload.username,
        isReady: true,
      })
    },
    [],
  )

  // 5) SignOut
  const signOut = useCallback(async () => {
    await secureAuthStore.clear()
    setState({
      accessToken: null,
      refreshToken: null,
      userId: null,
      username: null,
      isReady: true,
    })
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      setSession,
      signIn,
      signUp,
      signOut,
      restoreSession,
    }),
    [state, setSession, signIn, signUp, signOut, restoreSession],
  )

  return value
}
