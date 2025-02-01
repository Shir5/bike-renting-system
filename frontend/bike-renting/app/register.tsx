import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { registerUser } from '../services/authApi';
import { AuthContext } from '../context/AuthContext';

export default function RegisterScreen() {
    const router = useRouter();
    const { login } = useContext(AuthContext);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        try {
            const token = await registerUser({ username, password });
            
            if (token) {
                login(token); // сохраняем токен через AuthContext
                Alert.alert('Успех', 'Пользователь успешно зарегистрирован!');
                router.replace('/'); // Перенаправление на главную страницу
            } else {
                Alert.alert('Ошибка', 'Сервер не вернул токен.');
            }
        } catch (error: any) {
            console.error('Ошибка регистрации:', error);
            Alert.alert(
                'Ошибка',
                error?.response?.data?.message || 'Произошла ошибка при регистрации.'
            );
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Регистрация</Text>

            <TextInput
                style={styles.input}
                placeholder="Имя пользователя"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={styles.input}
                placeholder="Пароль (>= 4 символа)"
                value={password}
                secureTextEntry
                onChangeText={setPassword}
            />

            <Button title="Зарегистрироваться" onPress={handleRegister} />
            <Button
                title="Уже есть аккаунт?"
                onPress={() => router.push('/login')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    title: { fontSize: 24, marginBottom: 16, textAlign: 'center' },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 12,
        borderRadius: 5,
        padding: 10,
        color: 'white',
    },
});
