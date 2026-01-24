import React, { useEffect, useMemo, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native"
import Modal from "react-native-modal"
import { CameraView, CameraType } from "expo-camera"

import { useQrScanner } from "@/hooks/useQrScanner"

type Props = {
  visible: boolean
  onClose: () => void
  onScan: (data: string) => void // единый контракт результата
  title?: string
}

export const QrScannerModal = ({
  visible,
  onClose,
  onScan,
  title = "Сканирование QR",
}: Props) => {
  const { permission, status, error, requestPermission, resetError } =
    useQrScanner()

  const scannedRef = useRef(false)

  // сбрасываем флаг скана при каждом открытии
  useEffect(() => {
    if (visible) scannedRef.current = false
  }, [visible])

  // если можно — при открытии сразу запрашиваем permission (но не блокируем экран)
  useEffect(() => {
    if (!visible) return
    resetError()
    if (!permission?.granted) {
      // не обязательно, но UX лучше: сразу запросить
      requestPermission()
    }
  }, [visible]) // intentionally minimal deps, чтобы не гонять запросы

  const canAskAgain = permission?.canAskAgain ?? true

  const body = useMemo(() => {
    if (status === "requesting_permission") {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.text}>Запрашиваем доступ к камере…</Text>
          <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
            <Text style={styles.secondaryText}>Закрыть</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (status === "need_permission") {
      return (
        <View style={styles.center}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.text}>
            Нужен доступ к камере для сканирования QR.
          </Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={requestPermission}
          >
            <Text style={styles.primaryText}>Разрешить камеру</Text>
          </TouchableOpacity>

          {!canAskAgain ? (
            <Text style={styles.hint}>
              Разрешение отключено в настройках. Включи доступ к камере в
              Settings.
            </Text>
          ) : null}

          <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
            <Text style={styles.secondaryText}>Отмена</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (status === "error") {
      return (
        <View style={styles.center}>
          <Text style={styles.title}>Ошибка</Text>
          <Text style={styles.text}>{error ?? "Неизвестная ошибка"}</Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              resetError()
              requestPermission()
            }}
          >
            <Text style={styles.primaryText}>Повторить</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
            <Text style={styles.secondaryText}>Закрыть</Text>
          </TouchableOpacity>
        </View>
      )
    }

    // ready / idle -> показываем камеру только когда granted
    if (!permission?.granted) {
      // idle — редкий промежуток, просто безопасная заглушка
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.text}>Подготовка камеры…</Text>
          <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
            <Text style={styles.secondaryText}>Закрыть</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View style={styles.cameraWrap}>
        {Platform.OS === "ios" && <StatusBar hidden />}
        <CameraView
          style={styles.camera}
          facing={"back" as CameraType}
          onBarcodeScanned={({ data }) => {
            if (!visible) return
            if (scannedRef.current) return
            scannedRef.current = true

            try {
              onScan(data)
            } finally {
              // закрываем сканер после успешного скана
              onClose()
              // оставляем задержку чтобы не схлопнуться в гонку ререндеров
              setTimeout(() => (scannedRef.current = false), 400)
            }
          }}
        >
          <View style={styles.topBar}>
            <Text style={styles.topTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomHint}>
            <Text style={styles.hintText}>Наведи камеру на QR-код</Text>
          </View>
        </CameraView>
      </View>
    )
  }, [
    status,
    permission?.granted,
    error,
    visible,
    title,
    canAskAgain,
    onClose,
    onScan,
    requestPermission,
    resetError,
  ])

  return (
    <Modal
      isVisible={visible}
      style={styles.modal}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      backdropOpacity={0.9}
      useNativeDriver
    >
      <View style={styles.container}>{body}</View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modal: { margin: 0 },
  container: { flex: 1, backgroundColor: "black" },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },

  title: { color: "white", fontSize: 18, fontWeight: "700", marginBottom: 6 },
  text: { color: "white", fontSize: 14, textAlign: "center" },
  hint: { color: "#ddd", fontSize: 12, textAlign: "center", marginTop: 8 },

  primaryBtn: {
    marginTop: 8,
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  primaryText: { color: "black", fontWeight: "700" },

  secondaryBtn: { marginTop: 8, paddingVertical: 10, paddingHorizontal: 14 },
  secondaryText: { color: "white" },

  cameraWrap: { flex: 1 },
  camera: { flex: 1 },

  topBar: {
    position: "absolute",
    top: 40,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topTitle: { color: "white", fontSize: 16, fontWeight: "700" },
  closeBtn: { padding: 8 },
  closeText: { color: "white", fontSize: 32, lineHeight: 32 },

  bottomHint: {
    position: "absolute",
    bottom: 40,
    left: 16,
    right: 16,
    alignItems: "center",
  },
  hintText: { color: "white", fontSize: 14, opacity: 0.9 },
})
