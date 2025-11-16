import { signOut } from "@/src/api/auth";
import { getCurrentProfile } from "@/src/api/profile";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type UserProfile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  birthdate: string | null;
  gender: string | null;
  phone: string | null;
  address: string | null;
  interests: string[] | null;
  seeking_gender: string | null;
  age_min: number | null;
  age_max: number | null;
  distance_km: number | null;
};

export default function ProfileTab() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const profileData = await getCurrentProfile();
      setProfile(profileData);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load profile");
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setSigningOut(true);
          try {
            await signOut();
            router.replace("/(tabs)/welcome");
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to sign out");
          } finally {
            setSigningOut(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      {/* <AppHeader title="Dinner" /> */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            router.push("/profile-setup/basic-info?mode=edit" as any)
          }
        >
          <Ionicons name="create-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {profile.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.placeholderAvatar]}>
            <Ionicons name="person" size={60} color="#CCC" />
          </View>
        )}
      </View>

      {/* Basic Info */}
      <View style={styles.section}>
        <Text style={styles.name}>{profile.username || "User"}</Text>
      </View>

      {/* Personal Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        {profile.birthdate && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.infoLabel}>Age:</Text>
            <Text style={styles.infoValue}>
              {new Date().getFullYear() -
                new Date(profile.birthdate).getFullYear()}{" "}
              years old
            </Text>
          </View>
        )}

        {profile.gender && (
          <View style={styles.infoRow}>
            <Ionicons
              name={profile.gender === "male" ? "male" : "female"}
              size={20}
              color="#666"
            />
            <Text style={styles.infoLabel}>Gender:</Text>
            <Text style={styles.infoValue}>
              {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
            </Text>
          </View>
        )}

        {profile.phone && (
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#666" />
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{profile.phone}</Text>
          </View>
        )}

        {profile.address && (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue}>{profile.address}</Text>
          </View>
        )}
      </View>

      {/* Bio */}
      {profile.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.bioText}>{profile.bio}</Text>
        </View>
      )}

      {/* Interests */}
      {profile.interests && profile.interests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.interestsGrid}>
            {profile.interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Dating Preferences */}
      {(profile.seeking_gender || profile.age_min || profile.distance_km) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dating Preferences</Text>

          {profile.seeking_gender && (
            <View style={styles.infoRow}>
              <Ionicons name="heart-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Looking for:</Text>
              <Text style={styles.infoValue}>
                {profile.seeking_gender === "both"
                  ? "Everyone"
                  : profile.seeking_gender.charAt(0).toUpperCase() +
                    profile.seeking_gender.slice(1)}
              </Text>
            </View>
          )}

          {(profile.age_min || profile.age_max) && (
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Age range:</Text>
              <Text style={styles.infoValue}>
                {profile.age_min || 18} - {profile.age_max || 99} years
              </Text>
            </View>
          )}

          {profile.distance_km && (
            <View style={styles.infoRow}>
              <Ionicons name="navigate-outline" size={20} color="#666" />
              <Text style={styles.infoLabel}>Distance:</Text>
              <Text style={styles.infoValue}>
                Within {profile.distance_km} km
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.button, styles.signOutButton]}
          onPress={handleSignOut}
          disabled={signingOut}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFF" />
          <Text style={styles.buttonText}>
            {signingOut ? "Signing Out..." : "Sign Out"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#2C2C2C",
  },
  editButton: {
    padding: 8,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderAvatar: {
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2C2C2C",
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
    width: 90,
  },
  infoValue: {
    fontSize: 15,
    color: "#2C2C2C",
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 12,
  },
  bioText: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestTag: {
    backgroundColor: "#FFE5F0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  interestText: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "500",
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 28,
    marginBottom: 12,
  },
  signOutButton: {
    backgroundColor: "#666",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 16,
    color: "#FF6B6B",
  },
});
