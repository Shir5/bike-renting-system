import { api } from "@/api/client"
import { z } from "zod"
import { schemas } from "@/api/generated"

const STATIONS_PATH = "/stations"

// UI-модель
export type Station = {
  id: number
  name: string
  latitude: number
  longitude: number
  availableBikes: number
}

// типы запросов — из generated (zod -> infer)
export type CoordinatesDto = z.infer<typeof schemas.CoordinatesDto>
export type CreateStationRequest = z.infer<typeof schemas.CreateStationRequest>

// локальные схемы ответа (временно, потому что generated response = void)
const StationBackendDtoSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  coordinates: schemas.CoordinatesDto,
  availableBicycles: z.number().int(),
})

type StationBackendDto = z.infer<typeof StationBackendDtoSchema>

const PagedResponseSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    content: z.array(item),
    totalPages: z.number().int(),
  })

const mapStation = (station: StationBackendDto): Station => ({
  id: station.id,
  name: station.name,
  latitude: station.coordinates.latitude,
  longitude: station.coordinates.longitude,
  availableBikes: station.availableBicycles,
})

export const fetchStations = async (): Promise<Station[]> => {
  let currentPage = 0
  const pageSize = 50
  let totalPages = 1
  const allStations: Station[] = []

  while (currentPage < totalPages) {
    const res = await api.get(STATIONS_PATH, {
      params: { page: currentPage, size: pageSize },
    })

    const page = PagedResponseSchema(StationBackendDtoSchema).parse(res.data)

    allStations.push(...page.content.map(mapStation))
    totalPages = page.totalPages
    currentPage += 1
  }

  return allStations
}

export const createStation = async (
  request: CreateStationRequest,
): Promise<Station> => {
  // валидируем request схемой из generated
  const payload = schemas.CreateStationRequest.parse(request)

  const res = await api.post(STATIONS_PATH, payload)

  // валидируем ответ локальной схемой
  const dto = StationBackendDtoSchema.parse(res.data)

  return mapStation(dto)
}

export const deleteStation = async (stationId: number): Promise<void> => {
  await api.delete(`${STATIONS_PATH}/${stationId}`)
}
