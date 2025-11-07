import { uploadToCloudinary } from "@/src/api/cloudinary";
import { updateProfileAvatar } from "@/src/api/profile";
import { supabase } from "@/src/api/supabase";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function UploadAvatarScreen() {
  // const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImageFromGallery = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need camera roll permissions to upload your photo."
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images" as any,
        allowsEditing: true,
        aspect: [1, 1], // Square crop
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to pick image");
    }
  };

  const takePhoto = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need camera permissions to take your photo."
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1], // Square crop
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to take photo");
    }
  };

  const handleUpload = async () => {
    if (!imageUri) {
      Alert.alert("Error", "Please select or take a photo first");
      return;
    }

    setUploading(true);
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      // Upload to Cloudinary
      const result = await uploadToCloudinary(imageUri);

      // Save avatar and mark profile as complete
      await updateProfileAvatar(user.id, result.secure_url);

      Alert.alert("Profile Complete! 🎉", "Let's find your dinner date!");

      // Navigate to swipe screen (main app)
      setTimeout(() => router.replace("/(tabs)"), 1500);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      "Skip Photo?",
      "You can add your photo later in profile settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Skip",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const {
                data: { user },
              } = await supabase.auth.getUser();

              if (!user) {
                throw new Error("Not authenticated");
              }

              // Mark profile as complete without avatar
              await updateProfileAvatar(user.id, "");

              router.replace("/(tabs)");
            } catch (error: any) {
              Alert.alert("Error", error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
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
          <Text style={styles.title}>Upload Your Photo</Text>
          <Text style={styles.subtitle}>Show your best smile! (5/5)</Text>
        </View>

        {/* Photo Preview */}
        <View style={styles.photoContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderIcon}>📸</Text>
              <Text style={styles.photoPlaceholderText}>No photo yet</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Pressable
            style={styles.actionButton}
            onPress={pickImageFromGallery}
            disabled={uploading || loading}
          >
            <Text style={styles.actionButtonIcon}>🖼️</Text>
            <Text style={styles.actionButtonText}>Choose from Gallery</Text>
          </Pressable>

          <Pressable
            style={styles.actionButton}
            onPress={takePhoto}
            disabled={uploading || loading}
          >
            <Text style={styles.actionButtonIcon}>📷</Text>
            <Text style={styles.actionButtonText}>Take Photo</Text>
          </Pressable>
        </View>

        {/* Upload Button */}
        {imageUri && (
          <Pressable
            style={[
              styles.uploadButton,
              uploading && styles.uploadButtonDisabled,
            ]}
            onPress={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.uploadButtonText}>
                Upload your Photo & Complete Profile
              </Text>
            )}
          </Pressable>
        )}

        {/* Skip Button */}
        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
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

  // Photo Preview
  photoContainer: {
    alignItems: "center",
    marginBottom: 32,
    position: "relative",
  },
  photoPreview: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: "#FF6B6B",
  },
  photoPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ddd",
    borderStyle: "dashed",
  },
  photoPlaceholderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: "#999",
  },
  uploadedBadge: {
    position: "absolute",
    bottom: 10,
    right: "50%",
    transform: [{ translateX: 60 }],
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  uploadedBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  // Actions
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  actionButtonIcon: {
    fontSize: 24,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },

  // Upload Button
  uploadButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  // Skip Button
  skipButton: {
    alignSelf: "center",
    marginTop: 16,
  },
  skipButtonText: {
    fontSize: 14,
    color: "#999",
    textDecorationLine: "underline",
  },
});
