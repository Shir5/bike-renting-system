import { api } from "@/api/client";

/**
 * POST /api/v1/bicycles
 */
export type CreateBicycleRequest = {
  model: string;
  type: string;
  status: string;
  stationId: number;
};

export interface Bicycle {
  id: number;
  model: string;
  type: string;
  status: string;
  station: number;
  lastServiceDate: string | null;
  mileage?: number;
  repairId?: number | null;
}

export interface RepairDto {
  id: number;
  bicycle: number;
  technician: number;
  description: string;
  status: string;
  started_at?: string | null;
  ended_at?: string | null;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

/**
 * POST /api/v1/repairs
 */
export interface CreateRepairRequest {
  bicycleId: number;
  technicianId: number;
  description: string;
}

/**
 * -------------------------
 * BICYCLES
 * -------------------------
 */
export const addBicycle = async (
  request: CreateBicycleRequest,
): Promise<Bicycle> => {
  console.log("[addBicycle] POST /bicycles payload:", request);
  const response = await api.post<Bicycle>("/bicycles", request);
  return response.data;
};

export const deleteBicycle = async (bicycleId: number): Promise<void> => {
  console.log(`[deleteBicycle] DELETE /bicycles/${bicycleId}`);
  await api.delete(`/bicycles/${bicycleId}`);
};

/**
 * -------------------------
 * REPAIRS
 * -------------------------
 */
export const createRepair = async (
  request: CreateRepairRequest,
): Promise<RepairDto> => {
  console.log("[createRepair] POST /repairs payload:", request);
  const response = await api.post<RepairDto>("/repairs", request);
  return response.data;
};

export const completeRepair = async (repairId: number): Promise<RepairDto> => {
  console.log(`[completeRepair] PUT /repairs/${repairId}/complete`);
  const response = await api.put<RepairDto>(
    `/repairs/${repairId}/complete`,
    null,
  );
  return response.data;
};

export const fetchRepairsPage = async (
  page: number,
  size: number,
): Promise<PagedResponse<RepairDto>> => {
  console.log(`[fetchRepairsPage] GET /repairs page=${page}, size=${size}`);
  const response = await api.get<PagedResponse<RepairDto>>("/repairs", {
    params: { page, size },
  });
  return response.data;
};

export const fetchRepairs = async (): Promise<PagedResponse<RepairDto>> => {
  return fetchRepairsPage(0, 20);
};
