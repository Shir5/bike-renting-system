import type { AxiosError } from "axios"
import { toAppError } from "@/api/errors"
import { api } from "@/api/client"

export interface Bicycle {
  repairId: number | null
  id: number
  model: string
  type: string
  status: string
  station: number
  lastServiceDate: string | null
  mileage?: number
}

type PagedResponse<T> = {
  content: T[]
  totalElements?: number
  totalPages?: number
  number?: number
  size?: number
}

type BicycleDto = {
  repairId?: number | null
  id: number
  model: string
  type: string
  status: string
  station?: number | { id: number }
  stationId?: number
  lastServiceDate?: string | null
  mileage?: number
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const shouldRetry = (error: unknown): boolean => {
  const axiosErr = error as AxiosError<any>

  // сеть/timeout: нет response
  if (!axiosErr?.response) return true

  const status = axiosErr.response.status

  // 401 обрабатывается интерсептором (refresh+retry). Здесь не ретраим.
  if (status === 401) return false

  // 5xx и 429 можно ретраить
  if (status >= 500) return true
  if (status === 429) return true

  // 4xx обычно ошибка запроса — не ретраим
  return false
}


export const fetchBicyclesByStationId = async (
  stationId: number,
  page: number = 0,
  size: number = 20,
  retries: number = 3,
  delay: number = 1000,
): Promise<Bicycle[]> => {
  const url = `/stations/${stationId}/bicycles`

  console.log("[fetchBicyclesByStationId] start", { stationId, page, size })

  let lastError: unknown = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await api.get<PagedResponse<BicycleDto>>(url, {
        params: { page, size },
      })

      const data = res.data
      if (!data?.content || !Array.isArray(data.content)) {
        throw new Error("Неверный формат ответа от сервера: нет content[]")
      }

      const bicycles: Bicycle[] = data.content.map((dto) => ({
        repairId: dto.repairId ?? null,
        id: dto.id,
        model: dto.model,
        type: dto.type,
        status: dto.status,
        station:
          (typeof dto.station === "object" ? dto.station?.id : dto.station) ??
          dto.stationId ??
          0,
        lastServiceDate: dto.lastServiceDate ?? null,
        mileage: dto.mileage,
      }))

      console.log("[fetchBicyclesByStationId] ok", {
        status: res.status,
        count: bicycles.length,
      })

      return bicycles
    } catch (e) {
      lastError = e

      const canRetry = attempt < retries && shouldRetry(e)
      if (canRetry) {
        console.warn(
          `[fetchBicyclesByStationId] attempt ${attempt} failed, retry in ${delay}ms`,
        )
        await sleep(delay)
        continue
      }

      // Нормализуем ошибку
      const appErr = toAppError(e)
      console.error("[fetchBicyclesByStationId] failed", {
        attempt,
        status: appErr.status,
        path: appErr.path,
        code: appErr.code,
        message: appErr.message,
      })

      throw appErr
    }
  }

  throw toAppError(lastError)
}
