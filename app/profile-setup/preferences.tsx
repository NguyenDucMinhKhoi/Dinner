import { updateProfilePreferences } from "@/src/api/profile";
import { supabase } from "@/src/api/supabase";
import Slider from "@react-native-community/slider";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type SeekingGender = "male" | "female" | "both";

export default function PreferencesScreen() {
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  // Preferences state
  const [seekingGender, setSeekingGender] = useState<SeekingGender>("both");
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(35);
  const [distanceKm, setDistanceKm] = useState(10);

  const handleNext = async () => {
    // Validation
    if (ageMin > ageMax) {
      Alert.alert("Error", "Minimum age cannot be greater than maximum age");
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

      // Save preferences to database
      await updateProfilePreferences(user.id, {
        seeking_gender: seekingGender,
        age_min: ageMin,
        age_max: ageMax,
        distance_km: distanceKm,
      });

      // Navigate to upload avatar (step 5)
      router.push({
        pathname: "/profile-setup/upload-avatar" as any,
        params: {
          ...params,
          seeking_gender: seekingGender,
          age_min: ageMin.toString(),
          age_max: ageMax.toString(),
          distance_km: distanceKm.toString(),
        },
      });
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

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
          <Text style={styles.title}>Dating Preferences</Text>
          <Text style={styles.subtitle}>Set your match criteria (4/5)</Text>
        </View>

        {/* Seeking Gender */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>👫 I&apos;m looking for</Text>
          <View style={styles.genderButtons}>
            <Pressable
              style={[
                styles.genderButton,
                seekingGender === "male" && styles.genderButtonActive,
              ]}
              onPress={() => setSeekingGender("male")}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  seekingGender === "male" && styles.genderButtonTextActive,
                ]}
              >
                Male
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.genderButton,
                seekingGender === "female" && styles.genderButtonActive,
              ]}
              onPress={() => setSeekingGender("female")}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  seekingGender === "female" && styles.genderButtonTextActive,
                ]}
              >
                Female
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.genderButton,
                seekingGender === "both" && styles.genderButtonActive,
              ]}
              onPress={() => setSeekingGender("both")}
            >
              <Text
                style={[
                  styles.genderButtonText,
                  seekingGender === "both" && styles.genderButtonTextActive,
                ]}
              >
                Both
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Age Range */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>🎂 Age range</Text>
          <Text style={styles.valueText}>
            {ageMin} - {ageMax} years old
          </Text>

          <View style={styles.sliderContainer}>
            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>Min: {ageMin}</Text>
              <Slider
                style={styles.slider}
                minimumValue={18}
                maximumValue={100}
                step={1}
                value={ageMin}
                onValueChange={value => {
                  setAgeMin(Math.round(value));
                  // Auto-adjust max if needed
                  if (value > ageMax) {
                    setAgeMax(Math.round(value));
                  }
                }}
                minimumTrackTintColor="#FF6B6B"
                maximumTrackTintColor="#ddd"
                thumbTintColor="#FF6B6B"
              />
            </View>

            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>Max: {ageMax}</Text>
              <Slider
                style={styles.slider}
                minimumValue={18}
                maximumValue={100}
                step={1}
                value={ageMax}
                onValueChange={value => {
                  setAgeMax(Math.round(value));
                  // Auto-adjust min if needed
                  if (value < ageMin) {
                    setAgeMin(Math.round(value));
                  }
                }}
                minimumTrackTintColor="#FF6B6B"
                maximumTrackTintColor="#ddd"
                thumbTintColor="#FF6B6B"
              />
            </View>
          </View>
        </View>

        {/* Distance */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>📍 Maximum distance</Text>
          <Text style={styles.valueText}>Within {distanceKm} km</Text>

          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={100}
            step={1}
            value={distanceKm}
            onValueChange={value => setDistanceKm(Math.round(value))}
            minimumTrackTintColor="#FF6B6B"
            maximumTrackTintColor="#ddd"
            thumbTintColor="#FF6B6B"
          />

          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>1 km</Text>
            <Text style={styles.sliderLabelText}>100 km</Text>
          </View>
        </View>

        {/* Next Button */}
        <Pressable
          style={[styles.nextButton, loading && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.nextButtonText}>Next →</Text>
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
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  valueText: {
    fontSize: 16,
    color: "#FF6B6B",
    fontWeight: "600",
    marginBottom: 16,
  },

  // Gender Buttons
  genderButtons: {
    flexDirection: "row",
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
  genderButtonActive: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  genderButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  genderButtonTextActive: {
    color: "#fff",
  },

  // Sliders
  sliderContainer: {
    gap: 16,
  },
  sliderRow: {
    gap: 8,
  },
  sliderLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  sliderLabelText: {
    fontSize: 12,
    color: "#999",
  },

  // Next Button
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
