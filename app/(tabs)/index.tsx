import { ThemedText } from "@/src/components/themed-text";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DUMMY_PROFILES = [
  {
    id: "1",
    name: "Alex",
    age: 27,
    img: require("@/src/assets/images/Frame 1.png"),
  },
  {
    id: "2",
    name: "Taylor",
    age: 24,
    img: require("@/src/assets/images/Frame 2.png"),
  },
  {
    id: "3",
    name: "Jordan",
    age: 29,
    img: require("@/src/assets/images/Frame 1.png"),
  },
];

export default function SwipeScreen() {
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const cardWidth = Math.min(340, width - 40);

  const top = DUMMY_PROFILES[0];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Discover</ThemedText>
      </View>

      <View style={styles.deckContainer}>
        <View
          style={[styles.card, { width: cardWidth, height: cardWidth * 1.25 }]}
        >
          <Image source={top.img} style={styles.image} resizeMode="cover" />
          <View style={styles.cardFooter}>
            <ThemedText style={styles.cardName}>
              {top.name}, {top.age}
            </ThemedText>
            <Text style={styles.cardSubtitle}>
              Loves coffee, travel & good music
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.actionButton, styles.pass]}
          onPress={() => {}}
        >
          <Text style={styles.actionText}>Pass</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.like]}
          onPress={() => {
            router.push("/profile-setup/upload-avatar");
          }}
        >
          <Text style={styles.actionText}>Like</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center" },
  header: { width: "100%", padding: 20, alignItems: "center" },
  title: { fontSize: 20, fontWeight: "700" },
  deckContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    overflow: "hidden",
  },
  image: { width: "100%", height: "75%" },
  cardFooter: { padding: 12 },
  cardName: { fontSize: 18, fontWeight: "700" },
  cardSubtitle: { fontSize: 13, color: "#666", marginTop: 6 },
  controls: { flexDirection: "row", gap: 16, paddingBottom: 32 },
  actionButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  pass: { backgroundColor: "#eee" },
  like: { backgroundColor: "#FF6B6B" },
  actionText: { color: "#fff", fontWeight: "700" },
});
