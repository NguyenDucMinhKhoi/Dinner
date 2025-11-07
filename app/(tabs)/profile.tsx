import { signOut } from "@/src/api/auth";
import { ThemedText } from "@/src/components/themed-text";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";

export default function ProfileTab() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await signOut();
            router.replace("/(tabs)/welcome");
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to sign out");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Your Profile</ThemedText>

      <ThemedText style={styles.subtitle}>
        This is a placeholder for the profile tab.
      </ThemedText>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/profile-setup/basic-info")}
      >
        <ThemedText style={styles.buttonText}>Edit Profile</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.signOutButton]}
        onPress={handleSignOut}
        disabled={loading}
      >
        <ThemedText style={styles.buttonText}>
          {loading ? "Signing Out..." : "Sign Out"}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 20 },
  button: {
    backgroundColor: "#FF6B6B",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  signOutButton: {
    backgroundColor: "#666",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});
