import React, { useState, useContext, useEffect, useRef } from 'react';
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
} from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import MenuDrawer from '../components/MenuDrawer';
import { AuthContext } from '../context/AuthContext';
import { fetchStations, Station, createStation, CreateStationRequest } from '../services/stationService';
import { fetchBicyclesByStationId, Bicycle } from '../services/fetchBicyclesByStation';
import Modal from 'react-native-modal';

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
    const [menuOpen, setMenuOpen] = useState(false);
    const mapRef = useRef<MapView>(null);
    const [stations, setStations] = useState<Station[]>([]);

    // States for showing bike list modal when clicking on a marker
    const [selectedStation, setSelectedStation] = useState<Station | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [bicycles, setBicycles] = useState<Bicycle[]>([]);
    const [loadingBicycles, setLoadingBicycles] = useState(false);
    const [errorBicycles, setErrorBicycles] = useState<string | null>(null);

    // States for creating a new station
    const [isCreateStationModalVisible, setIsCreateStationModalVisible] = useState(false);
    const [newStationCoords, setNewStationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [newStationName, setNewStationName] = useState('');
    const [creatingStation, setCreatingStation] = useState(false);

    // Load stations on mount (or when userToken changes)
    useEffect(() => {
        loadStations();
    }, [userToken]);

    const loadStations = async () => {
        try {
            const stationData = await fetchStations(userToken!);
            setStations(stationData);
        } catch (error) {
            console.error('Ошибка загрузки станций', error);
            Alert.alert('Ошибка', 'Не удалось загрузить станции');
        }
    };

    // When a station marker is pressed, open the modal and load bikes for that station
    const handleMarkerPress = async (station: Station) => {
        setSelectedStation(station);
        setIsModalVisible(true);
        setLoadingBicycles(true);
        setErrorBicycles(null);

        try {
            const bicycleData = await fetchBicyclesByStationId(station.id, userToken!);
            setBicycles(bicycleData);
        } catch (error: any) {
            console.error('Ошибка загрузки велосипедов', error);
            setErrorBicycles('Не удалось загрузить велосипеды.');
            Alert.alert('Ошибка', error.message || 'Не удалось загрузить велосипеды.');
        } finally {
            setLoadingBicycles(false);
        }
    };

    // When the user long-presses the map, open the "create station" modal.
    const handleMapLongPress = (event: SimpleMapEvent) => {
        const { coordinate } = event.nativeEvent;
        setNewStationCoords(coordinate);
        setNewStationName(''); // Reset station name
        setIsCreateStationModalVisible(true);
    };

    // Call the createStation service to add a new station.
    const handleCreateStation = async () => {
        if (!newStationCoords || !newStationName.trim()) {
            Alert.alert('Ошибка', 'Введите название станции.');
            return;
        }

        setCreatingStation(true);
        try {
            // Build the request payload according to your CreateStationRequest DTO
            const requestPayload: CreateStationRequest = {
                name: newStationName,
                coordinates: {
                    latitude: newStationCoords.latitude,
                    longitude: newStationCoords.longitude,
                },
            };

            const newStation = await createStation(requestPayload, userToken!);
            Alert.alert('Успех', `Станция "${newStation.name}" создана!`);
            // Reload stations to include the new one
            loadStations();
            setIsCreateStationModalVisible(false);
        } catch (error: any) {
            console.error('Ошибка создания станции', error);
            Alert.alert('Ошибка', error.message || 'Не удалось создать станцию.');
        } finally {
            setCreatingStation(false);
        }
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    // Render a single bicycle item in the FlatList (for existing station modal)
    const renderBicycleItem = ({ item }: { item: Bicycle }) => (
        <View style={styles.bicycleItem}>
            <Text style={styles.bicycleText}>ID: {item.id}</Text>
            <Text style={styles.bicycleText}>Модель: {item.model}</Text>
            <Text style={styles.bicycleText}>Тип: {item.type}</Text>
            <Text style={styles.bicycleText}>Статус: {item.status}</Text>
            {/* Additional admin actions can be added here */}
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
                        onLongPress={handleMapLongPress} // Trigger new station creation
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

                {/* Modal for displaying the list of bicycles at a station */}
                <Modal
                    isVisible={isModalVisible}
                    onBackdropPress={() => setIsModalVisible(false)}
                    onSwipeComplete={() => setIsModalVisible(false)}
                    swipeDirection={['down']}
                    style={styles.modal}
                >
                    <SafeAreaView style={styles.modalContainer}>
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

                {/* Modal for creating a new station */}
                <Modal
                    isVisible={isCreateStationModalVisible}
                    onBackdropPress={() => setIsCreateStationModalVisible(false)}
                    onSwipeComplete={() => setIsCreateStationModalVisible(false)}
                    swipeDirection={['down']}
                    style={styles.modal}
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
            </SafeAreaView>
        </MenuDrawer>
    );
}

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
    },
    title: {
        fontSize: width * 0.05,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
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
    modal: {
        margin: 0,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        height: height * 0.7,
        backgroundColor: '#E17564',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
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
        color: '#fff',
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
        color: '#fff',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
    form: {
        marginTop: 10,
    },
    label: {
        color: '#fff',
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
        color: '#fff',
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
});
