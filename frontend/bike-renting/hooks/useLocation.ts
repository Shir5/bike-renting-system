import { useCallback, useEffect, useState } from "react"
import * as Location from "expo-location"

export type LocationState = {
  latitude: number
  longitude: number
} | null

export const useLocation = () => {
  const [location, setLocation] = useState<LocationState>(null)
  const [status, setStatus] = useState<"idle" | "granted" | "denied">("idle")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestPermission = useCallback(async () => {
    setError(null)
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== "granted") {
      setStatus("denied")
      throw new Error("Доступ к местоположению не предоставлен")
    }
    setStatus("granted")
  }, [])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      if (status !== "granted") {
        await requestPermission()
      }

      const pos = await Location.getCurrentPositionAsync({})
      setLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      })
    } catch (e: any) {
      setError(e?.message ?? "Не удалось получить геолокацию")
      throw e
    } finally {
      setIsLoading(false)
    }
  }, [status, requestPermission])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { location, status, isLoading, error, requestPermission, refresh }
}
