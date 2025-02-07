import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    Alert,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
    TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { loginUser } from '../services/authApi';
import { AuthContext } from '../context/AuthContext';

// Pull width/height for dimension-based styling
const { width, height } = Dimensions.get('window');

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
            const jwtResponse = await loginUser({ username, password });
            if (jwtResponse) {
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
                placeholderTextColor="#333"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
            />
            <TextInput
                style={styles.input}
                placeholder="Пароль"
                placeholderTextColor="#333"
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
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.loginButtonText}>Войти</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={() => router.push('/register')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.registerButtonText}>Регистрация</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#333',
        paddingHorizontal: width * 0.05,
        justifyContent: 'center',
    },
    title: {
        fontSize: width * 0.07,
        marginBottom: 16,
        textAlign: 'center',
        color: '#F29F58',
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#F29F58',
        color: '#333',
        borderRadius: 5,
        marginBottom: 12,
        paddingVertical: 12,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    loginButton: {
        backgroundColor: '#F29F58',
        paddingVertical: 12,
        marginVertical: 12,
        borderRadius: 5,
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#333',
        fontWeight: 'bold',
        fontSize: 16,
    },
    registerButton: {
        marginTop: 12,
        paddingVertical: 12,
        borderRadius: 5,
        alignItems: 'center',
        borderColor: '#F29F58', // Outline border
        borderWidth: 2,
    },
    registerButtonText: {
        color: '#F29F58',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
