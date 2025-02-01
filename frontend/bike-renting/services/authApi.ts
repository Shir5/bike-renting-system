import axios from 'axios';

// Базовый URL API
const API_URL = 'http://178.69.216.14:24120/islabFirst-0.1/api';

// Создаём экземпляр axios с базовой настройкой
const api = axios.create({ baseURL: API_URL });

// Тип ответа от сервера (JwtResponse)
export type JwtResponse = {
    access_token: string;
    user_id: number;
    username: string;
};

/**
 * Регистрация
 * @param data объект вида { username, password }
 * Возвращает объект JwtResponse: { access_token, user_id, username }
 */
export async function registerUser(data: {
    username: string;
    password: string;
}): Promise<JwtResponse> {
    try {
        console.log('Регистрация пользователя:', data);
        const res = await api.post('/auth/register', data);
        console.log('Ответ сервера (регистрация):', res.data);

        // Проверяем, что сервер вернул access_token и user_id
        if (res.data && res.data.access_token && res.data.user_id) {
            return res.data as JwtResponse;
        } else {
            throw new Error('Сервер не вернул access_token или user_id.');
        }
    } catch (error: any) {
        console.error('Ошибка при регистрации:', error.message);
        if (error.response) {
            console.error('Ответ сервера (ошибка):', error.response.data);
        }
        throw error;
    }
}

/**
 * Логин
 * @param credentials объект вида { username, password }
 * Возвращает объект JwtResponse: { access_token, user_id, username }
 */
export async function loginUser(credentials: {
    username: string;
    password: string;
}): Promise<JwtResponse> {
    try {
        console.log('Авторизация пользователя:', credentials);
        const res = await api.post('/auth/login', credentials);
        console.log('Ответ сервера (логин):', res.data);

        // Проверяем, что сервер вернул access_token и user_id
        if (res.data && res.data.access_token && res.data.user_id) {
            return res.data as JwtResponse;
        } else {
            throw new Error('Сервер не вернул access_token или user_id.');
        }
    } catch (error: any) {
        console.error('Ошибка при авторизации:', error.message);
        if (error.response) {
            console.error('Ответ сервера (ошибка):', error.response.data);
        }
        throw error;
    }
}
