import { api } from "@/api/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

export type CurrentRental = {
  id: number;
  bicycleId: number;
  startStationId: number;
  startedAt: string; // ISO
  secondsElapsed: number;
};

type RentalDto = {
  id: number;
  bicycleId: number;
  startStationId: number;
  startedAt: string; // ISO
  // могут быть и другие поля
};

export type UseRentalsResult = {
  currentRental: CurrentRental | null;
  isLoading: boolean;
  error: string | null;

  // действия
  restore: () => Promise<void>;
  startRental: (bikeId: number, stationId: number) => Promise<CurrentRental>;
  stopRental: (
    rentalId: number,
    stationId: number,
    cost: number,
  ) => Promise<void>;

  // утилиты
  reset: () => void;
};

/**
 * Контракт:
 * - Хук сам держит currentRental
 * - Хук сам ведёт secondsElapsed (таймер) пока аренда активна
 * - Экран только вызывает start/stop и читает currentRental.secondsElapsed
 */
export function useRentals(): UseRentalsResult {
  const [currentRental, setCurrentRental] = useState<CurrentRental | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Чтобы не было гонок при быстрых кликах
  const opIdRef = useRef(0);

  // --- helpers ---
  const computeElapsed = useCallback((startedAtIso: string) => {
    const startedAtMs = Date.parse(startedAtIso);
    if (Number.isNaN(startedAtMs)) return 0;
    const diffSec = Math.floor((Date.now() - startedAtMs) / 1000);
    return Math.max(0, diffSec);
  }, []);

  const normalizeRental = useCallback(
    (dto: RentalDto): CurrentRental => {
      return {
        id: dto.id,
        bicycleId: dto.bicycleId,
        startStationId: dto.startStationId,
        startedAt: dto.startedAt,
        secondsElapsed: computeElapsed(dto.startedAt),
      };
    },
    [computeElapsed],
  );

  // --- timer: только если есть активная аренда ---
  useEffect(() => {
    if (!currentRental) return;

    const intervalId = setInterval(() => {
      setCurrentRental((prev) => {
        if (!prev) return prev;
        return { ...prev, secondsElapsed: computeElapsed(prev.startedAt) };
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [currentRental, computeElapsed]);

  // --- refresh elapsed when app comes to foreground ---
  useEffect(() => {
    const onChange = (state: AppStateStatus) => {
      if (state !== "active") return;
      setCurrentRental((prev) => {
        if (!prev) return prev;
        return { ...prev, secondsElapsed: computeElapsed(prev.startedAt) };
      });
    };

    const sub = AppState.addEventListener("change", onChange);
    return () => sub.remove();
  }, [computeElapsed]);

  // --- public api ---
  const reset = useCallback(() => {
    setCurrentRental(null);
    setError(null);
    setIsLoading(false);
  }, []);

  /**
   * restore() — пытается восстановить активную аренду с сервера (если есть endpoint).
   * Если у тебя такого endpoint нет — удаляй restore и всё, но тогда после перезапуска
   * приложение не узнает о текущей аренде.
   */
  const restore = useCallback(async () => {
    const opId = ++opIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      // ВАРИАНТ 1 (рекомендуется): сервер возвращает активную аренду текущего пользователя
      // GET /rentals/current -> RentalDto | null
      const res = await api.get<RentalDto | null>("/rentals/current");

      // Если за время запроса стартанула другая операция — игнорим
      if (opId !== opIdRef.current) return;

      if (!res.data) {
        setCurrentRental(null);
        return;
      }

      setCurrentRental(normalizeRental(res.data));
    } catch (e: any) {
      if (opId !== opIdRef.current) return;
      setError(e?.message || "Не удалось восстановить аренду");
    } finally {
      if (opId !== opIdRef.current) return;
      setIsLoading(false);
    }
  }, [normalizeRental]);

  const startRental = useCallback(
    async (bikeId: number, stationId: number) => {
      const opId = ++opIdRef.current;
      setIsLoading(true);
      setError(null);

      try {
        // POST /rentals -> RentalDto
        const res = await api.post<RentalDto>("/rentals", {
          bicycleId: bikeId,
          startStationId: stationId,
        });

        if (opId !== opIdRef.current) {
          // даже если игнорим, вернем нормальный объект, чтобы вызывающий мог продолжить
          return normalizeRental(res.data);
        }

        const normalized = normalizeRental(res.data);
        setCurrentRental(normalized);
        return normalized;
      } catch (e: any) {
        if (opId === opIdRef.current) {
          setError(e?.message || "Не удалось начать аренду");
        }
        throw e;
      } finally {
        if (opId === opIdRef.current) setIsLoading(false);
      }
    },
    [normalizeRental],
  );

  const stopRental = useCallback(
    async (rentalId: number, stationId: number, cost: number) => {
      const opId = ++opIdRef.current;
      setIsLoading(true);
      setError(null);

      try {
        // PUT /rentals/:id/stop (или PATCH) — подстрой под свой API
        await api.put(`/rentals/${rentalId}/stop`, {
          endStationId: stationId,
          cost,
        });

        if (opId !== opIdRef.current) return;

        // Сбрасываем аренду на клиенте
        setCurrentRental(null);
      } catch (e: any) {
        if (opId === opIdRef.current) {
          setError(e?.message || "Не удалось завершить аренду");
        }
        throw e;
      } finally {
        if (opId === opIdRef.current) setIsLoading(false);
      }
    },
    [],
  );

  // Опционально: удобные derived значения
  const result = useMemo<UseRentalsResult>(
    () => ({
      currentRental,
      isLoading,
      error,
      restore,
      startRental,
      stopRental,
      reset,
    }),
    [currentRental, isLoading, error, restore, startRental, stopRental, reset],
  );

  return result;
}
