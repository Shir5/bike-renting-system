import React, { useContext, useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useCameraPermissions, CameraView, CameraType } from 'expo-camera';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/FontAwesome';

import { fetchStations, Station } from '../services/stationService';
import { fetchBicyclesByStationId, Bicycle } from '../services/fetchBicyclesByStation';
import { AuthContext } from '../context/AuthContext';
import MenuDrawer from '../components/MenuDrawer';
import { fetchUserInfo } from '@/services/userService';
import { addBalance } from '@/services/paymentService';
import { createRental, updateRental } from '../services/rentalService';

const { width, height } = Dimensions.get('window');
const TARIFF_PER_MINUTE = 1.5;

const AnimatedUpdateButton = ({ onPress }: { onPress: () => void }) => {
    const spinValue = useRef(new Animated.Value(0)).current;

    const spinAnimation = () => {
        spinValue.setValue(0);
        Animated.timing(spinValue, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    };

    const handlePress = () => {
        spinAnimation();
        onPress();
    };

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <TouchableOpacity style={styles.updateButtonContainer} onPress={handlePress} activeOpacity={0.7}>
            <Animated.Image
                source={require('../assets/images/reload.png')}
                style={[styles.updateButton, { transform: [{ rotate: spin }], tintColor: 'black' }]}
            />
        </TouchableOpacity>
    );
};

/**
 * CustomQRScanner uses the basic Expo Camera snippet.
 * It shows the camera preview with a flip button and a close button.
 * When a QR code is scanned, it calls the onBarcodeScanned callback.
 */
function CustomQRScanner({
    onClose,
    onBarcodeScanned,
}: {
    onClose: () => void;
    onBarcodeScanned: (data: string) => void;
}) {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();

    // If permissions are still loading, render nothing
    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.scannerContainer}>
                <Text style={styles.scannerMessage}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="Grant Permission" />
                <TouchableOpacity style={styles.scannerCloseButton} onPress={onClose}>
                    <Text style={styles.scannerCloseText}>× Close</Text>
                </TouchableOpacity>
            </View>
        );
    }

    function toggleCameraFacing() {
        setFacing((current) => (current === 'back' ? 'front' : 'back'));
    }

    return (
        <View style={styles.scannerContainer}>
            {Platform.OS === 'ios' && <StatusBar hidden />}
            <CameraView
                style={styles.scannerCamera}
                facing={facing}
                // onBarCodeScanned will be called when a QR code is detected.
                onBarcodeScanned={({ data }: { data: string }) => {
                    console.log('Scanned QR Code:', data);
                    onBarcodeScanned(data);
                }}
            >
                <View style={styles.scannerButtonContainer}>
                    <TouchableOpacity style={styles.scannerButton} onPress={toggleCameraFacing}>
                        <Text style={styles.scannerText}>Flip Camera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.scannerButton} onPress={onClose}>
                        <Text style={styles.scannerText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
}

