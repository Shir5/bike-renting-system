import axios from 'axios';

export interface UserResponse {
    username: string;
    balance: number;
    debt: number;
}

export const fetchUserInfo = async (token: string): Promise<UserResponse | null> => {
    try {
        const response = await axios.get('http://178.69.216.14:24120/islabFirst-0.1/api/auth/info', {
            headers: {
                Authorization: `Bearer ${token}`, // Передаем токен аутентификации
            },
        });

        // Проверяем, что данные существуют и содержат необходимые поля
        if (
            response.data &&
            typeof response.data.username === 'string' &&
            typeof response.data.balance === 'number' &&
            typeof response.data.debt === 'number'
        ) {
            return response.data;
        } else {
            console.warn('Некорректный формат ответа от сервера:', response.data);
            return null;
        }
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
        return null;
    }
};
