import { ThemedText } from "@/src/components/themed-text";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";

type Props = {
  title?: string;
  onBellPress?: () => void;
  showDot?: boolean;
  onRefresh?: () => void;
};

export default function AppHeader({
  title = "Dinner",
  onBellPress,
  showDot = true,
  onRefresh,
}: Props) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>{title}</ThemedText>

      <View style={styles.rightButtons}>
        {onRefresh && (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={onRefresh}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={24} color="#6B6B6B" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          accessibilityRole="button"
          onPress={onBellPress}
          style={styles.bellButton}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={28} color="#6B6B6B" />
          {showDot && <View style={styles.dot} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    // provide safe top spacing and lower the header a bit
    paddingTop: Platform.OS === "ios" ? 60 : 22,
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "800",
    color: "#FF6B6B",
  },
  rightButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  bellButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  dot: {
    position: "absolute",
    top: 4,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: "#FF6B6B",
    borderWidth: 2,
    borderColor: "#fff",
  },
});
