import { useCallback, useEffect, useRef, useState } from "react"
import { AppState, AppStateStatus } from "react-native"
import * as Location from "expo-location"

export type LocationState = {
  latitude: number
  longitude: number
} | null

type Status = "idle" | "granted" | "denied"

export const useLocation = (opts?: {
  autoStart?: boolean
  refreshOnAppActive?: boolean
  accuracy?: Location.LocationAccuracy
}) => {
  const {
    autoStart = true,
    refreshOnAppActive = true,
    accuracy = Location.LocationAccuracy.Balanced,
  } = opts ?? {}

  const [location, setLocation] = useState<LocationState>(null)
  const [status, setStatus] = useState<Status>("idle")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // защита от параллельных refresh
  const inFlightRef = useRef<Promise<LocationState> | null>(null)

  const requestPermission = useCallback(async (): Promise<Status> => {
    try {
      setError(null)

      // Сначала проверим текущее состояние (не всегда нужно заново спрашивать)
      const current = await Location.getForegroundPermissionsAsync()
      if (current.status === "granted") {
        setStatus("granted")
        return "granted"
      }

      const req = await Location.requestForegroundPermissionsAsync()
      if (req.status !== "granted") {
        setStatus("denied")
        setError("Доступ к местоположению не предоставлен")
        return "denied"
      }

      setStatus("granted")
      return "granted"
    } catch {
      setStatus("idle")
      setError("Не удалось запросить разрешение на геолокацию")
      return "idle"
    }
  }, [])

  const refresh = useCallback(async (): Promise<LocationState> => {
    if (inFlightRef.current) return inFlightRef.current

    inFlightRef.current = (async () => {
      setIsLoading(true)
      setError(null)

      try {
        const perm = await requestPermission()
        if (perm !== "granted") {
          // НЕ throw — просто возвращаем null и записываем error
          return null
        }

        const pos = await Location.getCurrentPositionAsync({ accuracy })

        const next = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }

        setLocation(next)
        return next
      } catch {
        setError("Не удалось получить геолокацию")
        return null
      } finally {
        setIsLoading(false)
        inFlightRef.current = null
      }
    })()

    return inFlightRef.current
  }, [accuracy, requestPermission])

  // автостарт
  useEffect(() => {
    if (!autoStart) return
    void refresh()
  }, [autoStart, refresh])

  // AppState -> refresh при возврате в active
  useEffect(() => {
    if (!refreshOnAppActive) return

    const onChange = (s: AppStateStatus) => {
      if (s === "active") void refresh()
    }

    const sub = AppState.addEventListener("change", onChange)
    return () => sub.remove()
  }, [refreshOnAppActive, refresh])

  return { location, status, isLoading, error, requestPermission, refresh }
}
