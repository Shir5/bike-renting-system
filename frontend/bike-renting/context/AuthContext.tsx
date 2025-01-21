import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { ActivityIndicator } from 'react-native';

type AuthContextType = {
    userToken: string | null;
    userId: number | null; // Новый параметр для хранения userId
    login: (token: string, userId: number) => void;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
    userToken: null,
    userId: null, // Инициализация
    login: () => {},
    logout: () => {},
});
type Props = {
    children: ReactNode;
};
export function AuthProvider({ children }: Props) {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null); // Новый state
    const [isTokenLoading, setIsTokenLoading] = useState(true);

    useEffect(() => {
        const loadToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('userToken');
                const storedUserId = await AsyncStorage.getItem('userId'); // Загружаем userId
                if (storedToken) {
                    setUserToken(storedToken);
                    console.log('Токен загружен из AsyncStorage:', storedToken);
                }
                if (storedUserId) {
                    setUserId(parseInt(storedUserId, 10)); // Устанавливаем userId
                    console.log('userId загружен из AsyncStorage:', storedUserId);
                }
            } catch (error) {
                console.error('Ошибка при загрузке токена из AsyncStorage:', error);
            } finally {
                setIsTokenLoading(false);
            }
        };
        loadToken();
    }, []);

    const login = async (token: string, id: number) => {
        try {
            setUserToken(token);
            setUserId(id); // Устанавливаем userId
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userId', id.toString()); // Сохраняем userId
            console.log('Токен и userId сохранены в AsyncStorage:', token, id);
        } catch (error) {
            console.error('Ошибка при сохранении токена и userId в AsyncStorage:', error);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userId'); // Удаляем userId
            setUserToken(null);
            setUserId(null); // Очищаем состояние userId
            console.log('Токен и userId удалены из AsyncStorage');
            router.replace('/register');
        } catch (error) {
            console.error('Ошибка при удалении токена и userId из AsyncStorage:', error);
        }
    };

    if (isTokenLoading) {
        return (
            <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />
        );
    }

    return (
        <AuthContext.Provider value={{ userToken, userId, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
