import React from "react";
import {
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";

type Props = {
  title: string;
  description: string;
  onRequestAgain?: () => void;
  canRequestAgain?: boolean;
};

export function PermissionDeniedScreen({
  title,
  description,
  onRequestAgain,
  canRequestAgain,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{description}</Text>

      <View style={styles.actions}>
        {canRequestAgain && onRequestAgain ? (
          <Pressable style={styles.btn} onPress={onRequestAgain}>
            <Text style={styles.btnText}>Запросить разрешение</Text>
          </Pressable>
        ) : null}

        <Pressable
          style={styles.btnSecondary}
          onPress={() => {
            // На iOS/Android откроется страница настроек приложения
            Linking.openSettings();
          }}
        >
          <Text style={styles.btnText}>Открыть настройки</Text>
        </Pressable>
      </View>

      {Platform.OS === "web" ? (
        <Text style={styles.hint}>
          В web-версии разрешения зависят от настроек браузера.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 18, fontWeight: "600" },
  text: { fontSize: 14, opacity: 0.85 },
  actions: { gap: 10, marginTop: 8 },
  btn: { padding: 12, borderRadius: 10, backgroundColor: "#111" },
  btnSecondary: { padding: 12, borderRadius: 10, backgroundColor: "#333" },
  btnText: { color: "#fff", textAlign: "center" },
  hint: { marginTop: 8, fontSize: 12, opacity: 0.7 },
});