export default function HomeScreen() {
    // Get user context and token
    const { userToken, user } = useContext(AuthContext);

    // Screen states
    const [isLoading, setIsLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [stations, setStations] = useState<Station[]>([]);
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);

    // Bicycle state
    const [bicycles, setBicycles] = useState<Bicycle[]>([]);
    const [loadingBicycles, setLoadingBicycles] = useState(false);
    const [errorBicycles, setErrorBicycles] = useState<string | null>(null);

    // Modal states
    const [isModalVisible, setIsModalVisible] = useState(false); // Bicycle list modal
    const [isBalanceModalVisible, setIsBalanceModalVisible] = useState(false); // Balance modal
    const [isScannerVisible, setIsScannerVisible] = useState(false); // Custom QR scanner

    // Balance state
    const [userBalance, setUserBalance] = useState<number>(100);
    const [addAmount, setAddAmount] = useState<string>('');
    const truncatedBalance = userBalance.toString().slice(0, 6);

    // Rental state
    const [currentBicycleId, setCurrentBicycleId] = useState<number | null>(null);
    const [isRented, setIsRented] = useState(false);
    const [rentalTime, setRentalTime] = useState(0);
    const [currentRentalId, setCurrentRentalId] = useState<number | null>(null);

    // Geolocation
    const [userLocation, setUserLocation] = useState({ latitude: 59.9343, longitude: 30.3351 });
    const mapRef = useRef<MapView>(null);

    // For QR scanning, store target bicycle and request camera permissions
    const [targetBicycle, setTargetBicycle] = useState<Bicycle | null>(null);

    // (Optional) Log camera permissions
    useEffect(() => {
        console.log('HomeScreen - Camera permission status updated');
    }, []);

    // Helper: format time
    const formatTime = (timeInSeconds: number) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Calculate spent amount for display
    const spentAmount = ((rentalTime / 60) * TARIFF_PER_MINUTE).toFixed(2);

    // Rental timer
    useEffect(() => {
        let timerId: NodeJS.Timeout;
        if (isRented) {
            timerId = setInterval(() => {
                setRentalTime((prevTime) => prevTime + 1);
            }, 1000);
        }
        return () => {
            if (timerId) clearInterval(timerId);
        };
    }, [isRented]);

    // Get location
    const updateLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Ошибка', 'Доступ к местоположению не предоставлен');
            return;
        }
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });
        if (mapRef.current) {
            mapRef.current.animateToRegion(
                {
                    latitude,
                    longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                },
                1000
            );
        }
    };

    useEffect(() => {
        updateLocation();
    }, []);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                updateLocation();
            }
        });
        return () => subscription.remove();
    }, []);

    // Load stations
    const loadStations = async () => {
        try {
            const stationData = await fetchStations(userToken!);
            setStations(stationData);
            console.log('Stations loaded:', stationData);
        } catch (error: any) {
            Alert.alert('Ошибка', error.message || 'Не удалось загрузить станции.');
        }
    };

    useEffect(() => {
        loadStations();
    }, []);

    // Initialization: get user info
    useEffect(() => {
        const initialize = async () => {
            try {
                if (!userToken) {
                    Alert.alert('Ошибка', 'Токен отсутствует. Пожалуйста, войдите в систему.');
                    setIsLoading(false);
                    return;
                }
                const userInfo = await fetchUserInfo(userToken);
                if (userInfo) {
                    setUserBalance(userInfo.balance);
                    console.log('User info loaded:', userInfo);
                } else {
                    Alert.alert('Ошибка', 'Не удалось загрузить данные пользователя.');
                }
            } catch (error) {
                console.error('Ошибка при инициализации:', error);
                Alert.alert('Ошибка', 'Произошла ошибка при загрузке данных.');
            } finally {
                setIsLoading(false);
            }
        };
        initialize();
    }, [userToken]);

    // When a station marker is pressed, load bicycles and show the modal.
    const handleMarkerPress = async (station: Station) => {
        setSelectedStation(station);
        setIsModalVisible(true);
        setLoadingBicycles(true);
        setErrorBicycles(null);
        try {
            const bicycleData = await fetchBicyclesByStationId(station.id, userToken!);
            setBicycles(bicycleData);
            console.log('Bicycles loaded for station', station.name, ':', bicycleData);
        } catch (error: any) {
            Alert.alert('Ошибка', error.message || 'Не удалось загрузить велосипеды.');
            setErrorBicycles('Не удалось загрузить велосипеды.');
        } finally {
            setLoadingBicycles(false);
        }
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    // Render a single bicycle item.
    // When "Арендовать" is pressed, close the bicycle list modal,
    // set the target bicycle, and open the custom QR scanner.
    const renderBicycleItem = ({ item }: { item: Bicycle }) => (
        <View style={styles.bicycleItem}>
            <Text style={styles.bicycleText}>Модель: {item.model}</Text>
            <Text style={styles.bicycleText}>Тип: {item.type}</Text>
            <Text style={styles.bicycleText}>Статус: {item.status}</Text>
            <TouchableOpacity
                style={styles.rentButton}
                onPress={() => {
                    console.log('Арендовать pressed for bicycle:', item);
                    if (!userToken || user === null) {
                        Alert.alert('Ошибка', 'Пользователь не авторизован.');
                        return;
                    }
                    if (!selectedStation?.id) {
                        Alert.alert('Ошибка', 'Не удалось определить станцию начала аренды.');
                        return;
                    }
                    // Close the bicycle list modal
                    setIsModalVisible(false);
                    // Set the target bicycle and open the custom QR scanner
                    setTargetBicycle(item);
                    setIsScannerVisible(true);
                }}
            >
                <Text style={styles.rentButtonText}>Арендовать</Text>
            </TouchableOpacity>
        </View>
    );

    // Handle stopping the rental.
    const handleStopRide = () => {
        if (currentRentalId === null) {
            Alert.alert('Ошибка', 'Аренда не найдена.');
            return;
        }
        if (!selectedStation?.id) {
            Alert.alert('Ошибка', 'Не удалось определить станцию завершения аренды.');
            return;
        }
        const calculatedCost = Math.round((rentalTime / 60) * TARIFF_PER_MINUTE);
        updateRental(userToken!, currentRentalId!, user!, currentBicycleId!, selectedStation.id, calculatedCost)
            .then((updatedRental) => {
                Alert.alert('Аренда остановлена', `Итоговый расход: ${updatedRental.cost} ₽`);
                setIsRented(false);
                setRentalTime(0);
                setCurrentRentalId(null);
                setCurrentBicycleId(null);
            })
            .catch((err) => {
                Alert.alert('Ошибка', err.message || 'Не удалось завершить аренду.');
            });
    };

    // Handle balance top-up.
    const handleAddBalance = async () => {
        const amount = parseFloat(addAmount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Ошибка', 'Введите корректную сумму.');
            return;
        }
        if (!userToken) {
            Alert.alert('Ошибка', 'Токен отсутствует. Пожалуйста, войдите в систему.');
            return;
        }
        try {
            await addBalance(amount, userToken);
            setUserBalance((prevBalance) => prevBalance + amount);
            setAddAmount('');
            setIsBalanceModalVisible(false);
            Alert.alert('Успех', `Баланс пополнен на ${amount} ₽`);
        } catch (error: any) {
            console.error('Ошибка при пополнении баланса:', error);
            const errorMessage =
                error.response?.data?.message ||
                (error.response?.status === 403
                    ? 'У вас нет доступа для выполнения этого действия.'
                    : 'Не удалось пополнить баланс. Повторите попытку позже.');
            Alert.alert('Ошибка', errorMessage);
        }
    };

    // Handler for the custom QR scanner.
    // When a QR code is scanned, if the data matches the target bicycle's id, create the rental.
    const handleBarcodeScanned = (data: string) => {
        console.log('handleBarcodeScanned called with data:', data);
        if (targetBicycle && data === targetBicycle.id.toString()) {
            setIsScannerVisible(false);
            if (!userToken || !user || !selectedStation) {
                Alert.alert('Ошибка', 'Пользователь не авторизован или отсутствует выбранная станция.');
                return;
            }
            createRental(userToken, user, targetBicycle.id, selectedStation.id)
                .then((rentalData) => {
                    setCurrentRentalId(rentalData.id);
                    setCurrentBicycleId(targetBicycle.id);
                    setIsRented(true);
                    setRentalTime(0);
                    Alert.alert('Успех', 'Аренда начата!');
                })
                .catch((err) => {
                    Alert.alert('Ошибка', err.message || 'Не удалось начать аренду.');
                });
        } else {
            Alert.alert('Ошибка', 'Неверный QR код. Попробуйте снова.');
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.debugText}>Loading...</Text>
            </SafeAreaView>
        );
    }

    console.log('HomeScreen rendered');

    return (
        <MenuDrawer menuOpen={menuOpen} setMenuOpen={setMenuOpen}>
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.burgerMenuPlaceholder}>
                        <TouchableOpacity onPress={toggleMenu}>
                            <Text style={{ fontSize: 24 }}>☰</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.title}>HealthyRide</Text>
                </View>

                {/* Balance */}
                <View style={styles.balanceContainer}>
                    <TouchableOpacity onPress={() => setIsBalanceModalVisible(true)}>
                        <Icon name="credit-card" size={24} color="#333" />
                        <Text style={styles.balanceText}>{truncatedBalance} ₽</Text>
                    </TouchableOpacity>
                </View>

                {/* Map with update button */}
                <View style={styles.mapContainer}>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        region={{
                            latitude: userLocation.latitude,
                            longitude: userLocation.longitude,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        }}
                        showsUserLocation={true}
                        followsUserLocation={true}
                        scrollEnabled={!menuOpen}
                        zoomEnabled={!menuOpen}
                    >
                        <AnimatedUpdateButton onPress={loadStations} />
                        {stations.map((station) => (
                            <Marker
                                key={station.id}
                                coordinate={{
                                    latitude: station.latitude,
                                    longitude: station.longitude,
                                }}
                                image={require('../assets/images/scooter.png')}
                                title={station.name}
                                description={`Доступно велосипедов: ${station.availableBikes}`}
                                onPress={() => handleMarkerPress(station)}
                                calloutOffset={{ x: 0.5, y: 0.5 }}
                            />
                        ))}
                    </MapView>
                </View>

                {/* Rental status */}
                <View style={styles.infoContainer}>
                    <Text style={styles.infoHeader}>Статус аренды</Text>
                    <Text style={styles.infoText}>Время: {formatTime(rentalTime)}</Text>
                    <Text style={styles.infoText}>Сумма: {spentAmount} ₽</Text>
                    {isRented && (
                        <TouchableOpacity style={styles.stopButton} onPress={handleStopRide}>
                            <Text style={styles.stopButtonText}>Остановить аренду</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Modal: Bicycle list */}
                <Modal
                    isVisible={isModalVisible}
                    swipeDirection={['down']}
                    onSwipeComplete={() => setIsModalVisible(false)}
                    onBackdropPress={() => setIsModalVisible(false)}
                    swipeThreshold={100}
                    style={styles.modal}
                >
                    <SafeAreaView style={styles.limitedModalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Велосипеды на станции: {selectedStation?.name}</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <Text style={styles.closeButton}>×</Text>
                            </TouchableOpacity>
                        </View>
                        {loadingBicycles ? (
                            <ActivityIndicator size="large" color="#0000ff" />
                        ) : errorBicycles ? (
                            <Text style={styles.errorText}>{errorBicycles}</Text>
                        ) : (
                            <FlatList
                                data={bicycles}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderBicycleItem}
                                contentContainerStyle={styles.bicycleList}
                                ListEmptyComponent={<Text>Нет доступных велосипедов.</Text>}
                            />
                        )}
                    </SafeAreaView>
                </Modal>

                {/* Modal: Balance top-up */}
                <Modal
                    isVisible={isBalanceModalVisible}
                    onBackdropPress={() => setIsBalanceModalVisible(false)}
                    style={styles.modal}
                >
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.balanceModalContainer}>
                        <Text style={styles.modalTitle}>Пополнить баланс</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Введите сумму"
                            keyboardType="numeric"
                            value={addAmount}
                            onChangeText={setAddAmount}
                        />
                        <Button title="Пополнить" onPress={handleAddBalance} />
                    </KeyboardAvoidingView>
                </Modal>

                {/* Custom QR Scanner (instead of the old QRScannerModal) */}
                {isScannerVisible && (
                    <View style={styles.scannerModalContainer}>
                        <CustomQRScanner
                            onClose={() => {
                                console.log('CustomQRScanner onClose called');
                                setIsScannerVisible(false);
                            }}
                            onBarcodeScanned={(data) => {
                                console.log('CustomQRScanner onBarcodeScanned called with data:', data);
                                handleBarcodeScanned(data);
                            }}
                        />
                    </View>
                )}
            </SafeAreaView>
        </MenuDrawer>
    );
}

