import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    Alert,
    FlatList,
    TextInput,
    NativeSyntheticEvent,
    NativeScrollEvent,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import React, { useState, useContext, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';

import MenuDrawer from '../components/MenuDrawer';
import { AuthContext } from '../context/AuthContext';

// Сервисы станций
import {
    fetchStations,
    Station,
    createStation,
    CreateStationRequest,
    deleteStation,  // Новое
} from '../services/stationService';

// Сервисы велосипедов/ремонтов
import {
    addBicycle,
    CreateBicycleRequest,
    createRepair,
    updateRepair,
    Bicycle,
    fetchRepairs,
    RepairDto,
    deleteBicycle,
} from '../services/bicycleService';

import { fetchBicyclesByStationId } from '@/services/fetchBicyclesByStation';

const { width, height } = Dimensions.get('window');

interface SimpleMapEvent {
    nativeEvent: {
        coordinate: {
            latitude: number;
            longitude: number;
        };
    };
}

export default function AdminScreen() {
    const { userToken } = useContext(AuthContext);

    // repairMapRef хранит пару: { [bikeId: number]: repairId }, или undefined
    const repairMapRef = useRef<{ [bikeId: number]: number | undefined }>({});

    const [menuOpen, setMenuOpen] = useState(false);
    const mapRef = useRef<MapView>(null);

    // Список станций
    const [stations, setStations] = useState<Station[]>([]);

    // Модалка со списком велосипедов на станции
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [isBikeModalVisible, setIsBikeModalVisible] = useState(false);
    const [bicycles, setBicycles] = useState<Bicycle[]>([]);
    const [loadingBicycles, setLoadingBicycles] = useState(false);
    const [errorBicycles, setErrorBicycles] = useState<string | null>(null);
    const [scrollOffset, setScrollOffset] = useState(0);

    // Модалка для создания станции
    const [isCreateStationModalVisible, setIsCreateStationModalVisible] = useState(false);
    const [newStationCoords, setNewStationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [newStationName, setNewStationName] = useState('');
    const [creatingStation, setCreatingStation] = useState(false);

    // Модалка для создания велосипеда
    const [isCreateBikeModalVisible, setIsCreateBikeModalVisible] = useState(false);
    const [bikeModel, setBikeModel] = useState('');
    const [bikeType, setBikeType] = useState('');
    const [bikeStatus, setBikeStatus] = useState('');
    const [creatingBike, setCreatingBike] = useState(false);
    const [pendingOpenCreateBike, setPendingOpenCreateBike] = useState(false);

    // Справочное модальное окно
    const [helpModalVisible, setHelpModalVisible] = useState(false);

    // Данные для полей ввода при создании велосипеда
    const BICYCLE_MODELS = [
        'BICYCLE322',
        'BICYCLE432',
        'BICYCLE448',
        'BICYCLE48',
        'BICYCLE50',
        'BICYCLE60',
        'BICYCLE80',
    ];
    const BICYCLE_TYPES = ['MOUNTAIN', 'HIGHWAY', 'UNIVERSAL'];
    const BICYCLE_STATUSES = ['AVAILABLE', 'RENTED', 'UNAVAILABLE'];

    useEffect(() => {
        loadStations();
    }, [userToken]);

    const loadStations = async () => {
        if (!userToken) {
            console.warn('[loadStations] Нет токена! Пропускаем загрузку.');
            return;
        }
        console.log('[loadStations] Начинаем загрузку станций...');
        try {
            const stationData = await fetchStations(userToken);
            console.log('[loadStations] Станции получены:', stationData);
            setStations(stationData);
        } catch (error) {
            console.error('[loadStations] Ошибка загрузки станций', error);
            Alert.alert('Ошибка', 'Не удалось загрузить станции');
        }
    };

    const handleMarkerPress = async (station: Station) => {
        console.log(`[handleMarkerPress] Нажат маркер станции ID=${station.id}, имя="${station.name}"`);
        setSelectedStation(station);
        setIsBikeModalVisible(true);
        setLoadingBicycles(true);
        setErrorBicycles(null);

        try {
            const bicycleData = await fetchBicyclesByStationId(station.id, userToken!);
            console.log('[handleMarkerPress] Велосипеды получены:', bicycleData);

            console.log('[handleMarkerPress] -> fetchRepairs()...');
            const repairPage = await fetchRepairs(userToken);
            const allRepairs = repairPage.content;
            console.log('[handleMarkerPress] Все ремонты (первая страница):', allRepairs);

            const inProgressMap = new Map<number, number>();
            allRepairs.forEach((r: RepairDto) => {
                if (r.status === 'IN_PROGRESS') {
                    inProgressMap.set(r.bicycle, r.id);
                }
            });
            console.log('[handleMarkerPress] Словарь (inProgressMap):', inProgressMap);

            const mergedBicycles = bicycleData.map((bike) => {
                const localRepairId = repairMapRef.current[bike.id];
                const serverInProgressId = inProgressMap.get(bike.id);
                const finalRepairId = serverInProgressId ?? localRepairId;

                if (finalRepairId) {
                    console.log(`[handleMarkerPress] Велосипед #${bike.id} в ремонте, repairId=${finalRepairId}`);
                    return {
                        ...bike,
                        repairId: finalRepairId,
                        status: 'UNAVAILABLE',
                    };
                } else {
                    return bike;
                }
            });

            console.log('[handleMarkerPress] Итоговый массив велосипедов (merged):', mergedBicycles);
            setBicycles(mergedBicycles);
        } catch (error: any) {
            console.error('[handleMarkerPress] Ошибка загрузки велосипедов или ремонтов', error);
            setErrorBicycles('Не удалось загрузить велосипеды.');
            Alert.alert('Ошибка', error.message || 'Не удалось загрузить велосипеды.');
        } finally {
            setLoadingBicycles(false);
        }
    };

    const handleBikeListScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        setScrollOffset(event.nativeEvent.contentOffset.y);
    };

    const handleMapLongPress = (event: SimpleMapEvent) => {
        const { coordinate } = event.nativeEvent;
        console.log('[handleMapLongPress] Долгое нажатие на координатах:', coordinate);
        setNewStationCoords(coordinate);
        setNewStationName('');
        setIsCreateStationModalVisible(true);
    };

    const handleCreateStation = async () => {
        console.log('[handleCreateStation] Попытка создания станции...');
        if (!newStationCoords || !newStationName.trim()) {
            Alert.alert('Ошибка', 'Введите название станции.');
            console.warn('[handleCreateStation] Название не введено или нет координат.');
            return;
        }

        setCreatingStation(true);
        try {
            const requestPayload: CreateStationRequest = {
                name: newStationName,
                coordinates: {
                    latitude: newStationCoords.latitude,
                    longitude: newStationCoords.longitude,
                },
            };
            console.log('[handleCreateStation] Payload:', requestPayload);

            const newStation = await createStation(requestPayload, userToken!);
            console.log('[handleCreateStation] Станция успешно создана:', newStation);
            Alert.alert('Успех', `Станция "${newStation.name}" создана!`);
            loadStations();
            setIsCreateStationModalVisible(false);
        } catch (error: any) {
            console.error('[handleCreateStation] Ошибка создания станции', error);
            Alert.alert('Ошибка', error.message || 'Не удалось создать станцию.');
        } finally {
            setCreatingStation(false);
        }
    };

    const handleCreateBicycle = async () => {
        console.log('[handleCreateBicycle] Попытка создания велосипеда...');
        if (!selectedStation) {
            Alert.alert('Ошибка', 'Станция не выбрана.');
            console.warn('[handleCreateBicycle] Станция не выбрана!');
            return;
        }
        if (!bikeModel.trim() || !bikeType.trim() || !bikeStatus.trim()) {
            console.warn('[handleCreateBicycle] Не все поля велосипеда заполнены.');
            Alert.alert('Ошибка', 'Заполните все поля велосипеда.');
            return;
        }

        setCreatingBike(true);

        const requestPayload: CreateBicycleRequest = {
            model: bikeModel.trim(),
            type: bikeType.trim(),
            status: bikeStatus.trim(),
            station: selectedStation.id,
        };

        console.log('[handleCreateBicycle] Payload:', requestPayload);

        try {
            const newBike = await addBicycle(requestPayload, userToken);
            console.log('[handleCreateBicycle] Велосипед успешно создан:', newBike);
            Alert.alert('Успех', `Велосипед создан с ID ${newBike.id}`);

            setBicycles((prevBikes) => [...prevBikes, newBike]);
            setIsCreateBikeModalVisible(false);
            setBikeModel('');
            setBikeType('');
            setBikeStatus('');
        } catch (error: any) {
            console.error('[handleCreateBicycle] Ошибка создания велосипеда', error);
            Alert.alert('Ошибка', error.message || 'Не удалось создать велосипед.');
        } finally {
            setCreatingBike(false);
        }
    };

    const handleDeleteBicycle = async (bike: Bicycle) => {
        console.log(`[handleDeleteBicycle] Попытка удалить велосипед #${bike.id}...`);
        Alert.alert(
            'Подтверждение',
            `Вы уверены, что хотите удалить велосипед #${bike.id}?`,
            [
                {
                    text: 'Отмена',
                    style: 'cancel',
                },
                {
                    text: 'Удалить',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteBicycle(bike.id, userToken);
                            console.log(`[handleDeleteBicycle] Велосипед #${bike.id} удалён успешно.`);
                            setBicycles((prev) => prev.filter((b) => b.id !== bike.id));
                            Alert.alert('Успех', 'Велосипед удалён!');
                        } catch (error: any) {
                            console.error('[handleDeleteBicycle] Ошибка удаления велосипеда:', error);
                            Alert.alert('Ошибка', error.message || 'Не удалось удалить велосипед.');
                        }
                    },
                },
            ]
        );
    };

    const handleSendToRepair = async (bike: Bicycle) => {
        console.log(`[handleSendToRepair] Отправляем велосипед #${bike.id} в ремонт...`);
        try {
            const repairRecord = await createRepair(
                {
                    bicycle: bike.id,
                    technician: 1,
                    description: 'Отправка велосипеда в ремонт',
                },
                userToken
            );
            console.log('[handleSendToRepair] Запись ремонта создана:', repairRecord);

            const updatedBike = { ...bike, status: 'UNAVAILABLE', repairId: repairRecord.id };
            repairMapRef.current[bike.id] = repairRecord.id;

            setBicycles((prevBikes) => prevBikes.map((b) => (b.id === bike.id ? updatedBike : b)));
            Alert.alert('Успех', 'Велосипед отправлен на ремонт');
        } catch (error: any) {
            console.error('[handleSendToRepair] Ошибка отправки велосипеда в ремонт', error);
            Alert.alert('Ошибка', error.message || 'Не удалось отправить велосипед в ремонт');
        }
    };

    const handleReturnFromRepair = async (bike: Bicycle) => {
        console.log(`[handleReturnFromRepair] Возвращаем велосипед #${bike.id} с ремонта...`);
        if (!bike.repairId) {
            Alert.alert('Ошибка', 'Нет записи ремонта для данного велосипеда');
            console.warn(`[handleReturnFromRepair] У велосипеда #${bike.id} нет repairId!`);
            return;
        }
        try {
            await updateRepair(bike.repairId, { bicycle: bike.id }, userToken);
            console.log('[handleReturnFromRepair] Ремонт завершён для ID:', bike.repairId);

            const updatedBike = { ...bike, status: 'AVAILABLE', repairId: undefined };
            repairMapRef.current[bike.id] = undefined;

            setBicycles((prevBikes) => prevBikes.map((b) => (b.id === bike.id ? updatedBike : b)));
            Alert.alert('Успех', 'Велосипед возвращен с ремонта');
        } catch (error: any) {
            console.error('[handleReturnFromRepair] Ошибка возврата велосипеда с ремонта', error);
            Alert.alert('Ошибка', error.message || 'Не удалось вернуть велосипед с ремонта');
        }
    };

    // -------------------------
    // НОВОЕ: Удаление станции
    // -------------------------
    const handleDeleteStation = async () => {
        if (!selectedStation) return;
        Alert.alert(
            'Подтверждение',
            `Вы уверены, что хотите удалить станцию "${selectedStation.name}" (ID=${selectedStation.id})?`,
            [
                { text: 'Отмена', style: 'cancel' },
                {
                    text: 'Удалить',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteStation(selectedStation.id, userToken);
                            Alert.alert('Успех', `Станция "${selectedStation.name}" удалена!`);
                            // Убираем станцию из списка (или перезагружаем loadStations)
                            setStations((prev) => prev.filter((st) => st.id !== selectedStation.id));
                            // Закрываем модалку
                            setIsBikeModalVisible(false);
                            setSelectedStation(null);
                        } catch (err: any) {
                            Alert.alert('Ошибка', err.message || 'Не удалось удалить станцию.');
                        }
                    },
                },
            ]
        );
    };

    const toggleMenu = () => {
        console.log('[toggleMenu] Меню переключено, menuOpen=', !menuOpen);
        setMenuOpen(!menuOpen);
    };

    const openHelpModal = () => {
        setHelpModalVisible(true);
    };
    const closeHelpModal = () => {
        setHelpModalVisible(false);
    };

    const renderBicycleItem = ({ item }: { item: Bicycle }) => (
        <View style={styles.bicycleItem}>
            <Text style={styles.bicycleText}>ID: {item.id}</Text>
            <Text style={styles.bicycleText}>Модель: {item.model}</Text>
            <Text style={styles.bicycleText}>Тип: {item.type}</Text>
            <Text style={styles.bicycleText}>Статус: {item.status}</Text>
            <Text style={styles.bicycleText}>Repair ID: {item.repairId ?? '—'}</Text>
            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#d9534f' }]}
                    onPress={() => handleSendToRepair(item)}
                >
                    <Text style={styles.actionButtonText}>Отправить на ремонт</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#5cb85c' }]}
                    onPress={() => handleReturnFromRepair(item)}
                >
                    <Text style={styles.actionButtonText}>Вернуть с ремонта</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                style={[styles.deleteButton, { marginTop: 8 }]}
                onPress={() => handleDeleteBicycle(item)}
            >
                <Text style={{ color: '#333' }}>Удалить велосипед</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <MenuDrawer menuOpen={menuOpen} setMenuOpen={setMenuOpen}>
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.header}>
                    <TouchableOpacity onPress={toggleMenu}>
                        <Text style={styles.menuIcon}>☰</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Admin Panel</Text>
                    <TouchableOpacity onPress={openHelpModal} style={{ marginLeft: 'auto' }}>
                        <Text style={styles.helpIcon}>?</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.mapContainer}>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        initialRegion={{
                            latitude: 59.9343,
                            longitude: 30.3351,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        }}
                        showsUserLocation={true}
                        onLongPress={handleMapLongPress}
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
                                calloutOffset={{ x: 0.5, y: 0.5 }}
                            />
                        ))}
                    </MapView>
                </View>

                {/* Модальное окно со списком велосипедов */}
                <Modal
                    isVisible={isBikeModalVisible}
                    style={styles.bottomModal}
                    swipeDirection={['down']}
                    scrollOffset={scrollOffset}
                    scrollOffsetMax={0}
                    propagateSwipe={true}
                    onSwipeComplete={() => setIsBikeModalVisible(false)}
                    onBackdropPress={() => setIsBikeModalVisible(false)}
                    onModalHide={() => {
                        if (pendingOpenCreateBike) {
                            setIsCreateBikeModalVisible(true);
                            setPendingOpenCreateBike(false);
                        }
                    }}
                >
                    <SafeAreaView style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Станция: {selectedStation?.name || '---'}
                            </Text>
                            <TouchableOpacity onPress={() => setIsBikeModalVisible(false)}>
                                <Text style={styles.closeButton}>×</Text>
                            </TouchableOpacity>
                        </View>

                        {/* НОВОЕ: Кнопка "Удалить станцию" */}
                        {selectedStation && (
                            <TouchableOpacity
                                style={[styles.deleteStationButton, { marginBottom: 15 }]}
                                onPress={handleDeleteStation}
                            >
                                <Text style={{ color: '#333', fontSize: 16 }}>Удалить станцию</Text>
                            </TouchableOpacity>
                        )}

                        {loadingBicycles ? (
                            <ActivityIndicator size="large" color="#0000ff" />
                        ) : errorBicycles ? (
                            <Text style={styles.errorText}>{errorBicycles}</Text>
                        ) : (
                            <>
                                <View style={{ maxHeight: height * 0.5 }}>
                                    <FlatList
                                        data={bicycles}
                                        keyExtractor={(item) => item.id.toString()}
                                        renderItem={renderBicycleItem}
                                        contentContainerStyle={styles.bicycleList}
                                        ListEmptyComponent={<Text>Нет доступных велосипедов.</Text>}
                                        onScroll={handleBikeListScroll}
                                        scrollEventThrottle={16}
                                    />
                                </View>

                                <TouchableOpacity
                                    style={styles.createBikeButton}
                                    onPress={() => {
                                        setPendingOpenCreateBike(true);
                                        setIsBikeModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.createBikeButtonText}>Добавить велосипед</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </SafeAreaView>
                </Modal>

                {/* Модальное окно для создания велосипеда */}
                <Modal
                    isVisible={isCreateBikeModalVisible}
                    onBackdropPress={() => setIsCreateBikeModalVisible(false)}
                    onSwipeComplete={() => setIsCreateBikeModalVisible(false)}
                    swipeDirection={['down']}
                    style={styles.bottomModal}
                >
                            <SafeAreaView style={styles.modalContainer}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Новый велосипед</Text>
                                    <TouchableOpacity onPress={() => setIsCreateBikeModalVisible(false)}>
                                        <Text style={styles.closeButton}>×</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.form}>

                                    {/* ------ Модель велосипеда ------ */}
                                    <Text style={styles.label}>Модель велосипеда:</Text>
                                    <View style={styles.radioGroup}>
                                        {BICYCLE_MODELS.map((model) => (
                                            <TouchableOpacity
                                                key={model}
                                                style={[
                                                    styles.radioOption,
                                                    bikeModel === model && styles.radioOptionSelected,
                                                ]}
                                                onPress={() => setBikeModel(model)}
                                            >
                                                <Text style={styles.radioOptionText}>{model}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {/* ------ Тип велосипеда ------ */}
                                    <Text style={styles.label}>Тип велосипеда:</Text>
                                    <View style={styles.radioGroup}>
                                        {BICYCLE_TYPES.map((type) => (
                                            <TouchableOpacity
                                                key={type}
                                                style={[
                                                    styles.radioOption,
                                                    bikeType === type && styles.radioOptionSelected,
                                                ]}
                                                onPress={() => setBikeType(type)}
                                            >
                                                <Text style={styles.radioOptionText}>{type}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {/* ------ Статус велосипеда ------ */}
                                    <Text style={styles.label}>Статус:</Text>
                                    <View style={styles.radioGroup}>
                                        {BICYCLE_STATUSES.map((status) => (
                                            <TouchableOpacity
                                                key={status}
                                                style={[
                                                    styles.radioOption,
                                                    bikeStatus === status && styles.radioOptionSelected,
                                                ]}
                                                onPress={() => setBikeStatus(status)}
                                            >
                                                <Text style={styles.radioOptionText}>{status}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>

                                    {/* ------ Кнопка создания ------ */}
                                    <TouchableOpacity
                                        style={styles.createButton}
                                        onPress={handleCreateBicycle}
                                        disabled={creatingBike}
                                    >
                                        {creatingBike ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.createButtonText}>Создать велосипед</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </SafeAreaView>
                </Modal>


                {/* Модальное окно для создания станции */}
                <Modal
                    isVisible={isCreateStationModalVisible}
                    onBackdropPress={() => setIsCreateStationModalVisible(false)}
                    onSwipeComplete={() => setIsCreateStationModalVisible(false)}
                    swipeDirection={['down']}
                    style={styles.bottomModal}
                >
                        <SafeAreaView style={styles.modalContainer}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Новая станция</Text>
                                <TouchableOpacity onPress={() => setIsCreateStationModalVisible(false)}>
                                    <Text style={styles.closeButton}>×</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.form}>
                                <Text style={styles.label}>Название станции:</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Введите название"
                                    value={newStationName}
                                    onChangeText={setNewStationName}
                                />
                                {newStationCoords && (
                                    <Text style={styles.coordinates}>
                                        Координаты: {newStationCoords.latitude.toFixed(4)},{' '}
                                        {newStationCoords.longitude.toFixed(4)}
                                    </Text>
                                )}
                                <TouchableOpacity
                                    style={styles.createButton}
                                    onPress={handleCreateStation}
                                    disabled={creatingStation}
                                >
                                    {creatingStation ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.createButtonText}>Создать станцию</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </SafeAreaView>
                </Modal>

                {/* Модалка со справкой */}
                <Modal
                    isVisible={helpModalVisible}
                    onBackdropPress={closeHelpModal}
                    onSwipeComplete={closeHelpModal}
                    swipeDirection={['down']}
                    style={styles.bottomModal}
                >
                    <SafeAreaView style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Справка</Text>
                            <TouchableOpacity onPress={closeHelpModal}>
                                <Text style={styles.closeButton}>×</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.helpContent}>
                            <Text style={styles.helpText}>
                                - Для создания новой станции удерживайте палец на карте{'\n'}
                                - Нажмите на маркер, чтобы увидеть список велосипедов{'\n'}
                                - «Отправить на ремонт» — перевести велосипед в статус недоступен{'\n'}
                                - «Вернуть с ремонта» — освободить велосипед{'\n'}
                                - Кнопка удаления: убирает велосипед или станцию из базы{'\n'}
                                - Кнопка удаления станции: удаляет станцию и все велосипеды находящиеся в ней{'\n'}
                                - Свайп вниз внутри модалки закрывает окно
                            </Text>
                        </View>
                    </SafeAreaView>
                </Modal>
            </SafeAreaView>
        </MenuDrawer>
    );
}

// ------------------
// Стили
// ------------------
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F29F58',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: width * 0.05,
        paddingVertical: height * 0.02,
    },
    menuIcon: {
        fontSize: 24,
        marginRight: 10,
    },
    title: {
        fontSize: width * 0.05,
        fontWeight: 'bold',
        color: '#333',
    },
    helpIcon: {
        fontSize: 24,
        color: '#333',
        marginRight: 10,
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

    bottomModal: {
        justifyContent: 'flex-end',
        margin: 0,
        marginBottom: 5,
    },
    modalContainer: {
        backgroundColor: '#E17564',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        fontSize: 24,
        color: '#333',
    },
    bicycleList: {
        paddingBottom: 20,
    },
    bicycleItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#E17564',
        marginVertical: 5,
        borderRadius: 5,
    },
    bicycleText: {
        fontSize: 16,
        color: '#333',
    },
    buttonsContainer: {
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'space-between',
    },
    actionButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    actionButtonText: {
        color: '#333',
        fontSize: 14,
    },
    createBikeButton: {
        marginTop: 15,
        backgroundColor: '#333',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    createBikeButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    deleteButton: {
        backgroundColor: '#f00',
        padding: 8,
        borderRadius: 5,
        alignItems: 'center',
    },

    form: {
        marginTop: 10,
    },
    label: {
        color: '#333',
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 16,
        marginBottom: 10,
    },
    coordinates: {
        color: '#333',
        marginBottom: 10,
    },
    createButton: {
        backgroundColor: '#333',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },

    // Содержимое справки
    helpContent: {
        marginTop: 10,
        marginBottom: 10,

    },
    helpText: {
        color: '#333',
        fontSize: 16,
        lineHeight: 22,
    },
    deleteStationButton: {
        backgroundColor: '#d9534f',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 10,
    },
    radioGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap', // если хотите переносить на новую строку
        marginBottom: 10,
    },
    radioOption: {
        backgroundColor: '#fff',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 5,
        marginRight: 8,
        marginBottom: 8,
    },
    radioOptionSelected: {
        backgroundColor: '#4CAF50', // или любой другой цвет, показывающий «активность»
    },
    radioOptionText: {
        color: '#333',
        fontSize: 14,
    },

});
