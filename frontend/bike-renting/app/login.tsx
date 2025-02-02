import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    Alert,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { loginUser } from '../services/authApi';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen() {
    const router = useRouter();
    const { login } = useContext(AuthContext);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Ошибка', 'Введите имя пользователя и пароль.');
            return;
        }

        setLoading(true);
        try {
            // Call loginUser and expect a JwtResponse object.
            const jwtResponse = await loginUser({ username, password });
            if (jwtResponse) {
                // Pass only the token string and the user id to the login function.
                login(jwtResponse.access_token, jwtResponse.user);
                Alert.alert('Успех', 'Вход выполнен!');
                router.replace('/'); // Navigate to the main page
            } else {
                Alert.alert('Ошибка', 'Не удалось получить токен.');
            }
        } catch (error: any) {
            console.error('Ошибка авторизации:', error);
            Alert.alert(
                'Ошибка',
                error?.response?.data?.message || 'Произошла ошибка при входе.'
            );
        } finally {
            setLoading(false);
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
                autoCapitalize="none"
                autoCorrect={false}
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
                    <Button title="Регистрация" onPress={() => router.push('/register')} />
                </>
            )}
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
