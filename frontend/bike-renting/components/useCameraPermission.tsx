import { useCallback, useMemo, useState } from "react";
import { Camera } from "expo-camera";

export type CameraStatus =
  | "unknown"
  | "granted"
  | "denied"
  | "blocked"
  | "requesting";

export function useCameraPermission() {
  const [status, setStatus] = useState<CameraStatus>("unknown");

  const requestPermission = useCallback(async () => {
    setStatus("requesting");
    const res = await Camera.requestCameraPermissionsAsync();
    if (res.status === "granted") {
      setStatus("granted");
      return true;
    }
    setStatus(res.canAskAgain ? "denied" : "blocked");
    return false;
  }, []);

  return useMemo(
    () => ({ status, requestPermission }),
    [status, requestPermission],
  );
}
