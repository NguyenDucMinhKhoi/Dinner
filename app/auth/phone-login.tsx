import { sendOtp, verifyOtp } from "@/src/api/auth";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function PhoneLoginScreen() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("+84");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Add reCAPTCHA container to DOM for web
  useEffect(() => {
    if (Platform.OS === "web") {
      let container = document.getElementById("recaptcha-container");
      if (!container) {
        const div = document.createElement("div");
        div.id = "recaptcha-container";
        // Style for development visibility
        div.style.cssText = `
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
        `;
        document.body.appendChild(div);
      }
    }

    // Cleanup on unmount
    return () => {
      if (Platform.OS === "web") {
        const container = document.getElementById("recaptcha-container");
        if (container) {
          container.innerHTML = ""; // Clear reCAPTCHA widget
        }
      }
    };
  }, []);

  const handleSendOTP = async () => {
    if (phoneNumber.length < 10) {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    setLoading(true);
    try {
      await sendOtp(phoneNumber);

      Alert.alert("Success", "OTP code sent to your phone via Firebase SMS");

      setStep("otp");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      Alert.alert("Error", "Please enter the 6-digit code");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(phoneNumber, otpCode);
      Alert.alert("Success", "Welcome back!", [
        {
          text: "Continue",
          onPress: () => {
            // Navigate to main app
            router.replace("/(tabs)");
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Invalid OTP code"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <LinearGradient
          colors={["#FF6B9D", "#FEC7D7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.logoContainer}>
            <View style={styles.heartCircle}>
              <Text style={styles.heartIcon}>❤️</Text>
            </View>
          </View>
          <Text style={styles.headerTitle}>
            {step === "phone" ? "Welcome Back" : "Verify OTP"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {step === "phone"
              ? "Login with your phone number"
              : "Enter the code we sent to your phone"}
          </Text>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          {step === "phone" ? (
            <>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="+84XXXXXXXXX"
                keyboardType="phone-pad"
                autoFocus
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Send OTP</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Don&apos;t have an account?{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/auth/phone-signup")}
                >
                  <Text style={styles.footerLink}>Sign up</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.label}>Verification Code</Text>
              <Text style={styles.phoneDisplay}>{phoneNumber}</Text>

              <TextInput
                style={styles.input}
                value={otpCode}
                onChangeText={setOtpCode}
                placeholder="000000"
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerifyOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Verify & Login</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => setStep("phone")}
              >
                <Text style={styles.linkText}>Change phone number</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={handleSendOTP}
                disabled={loading}
              >
                <Text style={styles.linkText}>Resend code</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 20,
  },
  heartCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  heartIcon: {
    fontSize: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  phoneDisplay: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#FF6B9D",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  linkButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  linkText: {
    color: "#FF6B9D",
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
  footerLink: {
    fontSize: 14,
    color: "#FF6B9D",
    fontWeight: "600",
  },
  devBox: {
    backgroundColor: "#FFF9E6",
    borderWidth: 1,
    borderColor: "#FFE066",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  devLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#B8860B",
    marginBottom: 4,
  },
  devCode: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B9D",
    marginBottom: 4,
  },
  devHint: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
});
