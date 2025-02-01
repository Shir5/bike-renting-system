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
        if (!username || !password) {
            Alert.alert('Ошибка', 'Введите имя пользователя и пароль.');
            return;
        }
        if (password.length < 4) {
            Alert.alert('Ошибка', 'Пароль должен быть не менее 4 символов.');
            return;
        }

        try {
            // Call the registerUser API function and get a JwtResponse object.
            const jwtResponse = await registerUser({ username, password });
            if (jwtResponse) {
                // Call the login function from AuthContext with the token and user ID.
                login(jwtResponse.access_token, jwtResponse.user_id);
                Alert.alert('Успех', 'Пользователь успешно зарегистрирован!');
                router.replace('/'); // Navigate to the main screen
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
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Пароль (>= 4 символа)"
                value={password}
                secureTextEntry
                onChangeText={setPassword}
                autoCapitalize="none"
            />

            <Button title="Зарегистрироваться" onPress={handleRegister} />
            <Button title="Уже есть аккаунт?" onPress={() => router.push('/login')} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#282c34'
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center',
        color: 'white'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 12,
        borderRadius: 5,
        padding: 10,
        backgroundColor: 'white',
        color: 'black',
    },
});
