import { useCallback, useEffect, useState } from "react";
import { fetchStations, Station } from "@/services/stationService";

export const useStations = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchStations();
      setStations(data);
    } catch (e: any) {
      setError(e?.message ?? "Не удалось загрузить станции");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { stations, isLoading, error, reload };
};
