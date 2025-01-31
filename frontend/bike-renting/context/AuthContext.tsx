import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { ActivityIndicator } from 'react-native';

type AuthContextType = {
    userToken: string | null;
    login: (token: string) => void;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
    userToken: null,
    login: () => {},
    logout: () => {},
});
type Props = {
    children: ReactNode;
};
export function AuthProvider({ children }: Props) {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [isTokenLoading, setIsTokenLoading] = useState(true);

    useEffect(() => {
        const loadToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('userToken');
                if (storedToken) {
                    setUserToken(storedToken);
                    console.log('Токен загружен из AsyncStorage:', storedToken);
                }

            } catch (error) {
                console.error('Ошибка при загрузке токена из AsyncStorage:', error);
            } finally {
                setIsTokenLoading(false);
            }
        };
        loadToken();
    }, []);

    const login = async (token: string) => {
        try {
            setUserToken(token);
            await AsyncStorage.setItem('userToken', token);
            console.log('Токен сохранен в AsyncStorage:', token);
        } catch (error) {
            console.error('Ошибка при сохранении токена в AsyncStorage:', error);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            setUserToken(null);
            console.log('Токен удалены из AsyncStorage');
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
        <AuthContext.Provider value={{ userToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
