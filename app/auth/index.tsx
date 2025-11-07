import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/src/components/themed-text";

export default function AuthScreen() {
  const router = useRouter();

  const handleEmailSignup = () => {
    router.push("/auth/signup" as any);
  };

  const handleEmailLogin = () => {
    router.push("/auth/login" as any);
  };

  const handleGoogleAuth = () => {
    // TODO: Implement Google authentication
    console.log("Google auth");
  };

  const handleFacebookAuth = () => {
    // TODO: Implement Facebook authentication
    console.log("Facebook auth");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with gradient */}
        <LinearGradient
          colors={["#FF85B3", "#FFB3D1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerCircle} />

          {/* Logo */}
          <View style={styles.logoContainer}>
            <LinearGradient colors={["#FFFFFF", "#FFE5F0"]} style={styles.logo}>
              <ThemedText style={styles.logoText}>❤️</ThemedText>
            </LinearGradient>
          </View>
        </LinearGradient>

        {/* Main content */}
        <View style={styles.content}>
          <ThemedText style={styles.title}>Welcome !</ThemedText>
          <ThemedText style={styles.subtitle}>
            Sign in or create an account to continue
          </ThemedText>

          {/* Primary buttons */}
          <View style={styles.primaryButtons}>
            <TouchableOpacity
              style={styles.signupButton}
              onPress={handleEmailSignup}
              activeOpacity={0.85}
            >
              <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
              <ThemedText style={styles.signupButtonText}>
                Create Account
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleEmailLogin}
              activeOpacity={0.85}
            >
              <Ionicons name="mail-outline" size={20} color="#FF85B3" />
              <ThemedText style={styles.loginButtonText}>
                Login with Email
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <ThemedText style={styles.dividerText}>or continue with</ThemedText>
            <View style={styles.dividerLine} />
          </View>

          {/* Social login buttons */}
          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleAuth}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-google" size={24} color="#DB4437" />
              <ThemedText style={styles.socialButtonText}>Google</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleFacebookAuth}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-facebook" size={24} color="#1877F2" />
              <ThemedText style={styles.socialButtonText}>Facebook</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <ThemedText style={styles.terms}>
            By continuing, you agree to our{" "}
            <ThemedText style={styles.termsLink}>Terms of Service</ThemedText>{" "}
            and <ThemedText style={styles.termsLink}>Privacy Policy</ThemedText>
          </ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    height: 240,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCircle: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    top: -80,
    right: -80,
  },
  logoContainer: {
    marginTop: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    fontSize: 40,
    color: "#FF85B3",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: "#2C2C2C",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    color: "#757575",
    marginBottom: 32,
  },
  primaryButtons: {
    gap: 16,
    marginBottom: 24,
  },
  signupButton: {
    backgroundColor: "#FF85B3",
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#FF85B3",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signupButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loginButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#FF85B3",
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FF85B3",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    fontSize: 13,
    color: "#999",
  },
  socialButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  socialButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2C2C2C",
  },
  terms: {
    fontSize: 12,
    textAlign: "center",
    color: "#999",
    lineHeight: 18,
  },
  termsLink: {
    color: "#FF85B3",
    fontWeight: "500",
  },
});
