import type { ReactNode } from "react";
import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  PanResponder,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

import { AuthContext } from "../context/AuthContext";
import { api } from "@/api/client"; // ВАЖНО: один общий api
import { secureAuthStore } from "@/api/secureAuthStore";

const { width } = Dimensions.get("window");
const MAX_MENU_WIDTH = width * 0.7;

interface MenuDrawerProps {
  children: ReactNode;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

type AdminRoleResponse = {
  role: "ADMIN" | "USER" | string;
};

export default function MenuDrawer({
  children,
  menuOpen,
  setMenuOpen,
}: MenuDrawerProps) {
  const { logout } = useContext(AuthContext);

  const [animation] = useState(new Animated.Value(menuOpen ? 1 : 0));
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(false);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: menuOpen ? 1 : 0,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [menuOpen, animation]);

  useEffect(() => {
    const checkAdminMode = async () => {
      try {
        const storedMode = await AsyncStorage.getItem("isAdminMode");
        setIsAdminMode(storedMode === "true");
      } catch (error) {
        console.error(
          "Ошибка при загрузке состояния режима администратора:",
          error,
        );
      }
    };
    checkAdminMode();
  }, []);

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-MAX_MENU_WIDTH, 0],
  });

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      const isSwipeFromEdge = gestureState.moveX < width * 0.1;
      const isHorizontalSwipe =
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
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

  const handleExit = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start(async () => {
      setMenuOpen(false);
      await AsyncStorage.setItem("isAdminMode", "false");
      await logout();
      router.replace("/login");
    });
  };

  const handleAdminModeRedirect = async () => {
    try {
      setIsCheckingRole(true);

      // Если токена нет — сразу на логин (и не делаем запрос)
      const access = await secureAuthStore.getAccessToken();
      if (!access) {
        console.error("Токен отсутствует!");
        router.replace("/login");
        return;
      }

      // Если уже admin mode — выключаем и уходим на home
      if (isAdminMode) {
        setIsAdminMode(false);
        await AsyncStorage.setItem("isAdminMode", "false");
        router.push("/");
        return;
      }

      // ВАЖНО: запрос через общий api (интерцепторы + refresh)
      const res = await api.get<AdminRoleResponse>("/admin-requests/role");

      if (res.data?.role === "ADMIN") {
        setIsAdminMode(true);
        await AsyncStorage.setItem("isAdminMode", "true");
        router.push("/admin");
      } else {
        console.error("Недостаточно прав");
      }
    } catch (error) {
      // Тут уже может быть appErr из toAppError (если запрос пошёл через api)
      console.error("Ошибка при запросе в админ-режим:", error);
    } finally {
      setIsCheckingRole(false);
    }
  };

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}

      <Animated.View
        style={[styles.drawerContainer, { transform: [{ translateX }] }]}
      >
        <Text style={styles.menuTitle}>Меню</Text>

        <TouchableOpacity
          onPress={handleAdminModeRedirect}
          style={styles.menuItem}
          disabled={isCheckingRole}
        >
          <Text>
            {isCheckingRole
              ? "Проверка..."
              : isAdminMode
                ? "User mode"
                : "Admin mode"}
          </Text>
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
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: MAX_MENU_WIDTH,
    backgroundColor: "#F29F58",
    paddingTop: 50,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 999,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  exitButton: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#D9534F",
    borderRadius: 5,
    alignItems: "center",
  },
  exitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
