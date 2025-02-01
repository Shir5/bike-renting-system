import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

// Если у вас контекст аутентификации в другом пути — поправьте импорт:
import { AuthProvider } from '../context/AuthContext';

// Предотвращаем автоскрытие SplashScreen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Пустой экран, пока не загрузились шрифты
  }

  return (
    // 1. Оборачиваем всё приложение в AuthProvider
    <AuthProvider>
      {/* 2. Тема (светлая/тёмная) */}
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {/* 3. Stack от Expo Router */}
        <Stack>
          <Stack.Screen name="login" options={{
            headerShown: false,
            gestureEnabled: false, // Отключаем свайп
          }} />
          <Stack.Screen name="register" options={{
            headerShown: false,
            gestureEnabled: false, // Отключаем свайп
          }} />
          <Stack.Screen name="index" options={{
            headerShown: false,
            gestureEnabled: false, // Отключаем свайп
          }} />

        </Stack>

        {/* Стандартный статус-бар (iOS/Android) */}
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
