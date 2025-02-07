import React, { useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    Alert,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { registerUser } from '../services/authApi';
import { AuthContext } from '../context/AuthContext';

// Pull width/height for dimension-based styling
const { width } = Dimensions.get('window');

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
            // Call the registerUser API function and get a JwtResponse object
            const jwtResponse = await registerUser({ username, password });
            if (jwtResponse) {
                // Store the token and user in AuthContext
                login(jwtResponse.access_token, jwtResponse.user);
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
                placeholderTextColor="#333"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Пароль (>= 4 символа)"
                placeholderTextColor="#333"
                value={password}
                secureTextEntry
                onChangeText={setPassword}
                autoCapitalize="none"
            />

            <TouchableOpacity
                style={styles.registerButton}
                onPress={handleRegister}
                activeOpacity={0.8}
            >
                <Text style={styles.registerButtonText}>Зарегистрироваться</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.loginButton}
                onPress={() => router.push('/login')}
                activeOpacity={0.8}
            >
                <Text style={styles.loginButtonText}>Уже есть аккаунт?</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#333',    // Dark background
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
        backgroundColor: '#F29F58',  // Same color as in LoginScreen
        color: '#fff',
        borderRadius: 5,
        marginBottom: 12,
        paddingVertical: 12,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    registerButton: {
        backgroundColor: '#F29F58',  // Stand-out color
        paddingVertical: 12,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 10,
    },
    registerButtonText: {
        color: '#333',
        fontWeight: 'bold',
        fontSize: 16,
    },
    loginButton: {
        paddingVertical: 12,
        borderRadius: 5,
        alignItems: 'center',
        borderColor: '#F29F58',
        borderWidth: 2,
    },
    loginButtonText: {
        color: '#F29F58',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
