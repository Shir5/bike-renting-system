import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { loginUser } from '../services/authApi';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen() {
    const router = useRouter();
    const { login } = useContext(AuthContext);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // Состояние загрузки

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Ошибка', 'Введите имя пользователя и пароль.');
            return;
        }

        setLoading(true); // Показываем индикатор загрузки
        try {
            const token = await loginUser({ username, password });
            if (token) {
                login(token); // Сохраняем токен в контекст
                Alert.alert('Успех', 'Вход выполнен!');
                router.replace('/'); // Перенаправляем на главную
            } else {
                Alert.alert('Ошибка', 'Не удалось получить токен.');
            }
        } catch (error: any) {
            console.log('Ошибка авторизации:', error);
            Alert.alert(
                'Ошибка',
                error?.response?.data?.message || 'Произошла ошибка при входе.'
            );
        } finally {
            setLoading(false); // Скрываем индикатор загрузки
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Вход</Text>

            <TextInput
                style={styles.input}
                placeholder="Имя пользователя"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none" // Отключаем автокапитализацию
                autoCorrect={false} // Отключаем автокоррекцию
            />
            <TextInput
                style={styles.input}
                placeholder="Пароль"
                value={password}
                secureTextEntry
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
            />

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <>
                    <Button title="Войти" onPress={handleLogin} />
                    <Button
                        title="Регистрация"
                        onPress={() => router.push('/register')}
                    />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#282c34' },
    title: { fontSize: 24, marginBottom: 16, textAlign: 'center', color: 'white' },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 12,
        borderRadius: 5,
        padding: 10,
        backgroundColor: 'white', // Цвет фона строки ввода
        color: 'black', // Цвет текста
    },
});
