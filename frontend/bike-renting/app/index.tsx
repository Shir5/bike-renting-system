import React, { useContext, useState, useEffect } from 'react';
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
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchStations, Station } from '../services/stationService';
import { fetchBicyclesByStationId, Bicycle } from '../services/fetchBicyclesByStation';
import { AuthContext } from '../context/AuthContext';
import MenuDrawer from '../components/MenuDrawer';
import Modal from 'react-native-modal'; // Используем react-native-modal
import Icon from 'react-native-vector-icons/FontAwesome';
import { fetchUserInfo } from '@/services/userService';
import { addBalance } from '@/services/paymentService';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const { userToken, login, logout } = useContext(AuthContext);
    const [menuOpen, setMenuOpen] = useState(false);
    const [stations, setStations] = useState<Station[]>([]);
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [bicycles, setBicycles] = useState<Bicycle[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loadingBicycles, setLoadingBicycles] = useState(false);
    const [errorBicycles, setErrorBicycles] = useState<string | null>(null);
    const [userBalance, setUserBalance] = useState<number>(100); // Текущий баланс пользователя
    const [isBalanceModalVisible, setIsBalanceModalVisible] = useState(false);
    const [addAmount, setAddAmount] = useState<string>(''); // Сумма для пополнения
    const truncatedBalance = userBalance.toString().slice(0, 6);

    const handleRentBicycle = async (bicycleId: number) => {
        try {
            // Здесь будет ваш запрос на сервер для аренды велосипеда
            // Например:
            // await rentBicycle(bicycleId, userToken);

            Alert.alert('Успех', `Велосипед с ID ${bicycleId} успешно арендован!`);
        } catch (error: any) {
            Alert.alert('Ошибка', error.message || 'Не удалось арендовать велосипед.');
        }
    };

    const loadStations = async () => {
        try {
            const stationData = await fetchStations(userToken);
            setStations(stationData);
        } catch (error: any) {
            Alert.alert('Ошибка', error.message || 'Не удалось загрузить станции.');
        }
    };


    useEffect(() => {
        const initialize = async () => {
            try {
                if (!userToken) {
                    console.warn('Токен отсутствует.');
                    Alert.alert('Ошибка', 'Токен отсутствует. Пожалуйста, войдите в систему.');
                    setIsLoading(false);
                    return;
                }

                const userInfo = await fetchUserInfo(userToken);

                if (userInfo) {
                    setUserBalance(userInfo.balance); // Устанавливаем баланс текущего пользователя
                } else {
                    console.warn('Не удалось получить данные пользователя.');
                    Alert.alert('Ошибка', 'Не удалось загрузить данные пользователя.');
                }
            } catch (error) {
                console.error('Ошибка при инициализации:', error);
                Alert.alert('Ошибка', 'Произошла ошибка при загрузке данных.');
            } finally {
                setIsLoading(false); // Завершаем загрузку
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
            const bicycleData = await fetchBicyclesByStationId(station.id, userToken);
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

    const renderBicycleItem = ({ item }: { item: Bicycle }) => (
        <View style={styles.bicycleItem}>
            <Text style={styles.bicycleText}>Модель: {item.model}</Text>
            <Text style={styles.bicycleText}>Тип: {item.type}</Text>
            <Text style={styles.bicycleText}>Статус: {item.status}</Text>
            <TouchableOpacity
                style={styles.rentButton}
                onPress={() => handleRentBicycle(item.id)}
            >
                <Text style={styles.rentButtonText}>Арендовать</Text>
            </TouchableOpacity>
        </View>
    );
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
            const response = await addBalance(amount, userToken); // Передаем userToken
            setUserBalance((prevBalance) => prevBalance + amount);
            setAddAmount('');
            setIsBalanceModalVisible(false);
            Alert.alert('Успех', `Баланс пополнен на ${amount} ₽`);
        } catch (error: any) {
            console.error('Ошибка при пополнении баланса:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                headers: error.response?.headers,
            });

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
                        <Text style={styles.balanceText} >{truncatedBalance} ₽</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: 59.9343,
                            longitude: 30.3351,
                            latitudeDelta: 0.1,
                            longitudeDelta: 0.1,
                        }}
                        scrollEnabled={!menuOpen}
                        zoomEnabled={!menuOpen}
                    >
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
                                calloutOffset={{x: 0.5 , y: 0.5}}
                            />
                        ))}
                    </MapView>
                </View>

                <View style={styles.infoContainer}>
                    <Button
                        title="Обновить станции"
                        onPress={loadStations}
                        color="#FFFFFF"
                    />
                    <Button
                        title="Проверить токен"
                        onPress={() => {
                            userToken
                                ? Alert.alert('Токен валиден', `Ваш токен: ${userToken}`)
                                : Alert.alert('Ошибка', 'Токен отсутствует. Пожалуйста, войдите.');
                        }}
                        color="#FFFFFF"
                    />
                    <Button
                        title="Выйти"
                        onPress={logout}
                        color="#FFFFFF"
                    />
                </View>

                {/* Модальное окно для отображения велосипедов */}
                <Modal
                    isVisible={isModalVisible}
                    swipeDirection={['down']} // Позволяет закрывать свайпом вниз
                    onSwipeComplete={() => setIsModalVisible(false)}
                    onBackdropPress={() => setIsModalVisible(false)} // Закрытие при нажатии вне модального окна
                    swipeThreshold={100} // Чувствительность свайпа
                    style={styles.modal}
                >
                    <SafeAreaView style={styles.limitedModalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Велосипеды на станции: {selectedStation?.name}
                            </Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
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
                <Modal
                    isVisible={isBalanceModalVisible}
                    onBackdropPress={() => setIsBalanceModalVisible(false)} // Закрытие при клике на фон
                    style={styles.modal}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Используем 'padding' для iOS
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
                            title="Пополнить"
                            onPress={handleAddBalance}
                        />
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
        margin: 15,
        paddingHorizontal: width * 0.04,
        paddingVertical: height * 0.02,
        backgroundColor: '#AB4459',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#1B1833',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    modalContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#AB4459',
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
        backgroundColor: '#4CAF50', // Зеленый цвет для кнопки
        borderRadius: 5,
        alignItems: 'center',
    },
    rentButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
