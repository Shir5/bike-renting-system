import { useCallback, useEffect, useMemo, useState } from "react";
import * as Location from "expo-location";
import type { AppStateStatus } from "react-native";
import { AppState } from "react-native";

export type LocationStatus =
  | "unknown"
  | "granted"
  | "denied"
  | "blocked"
  | "requesting"
  | "error";

export type UserLocation = { latitude: number; longitude: number } | null;

export function useLocation(options?: { watchAppState?: boolean }) {
  const [status, setStatus] = useState<LocationStatus>("unknown");
  const [location, setLocation] = useState<UserLocation>(null);
  const [error, setError] = useState<string | null>(null);

  const requestPermission = useCallback(async () => {
    setStatus("requesting");
    setError(null);

    const res = await Location.requestForegroundPermissionsAsync();

    if (res.status === "granted") {
      setStatus("granted");
      return true;
    }

    // iOS/Android: если пользователь запретил, обычно это "denied".
    // "blocked" трактуем как "не дадут без Settings" (heuristic).
    setStatus(res.canAskAgain ? "denied" : "blocked");
    return false;
  }, []);

  const refresh = useCallback(async () => {
    try {
      setError(null);

      const perm = await Location.getForegroundPermissionsAsync();
      if (perm.status !== "granted") {
        setStatus(perm.canAskAgain ? "denied" : "blocked");
        setLocation(null);
        return false;
      }

      setStatus("granted");
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      return true;
    } catch (e: any) {
      setStatus("error");
      setError(e?.message ?? "Location error");
      return false;
    }
  }, []);

  // Опционально: обновлять координаты при возврате приложения в active
  useEffect(() => {
    if (!options?.watchAppState) return;

    const onChange = async (next: AppStateStatus) => {
      if (next === "active") await refresh();
    };
    const sub = AppState.addEventListener("change", onChange);
    return () => sub.remove();
  }, [options?.watchAppState, refresh]);

  return useMemo(
    () => ({ status, location, error, requestPermission, refresh }),
    [status, location, error, requestPermission, refresh],
  );
}
