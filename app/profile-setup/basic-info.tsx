import { getCurrentProfile, updateProfileBasicInfo } from "@/src/api/profile";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function BasicInfoScreen() {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [birthdate, setBirthdate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<"male" | "female" | "other" | null>(
    null
  );
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const handleNext = async () => {
    // Validation
    if (!username.trim()) {
      Alert.alert("Error", "Please enter your user name");
      return;
    }

    const age = calculateAge(birthdate);
    if (age < 18) {
      Alert.alert("Error", "You must be at least 18 years old");
      return;
    }

    if (!gender) {
      Alert.alert("Error", "Please select your gender");
      return;
    }

    if (!bio.trim()) {
      Alert.alert("Error", "Please write a short bio");
      return;
    }

    setLoading(true);
    try {
      // Get current user profile
      const profile = await getCurrentProfile();

      // Update profile with basic info
      await updateProfileBasicInfo(profile.id, {
        username: username.trim(),
        ...(phone.trim() && { phone: phone.trim() }),
        birthdate: birthdate.toISOString().split("T")[0],
        gender,
        bio,
      });

      // Navigate to next screen with params
      router.push({
        pathname: "/profile-setup/interests" as any,
        params: {
          username: username.trim(),
          ...(phone.trim() && { phone: phone.trim() }),
          birthdate: birthdate.toISOString().split("T")[0],
          gender,
          bio,
        },
      });
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to save profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>About You</Text>
          <Text style={styles.subtitle}>
            Let&apos;s start with the basics (1/5)
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>User Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="words"
            />
            <Text style={styles.hint}>This is how others will see you</Text>
          </View>

          {/* Phone Number (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="+84XXXXXXXXX"
              placeholderTextColor="#999"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <Text style={styles.hint}>
              For contact purposes. This won&apos;t be shared publicly.
            </Text>
          </View>

          {/* Birthdate */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Birthdate</Text>
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {birthdate.toLocaleDateString("en-GB")} (Age:{" "}
                {calculateAge(birthdate)})
              </Text>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={birthdate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_event, selectedDate) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (selectedDate) {
                    setBirthdate(selectedDate);
                  }
                }}
                maximumDate={new Date()}
                minimumDate={new Date(new Date().getFullYear() - 100, 0, 1)}
              />
            )}
          </View>

          {/* Gender */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderContainer}>
              <Pressable
                style={[
                  styles.genderButton,
                  gender === "male" && styles.genderButtonActive,
                ]}
                onPress={() => setGender("male")}
              >
                <Text
                  style={[
                    styles.genderText,
                    gender === "male" && styles.genderTextActive,
                  ]}
                >
                  👨 Male
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.genderButton,
                  gender === "female" && styles.genderButtonActive,
                ]}
                onPress={() => setGender("female")}
              >
                <Text
                  style={[
                    styles.genderText,
                    gender === "female" && styles.genderTextActive,
                  ]}
                >
                  👩 Female
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.genderButton,
                  gender === "other" && styles.genderButtonActive,
                ]}
                onPress={() => setGender("other")}
              >
                <Text
                  style={[
                    styles.genderText,
                    gender === "other" && styles.genderTextActive,
                  ]}
                >
                  🌈 Other
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Bio */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Tell us about yourself..."
              placeholderTextColor="#999"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={300}
            />
            <Text style={styles.charCount}>{bio.length}/300</Text>
          </View>
        </View>

        {/* Next Button */}
        <Pressable
          style={[styles.nextButton, loading && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.nextButtonText}>Next →</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
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
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  hint: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  bioInput: {
    height: 120,
    paddingTop: 16,
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  dateText: {
    fontSize: 16,
    color: "#000",
  },
  genderContainer: {
    flexDirection: "row",
    gap: 12,
  },
  genderButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  genderButtonActive: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  genderText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  genderTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 32,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
