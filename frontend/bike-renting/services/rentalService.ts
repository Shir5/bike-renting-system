import { api } from "@/api/client";

export type RentalDto = any;

export type CreateRentalRequest = {
  user: number;
  bicycle: number;
  start_station: number;
};

export type UpdateRentalRequest = {
  user: number;
  bicycle: number;
  end_station: number;
  cost: number;
};

export async function createRental(
  userId: number,
  bicycleId: number,
  startStationId: number,
): Promise<RentalDto> {
  const body: CreateRentalRequest = {
    user: userId,
    bicycle: bicycleId,
    start_station: startStationId,
  };

  console.log("[createRental] POST /rental payload:", body);

  // Если сервер возвращает что-то типа RentalDto — укажи тип: api.post<RentalDto>
  const res = await api.post<RentalDto>("/rental", body);

  console.log("[createRental] response status:", res.status);
  console.log("[createRental] response data:", res.data);

  return res.data;
}

export async function updateRental(
  rentalId: number,
  userId: number,
  bicycleId: number,
  endStationId: number,
  cost: number,
): Promise<RentalDto> {
  const body: UpdateRentalRequest = {
    user: userId,
    bicycle: bicycleId,
    end_station: endStationId,
    cost,
  };

  console.log(`[updateRental] PUT /rental/${rentalId} payload:`, body);

  const res = await api.put<RentalDto>(`/rental/${rentalId}`, body);

  console.log("[updateRental] response status:", res.status);
  console.log("[updateRental] response data:", res.data);

  return res.data;
}
