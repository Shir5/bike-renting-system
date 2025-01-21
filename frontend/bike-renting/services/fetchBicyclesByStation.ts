// src/services/bicycleService.ts
import axios from 'axios';

export interface Bicycle {
    id: number;
    model: string;
    type: string; // Enum `Color` как строка
    status: string; // Enum `Status` как строка
    station: number; // ID станции
    lastServiceDate: string | null; // ISO строка даты или null
}

// Укажите базовый URL вашего API
const API_BASE_URL = 'http://92.100.188.183:24120/islabFirst-0.1/api/station/bicycle'; // Замените на ваш IP-адрес для эмулятора Android

export const fetchBicyclesByStationId = async (
    stationId: number,
    token: string | null,
    page: number = 0,
    size: number = 20,
    retries: number = 3, // Количество повторных попыток
    delay: number = 1000 // Задержка между попытками в миллисекундах
): Promise<Bicycle[]> => {
    console.log('Начало fetchBicyclesByStationId');
    console.log(`Station ID: ${stationId}`);
    console.log(`Token: ${token}`);
    console.log(`Page: ${page}`);
    console.log(`Size: ${size}`);

    if (!token) {
        console.error('Токен аутентификации отсутствует. Пожалуйста, войдите в систему.');
        throw new Error('Токен аутентификации отсутствует. Пожалуйста, войдите в систему.');
    }

    const requestUrl = `${API_BASE_URL}`;
    console.log(`Запрос к URL: ${requestUrl}`);

    console.log('Заголовки запроса:', {
        Authorization: `Bearer ${token}`,
    });
    console.log('Параметры запроса:', {
        id: stationId,
        page,
        size,
    });

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await axios.get(requestUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    id: stationId,
                    page,
                    size,
                },
                timeout: 20000, // Тайм-аут в 20 секунд
            });

            console.log(`Ответ от сервера: Статус ${response.status}`);
            console.log('Данные ответа:', response.data);

            if (!response.data || !response.data.content) {
                console.warn('В ответе отсутствует поле `content`');
                throw new Error('Неверный формат ответа от сервера.');
            }

            const bicycles: Bicycle[] = response.data.content.map((bicycleDto: any) => ({
                id: bicycleDto.id,
                model: bicycleDto.model,
                type: bicycleDto.type,
                status: bicycleDto.status,
                station: bicycleDto.station,
            }));

            console.log('Преобразованные велосипеды:', bicycles);

            return bicycles;
        } catch (error: any) {
            if (attempt < retries) {
                console.warn(`Попытка ${attempt} не удалась. Повтор через ${delay} мс...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
                if (error.response) {
                    console.error('Ошибка от сервера:', {
                        статус: error.response.status,
                        данные: error.response.data,
                        заголовки: error.response.headers,
                    });
                    if (error.response.data && error.response.data.message) {
                        console.error('Сообщение ошибки от сервера:', error.response.data.message);
                    }
                } else if (error.request) {
                    console.error('Запрос был отправлен, но ответа не получено:', error.request);
                } else {
                    console.error('Ошибка при настройке запроса:', error.message);
                }

                console.error('Полная ошибка:', error);

                if (error.response && error.response.data && error.response.data.message) {
                    throw new Error(error.response.data.message);
                }
                throw new Error('Не удалось загрузить велосипеды.');
            }
        }
    }

    console.log('Завершение fetchBicyclesByStationId');
    return []; // Это никогда не будет выполнено, так как функция либо возвращает данные, либо выбрасывает ошибку
};
