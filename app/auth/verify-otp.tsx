import { supabase } from "@/src/api/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

/**
 * OTP Verification Screen
 * User enters 6-digit code from email to verify their account
 */
export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace - focus previous input
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      Alert.alert("Error", "Please enter the 6-digit code");
      return;
    }

    if (!email) {
      Alert.alert("Error", "Email not found. Please try signing up again.");
      return;
    }

    setLoading(true);
    try {
      // Verify OTP with Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        email: email as string,
        token: otpCode,
        type: "signup",
      });

      if (error) {
        throw error;
      }

      // Create profile for verified user
      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email || (email as string),
          is_complete: false, // Profile not complete until user fills in details
        });

        if (profileError) {
          throw new Error("Failed to create profile: " + profileError.message);
        }
      }

      // After verification, user has session and can proceed
      Alert.alert("Success!", "Email verified! Please complete your profile.", [
        {
          text: "OK",
          onPress: () => {
            router.replace("/profile-setup/basic-info" as any);
          },
        },
      ]);
    } catch (error: any) {
      if (error.message.includes("expired")) {
        Alert.alert("Error", "Code has expired. Please request a new one.");
      } else if (error.message.includes("invalid")) {
        Alert.alert("Error", "Invalid code. Please try again.");
      } else {
        Alert.alert("Error", error.message || "Failed to verify code");
      }

      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      Alert.alert("Error", "Email not found");
      return;
    }

    setResending(true);
    try {
      // Resend OTP
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email as string,
      });

      if (error) {
        throw error;
      }

      Alert.alert("Success", "New verification code sent to your email!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={["#FF6B9D", "#FFA5C5"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.logoContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>📧</Text>
            </View>
          </View>
          <Text style={styles.headerTitle}>Check Your Email</Text>
          <Text style={styles.headerSubtitle}>We sent a code to {email}</Text>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.label}>Enter 6-digit code</Text>

          {/* OTP Input Boxes */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => {
                  inputRefs.current[index] = ref;
                }}
                style={[styles.otpInput, digit && styles.otpInputFilled]}
                value={digit}
                onChangeText={value => handleOtpChange(value, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verify Email</Text>
            )}
          </TouchableOpacity>

          {/* Resend Code */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Didn&apos;t receive the code?{" "}
            </Text>
            <TouchableOpacity onPress={handleResendCode} disabled={resending}>
              <Text
                style={[
                  styles.footerLink,
                  resending && styles.footerLinkDisabled,
                ]}
              >
                {resending ? "Sending..." : "Resend"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Back to Login */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>← Back to Signup</Text>
          </TouchableOpacity>
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
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 32,
    gap: 10,
    paddingHorizontal: 10,
  },
  otpInput: {
    width: 50,
    height: 56,
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 12,
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    backgroundColor: "#f9f9f9",
  },
  otpInputFilled: {
    borderColor: "#FF6B9D",
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#FF6B9D",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
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
  footerLinkDisabled: {
    opacity: 0.5,
  },
  backButton: {
    alignSelf: "center",
  },
  backText: {
    fontSize: 14,
    color: "#999",
  },
});
