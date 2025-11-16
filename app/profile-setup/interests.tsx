import { getCurrentProfile, updateProfileInterests } from "@/src/api/profile";
import { supabase } from "@/src/api/supabase";
import { INTEREST_OPTIONS, type InterestKey } from "@/src/constants/interests";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function InterestsScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const isEditMode = params.mode === "edit";
  const [selectedInterests, setSelectedInterests] = useState<InterestKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      loadProfileData();
    }
  }, [isEditMode]);

  const loadProfileData = async () => {
    try {
      const profile = await getCurrentProfile();
      if (profile?.interests) {
        setSelectedInterests(profile.interests as InterestKey[]);
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to load interests");
    } finally {
      setInitialLoading(false);
    }
  };

  const toggleInterest = (interestKey: InterestKey) => {
    if (selectedInterests.includes(interestKey)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interestKey));
    } else {
      if (selectedInterests.length >= 10) {
        Alert.alert("Limit Reached", "You can select up to 10 interests");
        return;
      }
      setSelectedInterests([...selectedInterests, interestKey]);
    }
  };

  const handleNext = async () => {
    if (selectedInterests.length < 3) {
      Alert.alert("Error", "Please select at least 3 interests");
      return;
    }

    setLoading(true);
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      // Update interests in database
      await updateProfileInterests(user.id, selectedInterests);

      // Navigate to next screen
      if (isEditMode) {
        router.push({
          pathname: "/profile-setup/location",
          params: { mode: "edit" },
        });
      } else {
        router.push({
          pathname: "/profile-setup/location",
          params: {
            ...params,
            interests: JSON.stringify(selectedInterests),
          },
        });
      }
    } catch (error: any) {
      console.error("❌ Failed to save interests:", error);
      Alert.alert("Error", error.message || "Failed to save interests");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (initialLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.title}>
            {isEditMode ? "Edit Interests" : "Your Interests"}
          </Text>
          <Text style={styles.subtitle}>
            {isEditMode
              ? "Update your interests"
              : "Choose at least 3 things you love (2/5)"}
          </Text>
          <Text style={styles.counter}>
            {selectedInterests.length}/10 selected
          </Text>
        </View>

        {/* Interests Grid */}
        <View style={styles.interestsGrid}>
          {INTEREST_OPTIONS.map(([key, label]) => {
            const isSelected = selectedInterests.includes(key);
            return (
              <Pressable
                key={key}
                style={[
                  styles.interestTag,
                  isSelected && styles.interestTagActive,
                ]}
                onPress={() => toggleInterest(key)}
              >
                <Text
                  style={[
                    styles.interestText,
                    isSelected && styles.interestTextActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Next Button */}
        <Pressable
          style={[
            styles.nextButton,
            (selectedInterests.length < 3 || loading) &&
              styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={selectedInterests.length < 3 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.nextButtonText}>
              {isEditMode ? "Continue →" : "Next →"}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginTop: 40,
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  counter: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
  },
  interestTag: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  interestTagActive: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  interestText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  interestTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
