import React, { ReactNode, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Easing,
    Dimensions,
    PanResponder,
} from 'react-native';

const { width } = Dimensions.get('window');

// Определяем максимальное открытие меню (например, 50% от ширины экрана)
const MAX_MENU_WIDTH = width * 0.7;

interface MenuDrawerProps {
    children: ReactNode;              // Основной контент, который будет обёрнут Drawer'ом
    menuOpen: boolean;                // Открыто ли меню (берём из HomeScreen)
    setMenuOpen: (open: boolean) => void; // Функция для изменения состояния меню
}

export default function MenuDrawer({
    children,
    menuOpen,
    setMenuOpen,
}: MenuDrawerProps) {
    const [animation] = useState(new Animated.Value(menuOpen ? 1 : 0));

    useEffect(() => {
        Animated.timing(animation, {
            toValue: menuOpen ? 1 : 0,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, [menuOpen]);

    // Интерполяция значения translateX с ограничением на MAX_MENU_WIDTH
    const translateX = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [-MAX_MENU_WIDTH, 0], // Ограничение выезда меню до MAX_MENU_WIDTH
    });

    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
            const isSwipeFromEdge = gestureState.moveX < width * 0.1; // Свайп на открытие только с левого края
            const isHorizontalSwipe = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);

            // Разрешаем свайп, если меню закрыто и начинается с левого края, или если меню открыто (для закрытия)
            return isHorizontalSwipe && (!menuOpen ? isSwipeFromEdge : true);
        },
        onPanResponderMove: (_, gestureState) => {
            if (gestureState.dx > 0 && !menuOpen) {
                // Анимация открытия меню
                animation.setValue(Math.min(gestureState.dx / MAX_MENU_WIDTH, 1));
            }
            if (gestureState.dx < 0 && menuOpen) {
                // Анимация закрытия меню
                animation.setValue(Math.max(1 + gestureState.dx / MAX_MENU_WIDTH, 0));
            }
        },
        onPanResponderRelease: (_, gestureState) => {
            if (gestureState.dx > MAX_MENU_WIDTH * 0.2) {
                // Завершаем открытие меню
                setMenuOpen(true);
            } else if (gestureState.dx < -MAX_MENU_WIDTH * 0.2) {
                // Завершаем закрытие меню
                setMenuOpen(false);
            } else {
                // Если свайп недостаточно длинный, возвращаем меню в текущее состояние
                Animated.timing(animation, {
                    toValue: menuOpen ? 1 : 0,
                    duration: 300,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: false,
                }).start();
            }
        },
    });

    const handleCloseMenu = () => {
        setMenuOpen(false);
    };

    return (
        <View style={{ flex: 1 }} {...panResponder.panHandlers}>
            {children}

            <Animated.View style={[styles.drawerContainer, { transform: [{ translateX }] }]}>
                <Text style={styles.menuTitle}>Меню</Text>

                <TouchableOpacity onPress={handleCloseMenu} style={styles.menuItem}>
                    <Text>Опция 1</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCloseMenu} style={styles.menuItem}>
                    <Text>Опция 2</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCloseMenu} style={styles.menuItem}>
                    <Text>Опция 3</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    drawerContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: MAX_MENU_WIDTH, // Ограничиваем ширину контейнера меню
        backgroundColor: '#F29F58',
        paddingTop: 50,
        paddingHorizontal: 20,

        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 5,

        zIndex: 999,
    },
    menuTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    menuItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
});
