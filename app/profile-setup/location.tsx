import { getCurrentProfile, updateProfileLocation } from "@/src/api/profile";
import { supabase } from "@/src/api/supabase";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

export default function LocationScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const isEditMode = params.mode === "edit";
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [location, setLocation] = useState<LocationData>({
    address: "",
    latitude: 10.8231, // Default: Ho Chi Minh City
    longitude: 106.6297,
  });
  const [region, setRegion] = useState<Region>({
    latitude: 10.8231,
    longitude: 106.6297,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState("");

  // Request location permission on mount
  useEffect(() => {
    const init = async () => {
      try {
        // Load existing data if edit mode
        if (isEditMode) {
          setInitialLoading(true);
          try {
            const profile = await getCurrentProfile();
            if (profile?.address && profile?.latitude && profile?.longitude) {
              setLocation({
                address: profile.address,
                latitude: profile.latitude,
                longitude: profile.longitude,
              });
              setRegion({
                latitude: profile.latitude,
                longitude: profile.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });
            }
          } catch (error: any) {
            console.error("Error loading location:", error);
          } finally {
            setInitialLoading(false);
          }
        }

        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status === "granted") {
          setLocationPermission(true);
          if (!isEditMode) {
            getCurrentLocation();
          }
        } else {
          setLocationPermission(false);
          Alert.alert(
            "Location Permission",
            "GPS permission denied. You can enter your address manually."
          );
        }
      } catch (error) {
        console.error("Error requesting location permission:", error);
        setInitialLoading(false);
      }
    };

    init();
  }, [isEditMode]);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = currentLocation.coords;

      // Reverse geocoding: lat/long → address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        const address = [
          place.street,
          place.district,
          place.city,
          place.country,
        ]
          .filter(Boolean)
          .join(", ");

        setLocation({ address, latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to get current location");
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    try {
      // Reverse geocoding when user taps on map
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        const address = [
          place.street,
          place.district,
          place.city,
          place.country,
        ]
          .filter(Boolean)
          .join(", ");

        setLocation({ address, latitude, longitude });
      } else {
        setLocation({ address: "Unknown location", latitude, longitude });
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      setLocation({
        address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        latitude,
        longitude,
      });
    }
  };

  const handleAddressSubmit = async () => {
    if (!tempAddress.trim()) {
      Alert.alert("Error", "Please enter an address");
      return;
    }

    try {
      setLoading(true);

      // Geocoding: address → lat/long
      const geocode = await Location.geocodeAsync(tempAddress);

      if (geocode.length > 0) {
        const { latitude, longitude } = geocode[0];
        setLocation({
          address: tempAddress,
          latitude,
          longitude,
        });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setIsEditingAddress(false);
        setTempAddress("");
      } else {
        Alert.alert("Error", "Could not find this address");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to find address");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!location.address) {
      Alert.alert("Error", "Please select or enter your location");
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

      // Save location to database
      await updateProfileLocation(user.id, location);

      // Navigate to next screen
      if (isEditMode) {
        router.push({
          pathname: "/profile-setup/preferences",
          params: { mode: "edit" },
        });
      } else {
        router.push({
          pathname: "/profile-setup/preferences",
          params: {
            ...params,
            address: location.address,
            latitude: location.latitude.toString(),
            longitude: location.longitude.toString(),
          },
        });
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save location");
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
          <Text style={styles.title}>
            {isEditMode ? "Edit Location" : "Your Location"}
          </Text>
          <Text style={styles.subtitle}>
            {isEditMode
              ? "Update your location"
              : "Where would you like to meet? (3/5)"}
          </Text>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={region}
            onPress={handleMapPress}
            showsUserLocation={locationPermission}
            showsMyLocationButton={locationPermission}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              draggable
              onDragEnd={handleMapPress}
            />
          </MapView>

          {/* Current Location Button */}
          {locationPermission && (
            <Pressable
              style={styles.currentLocationButton}
              onPress={getCurrentLocation}
              disabled={loading}
            >
              <Text style={styles.currentLocationText}>📍 My Location</Text>
            </Pressable>
          )}
        </View>

        {/* Address Display/Edit */}
        <View style={styles.addressContainer}>
          <Text style={styles.addressLabel}>Selected Address:</Text>

          {isEditingAddress ? (
            <View>
              <TextInput
                style={styles.addressInput}
                value={tempAddress}
                onChangeText={setTempAddress}
                placeholder="Enter your address..."
                multiline
                numberOfLines={2}
                autoFocus
              />
              <View style={styles.addressActions}>
                <Pressable
                  style={[styles.addressButton, styles.cancelButton]}
                  onPress={() => {
                    setIsEditingAddress(false);
                    setTempAddress("");
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.addressButton, styles.saveButton]}
                  onPress={handleAddressSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Search</Text>
                  )}
                </Pressable>
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.addressText}>
                {location.address || "Tap on map to select location"}
              </Text>
              <Pressable
                style={styles.editButton}
                onPress={() => {
                  setIsEditingAddress(true);
                  setTempAddress(location.address);
                }}
              >
                <Text style={styles.editButtonText}>✏️ Edit Address</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Next Button */}
        <Pressable
          style={[
            styles.nextButton,
            (!location.address || loading) && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!location.address || loading}
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
    marginBottom: 24,
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
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 24,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  currentLocationButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  currentLocationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B6B",
  },
  addressContainer: {
    marginBottom: 24,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  editButton: {
    alignSelf: "flex-start",
  },
  editButtonText: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  addressInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#f9f9f9",
    marginBottom: 12,
    minHeight: 60,
  },
  addressActions: {
    flexDirection: "row",
    gap: 12,
  },
  addressButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  saveButton: {
    backgroundColor: "#FF6B6B",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
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
