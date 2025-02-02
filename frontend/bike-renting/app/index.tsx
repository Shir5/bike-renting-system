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
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { fetchStations, Station } from '../services/stationService';
import { fetchBicyclesByStationId, Bicycle } from '../services/fetchBicyclesByStation';
import { AuthContext } from '../context/AuthContext';
import MenuDrawer from '../components/MenuDrawer';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/FontAwesome';
import { fetchUserInfo } from '@/services/userService';
import { addBalance } from '@/services/paymentService';
import { createRental, updateRental } from '../services/rentalService';

const { width, height } = Dimensions.get('window');
const TARIFF_PER_MINUTE = 1.5; // For local UI display of spending

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
        <TouchableOpacity
            style={styles.updateButtonContainer}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <Animated.Image
                source={require('../assets/images/reload.png')}
                style={[
                    styles.updateButton,
                    { transform: [{ rotate: spin }], tintColor: 'black' },
                ]}
            />
        </TouchableOpacity>
    );
};

export default function HomeScreen() {
    // Get token and user ID from AuthContext
    const { userToken, user } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [stations, setStations] = useState<Station[]>([]);
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [bicycles, setBicycles] = useState<Bicycle[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loadingBicycles, setLoadingBicycles] = useState(false);
    const [errorBicycles, setErrorBicycles] = useState<string | null>(null);
    const [userBalance, setUserBalance] = useState<number>(100);
    const [isBalanceModalVisible, setIsBalanceModalVisible] = useState(false);
    const [addAmount, setAddAmount] = useState<string>('');
    const truncatedBalance = userBalance.toString().slice(0, 6);
    const [currentBicycleId, setCurrentBicycleId] = useState<number | null>(null);

    // Rental state for UI feedback
    const [isRented, setIsRented] = useState(false);
    const [rentalTime, setRentalTime] = useState(0);
    const [currentRentalId, setCurrentRentalId] = useState<number | null>(null);

    // Geolocation state using expo-location
    const [userLocation, setUserLocation] = useState({
        latitude: 59.9343,
        longitude: 30.3351,
    });
    const mapRef = useRef<MapView>(null);

    // Helper to format time (mm:ss)
    const formatTime = (timeInSeconds: number) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Calculate local spending (for UI display)
    const spentAmount = ((rentalTime / 60) * TARIFF_PER_MINUTE).toFixed(2);

    // Start local timer when a rental is active
    useEffect(() => {
        let timerId: NodeJS.Timeout;
        if (isRented) {
            timerId = setInterval(() => {
                setRentalTime(prevTime => prevTime + 1);
            }, 1000);
        }
        return () => {
            if (timerId) clearInterval(timerId);
        };
    }, [isRented]);

    // Update location and recenter map
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
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active') {
                updateLocation();
            }
        });
        return () => subscription.remove();
    }, []);

    // Load stations using the token from AuthContext
    const loadStations = async () => {
        try {
            const stationData = await fetchStations(userToken!);
            setStations(stationData);
        } catch (error: any) {
            Alert.alert('Ошибка', error.message || 'Не удалось загрузить станции.');
        }
    };

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

    useEffect(() => {
        loadStations();
    }, []);

    const handleMarkerPress = async (station: Station) => {
        setSelectedStation(station);
        setIsModalVisible(true);
        setLoadingBicycles(true);
        setErrorBicycles(null);
        try {
            const bicycleData = await fetchBicyclesByStationId(station.id, userToken!);
            setBicycles(bicycleData);
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

    // Render a bicycle item. When "Арендовать" is pressed, we use the userToken and user from AuthContext.
    const renderBicycleItem = ({ item }: { item: Bicycle }) => (
        <View style={styles.bicycleItem}>
            <Text style={styles.bicycleText}>Модель: {item.model}</Text>
            <Text style={styles.bicycleText}>Тип: {item.type}</Text>
            <Text style={styles.bicycleText}>Статус: {item.status}</Text>
            <TouchableOpacity
                style={styles.rentButton}
                onPress={() => {
                    if (!userToken || user === null) {
                        Alert.alert('Ошибка', 'Пользователь не авторизован.');
                        return;
                    }
                    if (!selectedStation?.id) {
                        Alert.alert('Ошибка', 'Не удалось определить станцию начала аренды.');
                        return;
                    }
                    createRental(userToken, user, item.id, selectedStation.id)
                        .then((rentalData) => {
                            setCurrentRentalId(rentalData.id);
                            setCurrentBicycleId(item.id);
                            setIsRented(true);
                            setRentalTime(0);
                        })
                        .catch((err) => {
                            Alert.alert('Ошибка', err.message || 'Не удалось начать аренду.');
                        });
                }}
            >
                <Text style={styles.rentButtonText}>Арендовать</Text>
            </TouchableOpacity>
        </View>
    );

    // Stop the rental
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
        updateRental(
            userToken!,
            currentRentalId!,
            user!,           // передаём сам user, так как это идентификатор
            currentBicycleId!, // идентификатор велосипеда
            selectedStation.id, // id станции завершения
            calculatedCost     // рассчитанная стоимость аренды
        )
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
            setUserBalance(prevBalance => prevBalance + amount);
            setAddAmount('');
            setIsBalanceModalVisible(false);
            Alert.alert('Успех', `Баланс пополнен на ${amount} ₽`);
        } catch (error: any) {
            console.error('Ошибка при пополнении баланса:', error);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            const errorMessage =
                error.response?.data?.message ||
                (error.response?.status === 403
                    ? 'У вас нет доступа для выполнения этого действия.'
                    : 'Не удалось пополнить баланс. Повторите попытку позже.');
            Alert.alert('Ошибка', errorMessage);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </SafeAreaView>
        );
    }

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
                {/* Map with animated update button */}
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
                {/* Rental Status & Spending Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.infoHeader}>Статус аренды</Text>
                    <Text style={styles.infoText}>Время: {formatTime(rentalTime)}</Text>
                    <Text style={styles.infoText}>Локально (UI): {spentAmount} ₽</Text>
                    {isRented && (
                        <TouchableOpacity style={styles.stopButton} onPress={handleStopRide}>
                            <Text style={styles.stopButtonText}>Остановить аренду</Text>
                        </TouchableOpacity>
                    )}
                </View>
                {/* Modal for bicycles at a station */}
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
                            <Text style={styles.modalTitle}>
                                Велосипеды на станции: {selectedStation?.name}
                            </Text>
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
                {/* Modal for balance top-up */}
                <Modal
                    isVisible={isBalanceModalVisible}
                    onBackdropPress={() => setIsBalanceModalVisible(false)}
                    style={styles.modal}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                        <Button title="Пополнить" onPress={handleAddBalance} />
                    </KeyboardAvoidingView>
                </Modal>
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
        display: 'flex',
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
});
