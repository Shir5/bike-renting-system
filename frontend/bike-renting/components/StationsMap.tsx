import React, { memo, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import type { Region } from "react-native-maps";
import MapView, { Marker } from "react-native-maps";

import type { Station } from "@/services/stationService";

export type LatLng = { latitude: number; longitude: number };

type StationsMapProps = {
  stations: Station[];
  userLocation: LatLng | null;

  // UI flags
  isMenuOpen?: boolean;

  // callbacks
  onStationPress: (station: Station) => void;
  onReloadPress?: () => void;

  // optional customization
  defaultCenter?: LatLng;
  delta?: { latitudeDelta: number; longitudeDelta: number };
};

const DEFAULT_CENTER: LatLng = { latitude: 59.9343, longitude: 30.3351 };
const DEFAULT_DELTA = { latitudeDelta: 0.05, longitudeDelta: 0.05 };

export const StationsMap = memo(function StationsMap({
  stations,
  userLocation,
  isMenuOpen = false,
  onStationPress,
  onReloadPress,
  defaultCenter = DEFAULT_CENTER,
  delta = DEFAULT_DELTA,
}: StationsMapProps) {
  const mapRef = useRef<MapView>(null);

  // Центрирование при обновлении координат пользователя
  useEffect(() => {
    if (!userLocation) return;

    mapRef.current?.animateToRegion(
      {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: delta.latitudeDelta,
        longitudeDelta: delta.longitudeDelta,
      },
      800,
    );
  }, [userLocation, delta.latitudeDelta, delta.longitudeDelta]);

  const region: Region = {
    latitude: userLocation?.latitude ?? defaultCenter.latitude,
    longitude: userLocation?.longitude ?? defaultCenter.longitude,
    latitudeDelta: delta.latitudeDelta,
    longitudeDelta: delta.longitudeDelta,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        showsUserLocation={!!userLocation}
        followsUserLocation={false}
        scrollEnabled={!isMenuOpen}
        zoomEnabled={!isMenuOpen}
      >
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
            onPress={() => onStationPress(station)}
            calloutOffset={{ x: 0.5, y: 0.5 }}
          />
        ))}
      </MapView>

      {/* Кнопку обновления держим поверх карты (если нужна) */}
      {onReloadPress ? (
        <View style={styles.reloadBtnWrapper}>
          {/* ты можешь сюда вставить свой AnimatedUpdateButton как есть */}
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  reloadBtnWrapper: {
    position: "absolute",
    bottom: 10,
    right: 10,
    zIndex: 1000,
  },
});
