import axios from 'axios';

const API_URL = 'http://92.100.188.183:24120/islabFirst-0.1/api/station';

export type Station = {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    availableBikes: number;
};
export const fetchStations = async (token: string | null): Promise<Station[]> => {
    if (!token) {
        throw new Error('Токен отсутствует');
    }

    try {
        let currentPage = 0; // Начальная страница
        const pageSize = 50; // Размер страницы (настраиваемый параметр, зависит от API)
        let totalPages = 1; // Общее количество страниц, обновится после первого запроса
        const allStations: Station[] = []; // Сюда будем собирать все станции

        while (currentPage < totalPages) {
            const response = await axios.get(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: { page: currentPage, size: pageSize }, // Передаем параметры пагинации
            });

            const { content, totalPages: fetchedTotalPages } = response.data;

            if (!content || !Array.isArray(content)) {
                throw new Error('Неверный формат данных: content не является массивом.');
            }

            // Добавляем текущую страницу в общий массив
            allStations.push(
                ...content.map((station: any) => ({
                    id: station.id,
                    name: station.name,
                    latitude: station.coordinates.latitude,
                    longitude: station.coordinates.longitude,
                    availableBikes: station.availableBicycles,
                }))
            );

            // Обновляем параметры для следующего запроса
            totalPages = fetchedTotalPages; // Общее количество страниц
            currentPage += 1; // Переходим к следующей странице
        }

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
