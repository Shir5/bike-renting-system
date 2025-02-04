import React, { ReactNode, useEffect, useState, useContext } from 'react';
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
import { AuthContext } from '../context/AuthContext'; // Adjust the path as needed

const { width } = Dimensions.get('window');
// Maximum menu width (70% of screen width)
const MAX_MENU_WIDTH = width * 0.7;

interface MenuDrawerProps {
    children: ReactNode;              // Main content wrapped by the Drawer
    menuOpen: boolean;                // Whether the menu is open (from HomeScreen)
    setMenuOpen: (open: boolean) => void; // Function to update the menu state
}

export default function MenuDrawer({
    children,
    menuOpen,
    setMenuOpen,
}: MenuDrawerProps) {
    const { logout } = useContext(AuthContext); // Get logout function from AuthContext
    const [animation] = useState(new Animated.Value(menuOpen ? 1 : 0));

    useEffect(() => {
        Animated.timing(animation, {
            toValue: menuOpen ? 1 : 0,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
        }).start();
    }, [menuOpen]);

    // Interpolate translateX based on animation value
    const translateX = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [-MAX_MENU_WIDTH, 0],
    });

    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
            const isSwipeFromEdge = gestureState.moveX < width * 0.1; // Only allow swipe from the left edge
            const isHorizontalSwipe = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
            return isHorizontalSwipe && (!menuOpen ? isSwipeFromEdge : true);
        },
        onPanResponderMove: (_, gestureState) => {
            if (gestureState.dx > 0 && !menuOpen) {
                animation.setValue(Math.min(gestureState.dx / MAX_MENU_WIDTH, 1));
            }
            if (gestureState.dx < 0 && menuOpen) {
                animation.setValue(Math.max(1 + gestureState.dx / MAX_MENU_WIDTH, 0));
            }
        },
        onPanResponderRelease: (_, gestureState) => {
            if (gestureState.dx > MAX_MENU_WIDTH * 0.2) {
                setMenuOpen(true);
            } else if (gestureState.dx < -MAX_MENU_WIDTH * 0.2) {
                setMenuOpen(false);
            } else {
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

    // When the Exit button is pressed, run an exit animation then call logout to clear context values and redirect.
    const handleExit = () => {
        Animated.timing(animation, {
            toValue: 0,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
        }).start(() => {
            setMenuOpen(false);
            // Call the logout function from AuthContext to clear token and userId and navigate to login page.
            logout();
        });
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
                <TouchableOpacity onPress={handleExit} style={styles.exitButton}>
                    <Text style={styles.exitButtonText}>Выход</Text>
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
        width: MAX_MENU_WIDTH,
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
    exitButton: {
        marginTop: 30,
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#D9534F', // Red background
        borderRadius: 5,
        alignItems: 'center',
    },
    exitButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    updateButtonContainer: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
        backgroundColor: 'orange',
        borderRadius: 100,
        padding: 4,
    },
    updateButton: {
        width: 40,
        height: 40,
    },
});
