import { ThemedText } from "@/src/components/themed-text";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DUMMY_CHATS = [
  { id: "c1", name: "Sam", last: "Hey, want to grab coffee?" },
  { id: "c2", name: "Riley", last: "Loved your profile!" },
];

const DUMMY_REQUESTS = [
  { id: "r1", name: "Jamie" },
  { id: "r2", name: "Casey" },
];

export default function MatchesScreen() {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Chats</ThemedText>
      <FlatList
        data={DUMMY_CHATS}
        keyExtractor={i => i.id}
        contentContainerStyle={{ paddingBottom: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => {}}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.last}>{item.last}</Text>
          </TouchableOpacity>
        )}
      />

      <ThemedText style={[styles.title, { marginTop: 20 }]}>
        Requests
      </ThemedText>
      <FlatList
        data={DUMMY_REQUESTS}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.requestActions}>
              <TouchableOpacity style={styles.accept}>
                <Text style={{ color: "#fff" }}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.decline}>
                <Text>Decline</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: { fontSize: 16, fontWeight: "600" },
  last: { fontSize: 13, color: "#666", marginTop: 4 },
  requestActions: { flexDirection: "row", gap: 8 },
  accept: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  decline: {
    backgroundColor: "#eee",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
