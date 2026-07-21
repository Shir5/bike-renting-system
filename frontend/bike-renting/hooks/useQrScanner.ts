import { useCallback, useMemo, useState } from "react";
import { useCameraPermissions } from "expo-camera";

export type QrScannerState =
  | "idle"
  | "need_permission"
  | "requesting_permission"
  | "ready"
  | "error";

export const useQrScanner = () => {
  const [permission, requestPermissionBase] = useCameraPermissions();

  const [error, setError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  const status: QrScannerState = useMemo(() => {
    if (error) return "error";
    if (isRequesting) return "requesting_permission";
    if (!permission) return "idle";
    if (!permission.granted) return "need_permission";
    return "ready";
  }, [permission, isRequesting, error]);

  const requestPermission = useCallback(async () => {
    setError(null);
    setIsRequesting(true);
    try {
      const res = await requestPermissionBase();
      if (!res.granted) {
        setError("Доступ к камере не предоставлен.");
      }
      return res;
    } catch (e: any) {
      setError(e?.message ?? "Не удалось запросить доступ к камере.");
      return null;
    } finally {
      setIsRequesting(false);
    }
  }, [requestPermissionBase]);

  const resetError = useCallback(() => setError(null), []);

  return {
    permission, // { granted, canAskAgain, ... }
    status, // UI state machine
    error,
    requestPermission,
    resetError,
  };
};
