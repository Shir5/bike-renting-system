import React, { useContext, useEffect, useMemo, useRef, useState } from "react"
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  AppState,
  StatusBar,
} from "react-native"
import MapView, { Marker } from "react-native-maps"
import { SafeAreaView } from "react-native-safe-area-context"
import { useCameraPermissions, CameraView, CameraType } from "expo-camera"
import Modal from "react-native-modal"
import Icon from "react-native-vector-icons/FontAwesome"
import { router } from "expo-router"

import MenuDrawer from "../components/MenuDrawer"
import { AuthContext } from "../context/AuthContext"

// ХУКИ (пути подстрой под свой проект)
import { useStations } from "@/hooks/useStations"
import { useLocation } from "@/hooks/useLocation"
import { usePayments } from "@/hooks/usePayments"

// типы (если у тебя типы живут в services — импортируй оттуда)
import type { Station } from "../services/stationService"
import type { Bicycle } from "../services/fetchBicyclesByStation"
import { fetchBicyclesByStationId } from "../services/fetchBicyclesByStation"
import { useRentals } from "@/hooks/useRentals"

const { width, height } = Dimensions.get("window")
const TARIFF_PER_MINUTE = 1.5

const AnimatedUpdateButton = ({ onPress }: { onPress: () => void }) => {
  const spinValue = useRef(new Animated.Value(0)).current

  const spinAnimation = () => {
    spinValue.setValue(0)
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start()
  }

  const handlePress = () => {
    spinAnimation()
    onPress()
  }

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <TouchableOpacity
      style={styles.updateButtonContainer}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Animated.Image
        source={require("../assets/images/reload.png")}
        style={[
          styles.updateButton,
          { transform: [{ rotate: spin }], tintColor: "black" },
        ]}
      />
    </TouchableOpacity>
  )
}

