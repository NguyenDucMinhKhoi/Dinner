import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MatchCardProps = {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  age?: number;
  verified?: boolean;
  onPress: () => void;
};

export function MatchCard({
  name,
  avatarUrl,
  age,
  verified = false,
  onPress,
}: MatchCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Ionicons name="person" size={40} color="#CCC" />
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {name || "User"}
          </Text>
          {verified && (
            <Ionicons name="checkmark-circle" size={16} color="#4A90E2" />
          )}
        </View>
        {age && <Text style={styles.age}>{age}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    marginRight: 12,
  },
  imageContainer: {
    width: 100,
    height: 130,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    paddingHorizontal: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C2C2C",
    flex: 1,
  },
  age: {
    fontSize: 12,
    color: "#999",
  },
});
