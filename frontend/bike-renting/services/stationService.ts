import { api } from "@/api/client"

const STATIONS_PATH = "/stations"

export type Station = {
  id: number
  name: string
  latitude: number
  longitude: number
  availableBikes: number
}

export type CoordinatesDto = {
  latitude: number
  longitude: number
}

export type CreateStationRequest = {
  name: string
  coordinates: CoordinatesDto
}

type PagedResponse<T> = {
  content: T[]
  totalPages: number
}

type StationBackendDto = {
  id: number
  name: string
  coordinates: { latitude: number; longitude: number }
  availableBicycles: number
}

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
    console.log(
      `[fetchStations] GET ${STATIONS_PATH} page=${currentPage} size=${pageSize}`,
    )

    const res = await api.get<PagedResponse<StationBackendDto>>(STATIONS_PATH, {
      params: { page: currentPage, size: pageSize },
    })

    const { content, totalPages: fetchedTotalPages } = res.data

    if (!Array.isArray(content)) {
      throw new Error("Неверный формат данных: content не является массивом.")
    }

    allStations.push(...content.map(mapStation))
    totalPages = fetchedTotalPages ?? totalPages
    currentPage += 1
  }

  console.log("[fetchStations] All stations fetched:", allStations)
  return allStations
}

export const createStation = async (
  request: CreateStationRequest,
): Promise<Station> => {
  console.log("[createStation] POST", STATIONS_PATH, "payload:", request)

  const res = await api.post<StationBackendDto>(STATIONS_PATH, request)

  console.log("[createStation] response status:", res.status)
  console.log("[createStation] response data:", res.data)

  return mapStation(res.data)
}


export const deleteStation = async (stationId: number): Promise<void> => {
  console.log(`[deleteStation] DELETE ${STATIONS_PATH}/${stationId}`)

  await api.delete(`${STATIONS_PATH}/${stationId}`)
}