function CustomQRScanner({
  onClose,
  onBarcodeScanned,
}: {
  onClose: () => void
  onBarcodeScanned: (data: string) => void
}) {
  const [facing] = useState<CameraType>("back")
  const [permission, requestPermission] = useCameraPermissions()
  const scannedRef = useRef(false)

  useEffect(() => {
    scannedRef.current = false
  }, [])

  if (!permission) return <View />

  if (!permission.granted) {
    return (
      <View style={styles.scannerContainer}>
        <Text style={styles.scannerMessage}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
        <TouchableOpacity style={styles.scannerCloseButton} onPress={onClose}>
          <Text style={styles.scannerCloseText}>× Close</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const handleScan = ({ data }: { data: string }) => {
    if (scannedRef.current) return
    scannedRef.current = true

    try {
      onBarcodeScanned(data)
    } finally {
      setTimeout(() => {
        onClose()
        scannedRef.current = false
      }, 500)
    }
  }

  return (
    <View style={styles.scannerContainer}>
      {Platform.OS === "ios" && <StatusBar hidden />}
      <CameraView
        style={styles.scannerCamera}
        facing={facing}
        onBarcodeScanned={handleScan}
      >
        <View style={styles.scannerButtonContainer}>
          <TouchableOpacity style={styles.scannerButton} onPress={onClose}>
            <Text style={styles.scannerText}>Close</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  )
}

export default function HomeScreen() {
  const { userToken, user } = useContext(AuthContext)

  // UI-only state
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [isStationModalVisible, setIsStationModalVisible] = useState(false)
  const [isBalanceModalVisible, setIsBalanceModalVisible] = useState(false)
  const [isStartScannerVisible, setIsStartScannerVisible] = useState(false)
  const [isStopScannerVisible, setIsStopScannerVisible] = useState(false)

  // Bikes in station modal (можно вынести в отдельный хук позже)
  const [bicycles, setBicycles] = useState<Bicycle[]>([])
  const [loadingBicycles, setLoadingBicycles] = useState(false)
  const [errorBicycles, setErrorBicycles] = useState<string | null>(null)

  // Balance modal input
  const [addAmount, setAddAmount] = useState<string>("")

  // QR targets
  const [targetBicycle, setTargetBicycle] = useState<Bicycle | null>(null)

  // modal scroll
  const [scrollOffset, setScrollOffset] = useState(0)
  const flatListRef = useRef<any>(null)

  // Map ref
  const mapRef = useRef<MapView>(null)

  // --- AUTH redirect ---
  useEffect(() => {
    if (!userToken) router.replace("/login")
  }, [userToken])

  // --- HOOKS ---
  const {
    stations,
    isLoading: stationsLoading,
    error: stationsError,
    reload: reloadStations,
  } = useStations()

  const {
    location,
    status: locationStatus,
    requestPermission,
    refresh: refreshLocation,
  } = useLocation()

  const {
    balance,
    isLoading: balanceLoading,
    error: balanceError,
    addBalance: addBalanceAction,
    reload: reloadBalance,
  } = usePayments()

  const {
    currentRental,
    startRental,
    stopRental,
    isLoading: rentalLoading,
  } = useRentals()

  // Center map on location
  useEffect(() => {
    if (!location) return
    mapRef.current?.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
      800,
    )
  }, [location])

  // Ask location permission once (or on demand)
  useEffect(() => {
    if (locationStatus === "idle") requestPermission()
  }, [locationStatus, requestPermission])

  // Update location on app foreground
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshLocation()
    })
    return () => sub.remove()
  }, [refreshLocation])

  // Stations initial load after auth
  useEffect(() => {
    if (userToken) reloadStations()
  }, [userToken, reloadStations])

  // Balance initial load after auth
  useEffect(() => {
    if (userToken) reloadBalance()
  }, [userToken, reloadBalance])

  // Error surfaces (UI-level)
  useEffect(() => {
    if (stationsError) Alert.alert("Ошибка", stationsError)
  }, [stationsError])

  useEffect(() => {
    if (balanceError) Alert.alert("Ошибка", balanceError)
  }, [balanceError])

  const toggleMenu = () => setMenuOpen((v) => !v)

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = timeInSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`
  }

  // derived rental info
  const rentalTime = currentRental?.secondsElapsed ?? 0
  const spentAmount = useMemo(() => {
    return ((rentalTime / 60) * TARIFF_PER_MINUTE).toFixed(2)
  }, [rentalTime])

  const truncatedBalance = useMemo(() => {
    const v = typeof balance === "number" ? balance : 0
    return v.toString().slice(0, 6)
  }, [balance])

  const handleMarkerPress = async (station: Station) => {
    setSelectedStation(station)
    setIsStationModalVisible(true)

    setLoadingBicycles(true)
    setErrorBicycles(null)

    try {
      const bicycleData = await fetchBicyclesByStationId(station.id)
      const filtered = bicycleData.filter((bike) => bike.status === "AVAILABLE")
      setBicycles(filtered)
    } catch (e: any) {
      const msg = e?.message || "Не удалось загрузить велосипеды."
      setErrorBicycles(msg)
      Alert.alert("Ошибка", msg)
    } finally {
      setLoadingBicycles(false)
    }
  }

  const handleAddBalance = async () => {
    const amount = Number.parseFloat(addAmount)
    if (Number.isNaN(amount) || amount <= 0) {
      Alert.alert("Ошибка", "Введите корректную сумму.")
      return
    }

    try {
      await addBalanceAction(amount)
      setAddAmount("")
      setIsBalanceModalVisible(false)
      await reloadBalance()
      Alert.alert("Успех", `Баланс пополнен на ${amount} ₽`)
    } catch (e: any) {
      Alert.alert("Ошибка", e?.message || "Не удалось пополнить баланс.")
    }
  }

  const renderBicycleItem = ({ item }: { item: Bicycle }) => (
    <View style={styles.bicycleItem}>
      <Text style={styles.bicycleText}>ID: {item.id}</Text>
      <Text style={styles.bicycleText}>Модель: {item.model}</Text>
      <Text style={styles.bicycleText}>Тип: {item.type}</Text>
      <Text style={styles.bicycleText}>Статус: {item.status}</Text>

      <TouchableOpacity
        style={styles.rentButton}
        onPress={() => {
          if (!userToken || user == null) {
            Alert.alert("Ошибка", "Пользователь не авторизован.")
            return
          }
          if (!selectedStation?.id) {
            Alert.alert("Ошибка", "Не удалось определить станцию.")
            return
          }
          setIsStationModalVisible(false)
          setTargetBicycle(item)
          setIsStartScannerVisible(true)
        }}
      >
        <Text style={styles.rentButtonText}>Арендовать</Text>
      </TouchableOpacity>
    </View>
  )

  const handleStartBarcodeScanned = async (data: string) => {
    if (!targetBicycle) {
      Alert.alert("Ошибка", "Не выбран велосипед.")
      return
    }
    if (data !== targetBicycle.id.toString()) {
      Alert.alert("Ошибка", "Неверный QR код. Попробуйте снова.")
      return
    }

    if (!userToken || user == null || !selectedStation) {
      Alert.alert("Ошибка", "Нет пользователя или станции.")
      return
    }

    setIsStartScannerVisible(false)

    try {
      await startRental(targetBicycle.id, selectedStation.id)
      Alert.alert("Успех", "Аренда начата!")
      // синхронизация UI
      await reloadStations()
    } catch (e: any) {
      Alert.alert("Ошибка", e?.message || "Не удалось начать аренду.")
    }
  }

  const handleStopStationScanned = async (data: string) => {
    const stationId = Number.parseInt(data, 10)
    if (Number.isNaN(stationId)) {
      Alert.alert("Ошибка", "QR код не соответствует идентификатору станции.")
      return
    }

    setIsStopScannerVisible(false)

    if (!currentRental) {
      Alert.alert("Ошибка", "Нет активной аренды.")
      return
    }

    // cost лучше считать на сервере; но раз у тебя сейчас тариф клиентский — передадим cost
    const calculatedCost = Math.round((rentalTime / 60) * TARIFF_PER_MINUTE)

    try {
      await stopRental(currentRental.id, stationId, calculatedCost)
      Alert.alert("Аренда остановлена", `Итоговый расход: ${calculatedCost} ₽`)
      // синхронизация
      await Promise.all([reloadStations(), reloadBalance()])
    } catch (e: any) {
      Alert.alert("Ошибка", e?.message || "Не удалось завершить аренду.")
    }
  }

  const handleScroll = (event: any) => {
    setScrollOffset(event.nativeEvent.contentOffset.y)
  }

  // общий лоадинг экрана: auth уже проверили, дальше можно по частям
  const globalLoading = stationsLoading || balanceLoading

  if (globalLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.debugText}>Loading...</Text>
      </SafeAreaView>
    )
  }

  const mapLatitude = location?.latitude ?? 59.9343
  const mapLongitude = location?.longitude ?? 30.3351

  return (
    <MenuDrawer menuOpen={menuOpen} setMenuOpen={setMenuOpen}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.burgerMenuPlaceholder}>
            <TouchableOpacity onPress={toggleMenu}>
              <Text style={{ fontSize: 24 }}>☰</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>HealthyRide</Text>
        </View>

        <View style={styles.balanceContainer}>
          <TouchableOpacity onPress={() => setIsBalanceModalVisible(true)}>
            <Icon name="credit-card" size={24} color="#333" />
            <Text style={styles.balanceText}>{truncatedBalance} ₽</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            region={{
              latitude: mapLatitude,
              longitude: mapLongitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation={true}
            followsUserLocation={false}
            scrollEnabled={!menuOpen}
            zoomEnabled={!menuOpen}
          >
            <AnimatedUpdateButton onPress={reloadStations} />

            {stations.map((station) => (
              <Marker
                key={station.id}
                coordinate={{
                  latitude: station.latitude,
                  longitude: station.longitude,
                }}
                image={require("../assets/images/scooter.png")}
                title={station.name}
                description={`Доступно велосипедов: ${station.availableBikes}`}
                onPress={() => handleMarkerPress(station)}
                calloutOffset={{ x: 0.5, y: 0.5 }}
              />
            ))}
          </MapView>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoHeader}>Статус аренды</Text>

          {currentRental ? (
            <>
              <Text style={styles.infoText}>
                Время: {formatTime(rentalTime)}
              </Text>
              <Text style={styles.infoText}>Сумма: {spentAmount} ₽</Text>

              <TouchableOpacity
                style={styles.stopButton}
                onPress={() => setIsStopScannerVisible(true)}
                disabled={rentalLoading}
              >
                <Text style={styles.stopButtonText}>
                  Сканировать для завершения аренды
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.infoText}>Активной аренды нет</Text>
          )}
        </View>

        {/* Station modal */}
        <Modal
          isVisible={isStationModalVisible}
          swipeDirection={["down"]}
          onSwipeComplete={() => setIsStationModalVisible(false)}
          onBackdropPress={() => setIsStationModalVisible(false)}
          swipeThreshold={100}
          scrollTo={(node) => {
            flatListRef.current = node
          }}
          scrollOffset={scrollOffset}
          scrollOffsetMax={300}
          propagateSwipe={true}
          style={styles.modal}
        >
          <SafeAreaView style={styles.limitedModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Велосипеды на станции: {selectedStation?.name}
              </Text>
              <TouchableOpacity onPress={() => setIsStationModalVisible(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>

            {loadingBicycles ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : errorBicycles ? (
              <Text style={styles.errorText}>{errorBicycles}</Text>
            ) : (
              <FlatList
                ref={flatListRef}
                data={bicycles}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderBicycleItem}
                contentContainerStyle={styles.bicycleList}
                ListEmptyComponent={<Text>Нет доступных велосипедов.</Text>}
                onScroll={handleScroll}
                scrollEventThrottle={16}
              />
            )}
          </SafeAreaView>
        </Modal>

        {/* Balance modal */}
        <Modal
          isVisible={isBalanceModalVisible}
          onBackdropPress={() => setIsBalanceModalVisible(false)}
          style={styles.balanceModal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.balanceModalContainer}
          >
            <Text style={styles.modalTitle}>Пополнить баланс</Text>

            <TextInput
              style={styles.input}
              placeholder="Введите сумму"
              keyboardType="numeric"
              value={addAmount}
              onChangeText={setAddAmount}
            />

            <Button
              title={balanceLoading ? "..." : "Пополнить"}
              onPress={handleAddBalance}
              disabled={balanceLoading}
            />
            <View style={{ height: 10 }} />
          </KeyboardAvoidingView>
        </Modal>

        {/* Start scanner */}
        {isStartScannerVisible && (
          <View style={styles.scannerModalContainer}>
            <CustomQRScanner
              onClose={() => setIsStartScannerVisible(false)}
              onBarcodeScanned={handleStartBarcodeScanned}
            />
          </View>
        )}

        {/* Stop scanner */}
        {isStopScannerVisible && (
          <View style={styles.scannerModalContainer}>
            <CustomQRScanner
              onClose={() => setIsStopScannerVisible(false)}
              onBarcodeScanned={handleStopStationScanned}
            />
          </View>
        )}
      </SafeAreaView>
    </MenuDrawer>
  )
}

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: "flex-end",
  },
  balanceModal: {
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
    paddingBottom: height * 0.2,
  },
  limitedModalContainer: {
    height: height * 0.7,
    backgroundColor: "#E17564",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#F29F58",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: height * 0.02,
    marginBottom: height * 0.02,
    paddingHorizontal: width * 0.05,
  },
  burgerMenuPlaceholder: {
    marginRight: 10,
  },
  title: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    color: "#333",
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: width * 0.05,
    marginBottom: height * 0.02,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    margin: 15,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.02,
    backgroundColor: "#988A7D",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1B1833",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  infoHeader: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  infoText: {
    color: "black",
    textAlign: "center",
    marginVertical: 2,
  },
  stopButton: {
    marginTop: 10,
    backgroundColor: "#D9534F",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: "center",
  },
  stopButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    paddingRight: 10,
  },
  closeButton: {
    fontSize: 24,
    color: "#333",
  },
  bicycleList: {
    paddingBottom: 20,
  },
  bicycleItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  bicycleText: {
    fontSize: 16,
    color: "#333",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  balanceContainer: {
    position: "absolute",
    top: height * 0.03,
    right: width * 0.01,
    borderRadius: 10,
    padding: 40,
    flexDirection: "row",
    alignItems: "center",
  },
  balanceText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 30,
    bottom: 25,
  },
  balanceModalContainer: {
    backgroundColor: "#333",
    borderRadius: 10,
    padding: 30,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    width: "100%",
    padding: 10,
    paddingLeft: 20,
    paddingRight: 20,
    marginVertical: 10,
    color: "#fff",
  },
  rentButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
    alignItems: "center",
  },
  rentButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
  },
  updateButtonContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    zIndex: 1000,
    backgroundColor: "orange",
    borderRadius: 100,
    padding: 4,
  },
  updateButton: {
    width: 40,
    height: 40,
  },
  debugText: {
    color: "yellow",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
  scannerModalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
    zIndex: 2000,
  },
  scannerContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "black",
  },
  scannerMessage: {
    textAlign: "center",
    color: "white",
    paddingBottom: 10,
  },
  scannerCamera: {
    flex: 1,
  },
  scannerButtonContainer: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  scannerButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 5,
  },
  scannerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  scannerCloseButton: {
    marginTop: 20,
    alignSelf: "center",
    padding: 10,
  },
  scannerCloseText: {
    fontSize: 18,
    color: "white",
  },
})
