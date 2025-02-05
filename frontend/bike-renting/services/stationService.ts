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

export const fetchStations = async (token: string | null): Promise<Station[]> => {
    if (!token) {
        throw new Error('Токен отсутствует');
    }

    try {
        let currentPage = 0; // Начальная страница
        const pageSize = 50; // Размер страницы
        let totalPages = 1; // Общее количество страниц (обновится после первого запроса)
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
        // Map the returned data to our Station type
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
