import { ThemedText } from "@/src/components/themed-text";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const headerHeight = Math.max(220, Math.round(width * 0.55));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with gradient background and couple illustration */}
        <LinearGradient
          colors={["#FF85B3", "#FFB3D1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { height: headerHeight }]}
        >
          <View
            style={[
              styles.headerCircle,
              {
                width: headerHeight * 1.3,
                height: headerHeight * 1.3,
                borderRadius: (headerHeight * 1.3) / 2,
              },
            ]}
          />

          {/* Couple illustration inside header */}
          <View style={styles.coupleContainer}>
            <Image
              source={require("@/src/assets/images/Frame 2.png")}
              style={styles.personImage}
              contentFit="contain"
            />
            <Image
              source={require("@/src/assets/images/Frame 1.png")}
              style={styles.personImage}
              contentFit="contain"
            />
          </View>
        </LinearGradient>

        {/* Main content */}
        <View style={styles.content}>
          {/* Card with text and button */}
          <View style={[styles.card, { maxWidth: Math.min(720, width - 40) }]}>
            {/* Logo/Icon - Smaller heart */}
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={["#FF85B3", "#E91E63"]}
                style={styles.logo}
              >
                <ThemedText style={styles.logoText}>♥</ThemedText>
              </LinearGradient>
            </View>

            {/* Title */}
            <ThemedText style={styles.title}>
              Explore the vibe, find my match
            </ThemedText>

            {/* Description */}
            <ThemedText style={styles.description}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
              maecenas quis interdum enim enim molestie faucibus. Pretium non
              massa eros, nunc, urna. Ac laoreet sagittis donec vel. Amet, duis
              justo, quam quisque egestas. Pretium enim dictum accumsan.
              Suspendisse.
            </ThemedText>

            {/* CTA Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push("/auth")}
              activeOpacity={0.85}
            >
              <ThemedText style={styles.buttonText}>Lets Start</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { flexGrow: 1 },
  header: {
    position: "relative",
    overflow: "visible",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 20,
  },
  headerCircle: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    top: -40,
    right: -40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 200,
    paddingBottom: 40,
    alignItems: "center",
  },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  coupleContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    marginBottom: -180,
    paddingHorizontal: 20,
    zIndex: 10,
    elevation: 10,
  },
  personImage: {
    width: 180,
    height: 360,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 20,
    color: "#FFFFFF",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: "#2C2C2C",
    marginBottom: 12,
    lineHeight: 30,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    color: "#757575",
    lineHeight: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#FF85B3",
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 36,
    alignItems: "center",
    shadowColor: "#FF85B3",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    width: "100%",
    maxWidth: 420,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
