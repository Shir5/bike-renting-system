import axios from 'axios';

const API_URL = 'http://178.69.216.14:24120/islabFirst-0.1/api/station';

export type Station = {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    availableBikes: number;
};

export type CoordinatesDto = {
    latitude: number;
    longitude: number;
};

export type CreateStationRequest = {
    name: string;
    coordinates: CoordinatesDto;
};

/**
 * Функция для получения списка станций (с постраничной загрузкой).
 */
export const fetchStations = async (token: string | null): Promise<Station[]> => {
    if (!token) {
        throw new Error('Токен отсутствует');
    }

    try {
        let currentPage = 0;
        const pageSize = 50;
        let totalPages = 1;
        const allStations: Station[] = [];

        while (currentPage < totalPages) {
            console.log(`Fetching stations: page ${currentPage}, size ${pageSize}`);
            const response = await axios.get(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: { page: currentPage, size: pageSize },
            });

            console.log('Response data:', response.data);

            const { content, totalPages: fetchedTotalPages } = response.data;

            if (!content || !Array.isArray(content)) {
                throw new Error('Неверный формат данных: content не является массивом.');
            }

            allStations.push(
                ...content.map((station: any) => ({
                    id: station.id,
                    name: station.name,
                    latitude: station.coordinates.latitude,
                    longitude: station.coordinates.longitude,
                    availableBikes: station.availableBicycles,
                }))
            );

            totalPages = fetchedTotalPages;
            currentPage += 1;
        }

        console.log('All stations fetched:', allStations);
        return allStations;
    } catch (error: any) {
        if (error.response && error.response.status === 403) {
            console.error('Ошибка авторизации: доступ запрещен.');
            throw new Error('Доступ запрещен. Проверьте токен авторизации.');
        }
        console.error('Ошибка при загрузке станций:', error);
        throw new Error('Не удалось загрузить станции.');
    }
};

/**
 * Функция для создания станции
 */
export const createStation = async (
    request: CreateStationRequest,
    token: string | null
): Promise<Station> => {
    if (!token) {
        throw new Error('Токен отсутствует');
    }

    try {
        console.log('Creating station with payload:', request);
        const response = await axios.post(API_URL, request, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log('Response from createStation:', response.data);
        const station = response.data;
        return {
            id: station.id,
            name: station.name,
            latitude: station.coordinates.latitude,
            longitude: station.coordinates.longitude,
            availableBikes: station.availableBicycles,
        };
    } catch (error: any) {
        if (error.response && error.response.status === 403) {
            console.error('Ошибка авторизации: доступ запрещен.');
            throw new Error('Доступ запрещен. Проверьте токен авторизации.');
        }
        console.error('Ошибка при создании станции:', error);
        throw new Error('Не удалось создать станцию.');
    }
};

/**
 * Функция для удаления станции по ID
 */
export const deleteStation = async (
    stationId: number,
    token: string | null
): Promise<void> => {
    if (!token) {
        throw new Error('Токен отсутствует');
    }

    try {
        console.log(`Deleting station with ID=${stationId}`);
        await axios.delete(`${API_URL}/${stationId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        console.log(`Station #${stationId} deleted successfully`);
    } catch (error: any) {
        if (error.response && error.response.status === 403) {
            console.error('Ошибка авторизации: доступ запрещен.');
            throw new Error('Доступ запрещен. Проверьте токен авторизации.');
        }
        console.error('Ошибка при удалении станции:', error);
        throw new Error('Не удалось удалить станцию.');
    }
};