const styles = StyleSheet.create({
    modal: {
        margin: 0,
        justifyContent: 'flex-end',
    },
    limitedModalContainer: {
        height: height * 0.7,
        backgroundColor: '#E17564',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    container: {
        flex: 1,
        backgroundColor: '#F29F58',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: height * 0.02,
        marginBottom: height * 0.02,
        paddingHorizontal: width * 0.05,
    },
    burgerMenuPlaceholder: {
        marginRight: 10,
    },
    title: {
        fontSize: width * 0.05,
        fontWeight: 'bold',
        color: '#333',
    },
    mapContainer: {
        flex: 1,
        marginHorizontal: width * 0.05,
        marginBottom: height * 0.02,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ccc',
        shadowColor: '#000',
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
        backgroundColor: '#988A7D',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#1B1833',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    infoHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    infoText: {
        color: 'black',
        textAlign: 'center',
        marginVertical: 2,
    },
    stopButton: {
        marginTop: 10,
        backgroundColor: '#D9534F',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
        alignSelf: 'center',
    },
    stopButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    closeButton: {
        fontSize: 24,
        color: '#ffffff',
    },
    bicycleList: {
        paddingBottom: 20,
    },
    bicycleItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    bicycleText: {
        fontSize: 16,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
    balanceContainer: {
        position: 'absolute',
        top: height * 0.03,
        right: width * 0.01,
        borderRadius: 10,
        padding: 40,
        flexDirection: 'row',
        alignItems: 'center',
    },
    balanceText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 30,
        bottom: 25,
    },
    balanceModalContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        width: '80%',
        padding: 10,
        marginVertical: 10,
    },
    rentButton: {
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: '#4CAF50',
        borderRadius: 5,
        alignItems: 'center',
    },
    rentButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    updateButtonContainer: {
        position: 'absolute',
        bottom: 10,
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
    debugText: {
        color: 'yellow',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
    },
    // Styles for the custom QR scanner
    scannerModalContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'black',
        zIndex: 2000,
    },
    scannerContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'black',
    },
    scannerMessage: {
        textAlign: 'center',
        color: 'white',
        paddingBottom: 10,
    },
    scannerCamera: {
        flex: 1,
    },
    scannerButtonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    scannerButton: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 10,
        borderRadius: 5,
    },
    scannerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    scannerCloseButton: {
        marginTop: 20,
        alignSelf: 'center',
        padding: 10,
    },
    scannerCloseText: {
        fontSize: 18,
        color: 'white',
    },
});

