import axios from 'axios';

/**
 * Базовый URL для операций с велосипедами:
 */
const API_URL = 'http://178.69.216.14:24120/islabFirst-0.1/api/bicycle';

/**
 * Базовый URL для операций с ремонтами:
 */
const REPAIR_API_URL = 'http://178.69.216.14:24120/islabFirst-0.1/api/repair';

/**
 * Параметры для создания велосипеда.
 */
export type CreateBicycleRequest = {
    model: string;
    type: string;
    status: string;
    station: number;
};

/**
 * Модель велосипеда, возвращаемая сервером.
 */
export interface Bicycle {
    id: number;
    model: string;
    type: string;
    status: string;
    station: number;
    lastServiceDate: string | null;
    // Связанный ремонт, если велосипед находится в ремонте (необязательно)
    repairId?: number;
}

/**
 * DTO, соответствующий RepairDto на бэкенде:
 * public record RepairDto(
 *   Long id,
 *   Long bicycle,
 *   Long technician,
 *   String description,
 *   String status
 * ) {}
 */
export interface RepairDto {
    id: number;
    bicycle: number;
    technician: number;
    description: string;
    status: string;
}

/**
 * Тип для результата запроса Page<RepairDto> (пагинация от Spring Data).
 */
export interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number; // текущая страница (начинается с 0)
    size: number;   // размер страницы
}

/**
 * Запрос на создание ремонта (CreateRepairRequest):
 * включает поля "bicycle", "technician" и "description".
 */
export interface CreateRepairRequest {
    bicycle: number;
    technician: number;
    description: string;
}

/**
 * Запрос на обновление ремонта (UpdateRepairRequest).
 * Сервер ожидает поле "bicycle", если нужно вернуть велосипед с ремонта.
 */
export interface UpdateRepairRequest {
    bicycle: number;
}

/**
 * Функция для создания велосипеда.
 */
export const addBicycle = async (
    request: CreateBicycleRequest,
    token: string | null
): Promise<Bicycle> => {
    if (!token) {
        throw new Error('Токен отсутствует');
    }

    console.log('[addBicycle] Отправка запроса на создание велосипеда с payload:', request);
    try {
        const response = await axios.post(API_URL, request, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('[addBicycle] Получен ответ:', response.data);
        return response.data;
    } catch (error) {
        console.error('[addBicycle] Ошибка при создании велосипеда. Payload:', request, 'Ошибка:', error);
        throw error;
    }
};

/**
 * Функция для удаления велосипеда по ID.
 */
export const deleteBicycle = async (
    bicycleId: number,
    token: string | null
): Promise<void> => {
    if (!token) {
        throw new Error('Токен отсутствует');
    }

    console.log(`[deleteBicycle] Удаление велосипеда с ID=${bicycleId}`);
    try {
        await axios.delete(`${API_URL}/${bicycleId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        console.log(`[deleteBicycle] Велосипед #${bicycleId} успешно удалён`);
    } catch (error) {
        console.error(`[deleteBicycle] Ошибка при удалении велосипеда #${bicycleId}:`, error);
        throw error;
    }
};

/**
 * Функция для получения ОДНОЙ страницы ремонта (Page<RepairDto>).
 * Можно задать page/size для контроля пагинации.
 */
export async function fetchRepairsPage(
    token: string | null,
    page: number,
    size: number
): Promise<PagedResponse<RepairDto>> {
    if (!token) {
        throw new Error('Токен отсутствует');
    }

    console.log(`[fetchRepairsPage] Запрос страницы ремонтов: page=${page}, size=${size}`);
    try {
        const response = await axios.get<PagedResponse<RepairDto>>(
            `${REPAIR_API_URL}?page=${page}&size=${size}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log(`[fetchRepairsPage] Получен ответ:`, response.data);
        return response.data;
    } catch (error) {
        console.error('[fetchRepairsPage] Ошибка:', error);
        throw error;
    }
}

/**
 * Функция для получения только первой страницы (не задавая size).
 */
export async function fetchRepairs(token: string | null): Promise<PagedResponse<RepairDto>> {
    return fetchRepairsPage(token, 0, 20);
}

/**
 * Функция, которая в цикле загружает все страницы ремонтов (до totalPages).
 */
export async function fetchAllRepairs(token: string | null, pageSize = 50): Promise<RepairDto[]> {
    if (!token) {
        throw new Error('Токен отсутствует');
    }

    console.log('[fetchAllRepairs] Начинаем загрузку всех ремонтов (постранично)...');

    let allRepairs: RepairDto[] = [];
    let currentPage = 0;
    let totalPages = 1; // Узнаем после первого запроса

    while (currentPage < totalPages) {
        const pageData = await fetchRepairsPage(token, currentPage, pageSize);
        allRepairs = allRepairs.concat(pageData.content);

        totalPages = pageData.totalPages;
        console.log(`[fetchAllRepairs] Загружена страница ${pageData.number}, всего страниц: ${totalPages}`);

        currentPage++;
    }

    console.log(`[fetchAllRepairs] Всего получено записей: ${allRepairs.length}`);
    return allRepairs;
}

/**
 * Функция для создания записи ремонта (отправка велосипеда в ремонт).
 */
export const createRepair = async (
    request: CreateRepairRequest,
    token: string | null
): Promise<RepairDto> => {
    if (!token) {
        throw new Error('Токен отсутствует');
    }

    console.log('[createRepair] Отправка запроса на создание записи ремонта с payload:', request);
    try {
        const response = await axios.post(REPAIR_API_URL, request, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        console.log('[createRepair] Получен ответ:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('[createRepair] Ошибка при отправке велосипеда в ремонт. Payload:', request, 'Ошибка:', error);
        throw error;
    }
};

/**
 * Функция для обновления записи ремонта (например, возврат велосипеда с ремонта).
 */
export const updateRepair = async (
    repairId: number,
    request: UpdateRepairRequest,
    token: string | null
): Promise<RepairDto> => {
    if (!token) {
        throw new Error('Токен отсутствует');
    }

    console.log(`[updateRepair] Отправка запроса на обновление записи ремонта (ID: ${repairId}) с payload:`, request);
    try {
        const response = await axios.put(`${REPAIR_API_URL}/${repairId}`, request, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        console.log(`[updateRepair] Получен ответ для repairId ${repairId}:`, response.data);
        return response.data;
    } catch (error: any) {
        console.error(`[updateRepair] Ошибка при обновлении записи ремонта (ID: ${repairId}). Payload:`, request, 'Ошибка:', error);
        throw error;
    }
};
