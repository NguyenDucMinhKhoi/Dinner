import { findMatchId, getUserProfile } from "@/src/api/profile/match-profile";
import { supabase } from "@/src/api/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
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
  age: number | null;
  gender: string | null;
  location: string | null;
  interests: string[] | null;
};

export default function MatchProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const targetUserId = params.id;

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("Please sign in");
          setLoading(false);
          return;
        }
        setCurrentUserId(user.id);

        // Fetch profile
        const profileResult = await getUserProfile(targetUserId || "");
        if (!profileResult.success) {
          setError(profileResult.error || "Failed to load profile");
          setLoading(false);
          return;
        }
        setProfile(profileResult.profile);

        // Find match ID
        const matchResult = await findMatchId(user.id, targetUserId || "");
        if (matchResult.success && matchResult.matchId) {
          setMatchId(matchResult.matchId);
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }

    init();
  }, [targetUserId]);

  const handleSendMessage = () => {
    if (matchId) {
      router.push(`/chat/${matchId}` as any);
    } else {
      setError("No match found. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || "Profile not found"}</Text>
        <TouchableOpacity
          style={styles.backButtonError}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <Ionicons name="chevron-back" size={28} color="#2C2C2C" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#2C2C2C" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Image */}
        <View style={styles.imageContainer}>
          {profile.avatar_url ? (
            <Image
              source={{ uri: profile.avatar_url }}
              style={styles.profileImage}
            />
          ) : (
            <View style={[styles.profileImage, styles.placeholderImage]}>
              <Ionicons name="person" size={80} color="#CCC" />
            </View>
          )}
        </View>

        {/* Profile Info */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {profile.username || "User"}
              {profile.age && `, ${profile.age}`}
            </Text>
            <Ionicons name="checkmark-circle" size={24} color="#4A90E2" />
          </View>

          {profile.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={18} color="#999" />
              <Text style={styles.locationText}>{profile.location}</Text>
            </View>
          )}

          {profile.bio && (
            <View style={styles.bioContainer}>
              <Text style={styles.bioLabel}>About</Text>
              <Text style={styles.bioText}>{profile.bio}</Text>
            </View>
          )}

          {profile.interests && profile.interests.length > 0 && (
            <View style={styles.interestsContainer}>
              <Text style={styles.bioLabel}>Interests</Text>
              <View style={styles.interestsGrid}>
                {profile.interests.map((interest, index) => (
                  <View key={index} style={styles.interestTag}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Send Message Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.messageButton}
          onPress={handleSendMessage}
          disabled={!matchId}
        >
          <Ionicons name="chatbubble" size={20} color="#FFF" />
          <Text style={styles.messageButtonText}>Send Message</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: "100%",
    height: 400,
    backgroundColor: "#F5F5F5",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  infoContainer: {
    padding: 20,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2C2C2C",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 15,
    color: "#999",
  },
  bioContainer: {
    marginBottom: 20,
  },
  bioLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 8,
  },
  bioText: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
  },
  interestsContainer: {
    marginBottom: 20,
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
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  messageButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 28,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#FF6B6B",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  messageButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFF",
  },
  errorText: {
    fontSize: 16,
    color: "#FF6B6B",
    textAlign: "center",
    marginBottom: 20,
  },
  backButtonError: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
