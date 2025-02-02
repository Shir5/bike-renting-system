import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { ActivityIndicator } from 'react-native';

// Extend the type to include userId
type AuthContextType = {
    userToken: string | null;
    user: number | null;
    login: (token: string, userId: number) => void;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
    userToken: null,
    user: null,
    login: () => { },
    logout: () => { },
});

type Props = {
    children: ReactNode;
};

export function AuthProvider({ children }: Props) {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [user, setUserId] = useState<number | null>(null);
    const [isTokenLoading, setIsTokenLoading] = useState(true);

    useEffect(() => {
        const loadTokenAndUserId = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('userToken');
                const storedUserId = await AsyncStorage.getItem('user');
                if (storedToken) {
                    setUserToken(storedToken);
                    console.log('Token loaded from AsyncStorage:', storedToken);
                }
                if (storedUserId) {
                    setUserId(Number(storedUserId));
                    console.log('UserId loaded from AsyncStorage:', storedUserId);
                }
            } catch (error) {
                console.error('Error loading token from AsyncStorage:', error);
            } finally {
                setIsTokenLoading(false);
            }
        };
        loadTokenAndUserId();
    }, []);

    const login = async (token: string, id: number) => {
        try {
            setUserToken(token);
            setUserId(id);
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('user', id.toString());
            console.log('Token and user saved to AsyncStorage:', token, id);
        } catch (error) {
            console.error('Error saving token and user to AsyncStorage:', error);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('user');
            setUserToken(null);
            setUserId(null);
            console.log('Token and userId removed from AsyncStorage');
            router.replace('/register');
        } catch (error) {
            console.error('Error removing token and userId from AsyncStorage:', error);
        }
    };

    if (isTokenLoading) {
        return (
            <ActivityIndicator
                size="large"
                color="#0000ff"
                style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
            />
        );
    }

    return (
        <AuthContext.Provider value={{ userToken, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
