import React, { useEffect } from "react";
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import type { MatchCandidate } from "../types/match";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface MatchModalProps {
  visible: boolean;
  user: MatchCandidate;
  matchId: string;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

export function MatchModal({
  visible,
  user,
  onSendMessage,
  onKeepSwiping,
}: MatchModalProps) {
  const scale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Animate avatar scale
      scale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 12 })
      );

      // Animate title with delay
      titleOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    } else {
      scale.value = 0;
      titleOpacity.value = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onKeepSwiping}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Avatar */}
          <Animated.View style={[styles.avatarContainer, avatarStyle]}>
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          </Animated.View>

          {/* Title */}
          <Animated.View style={titleStyle}>
            <Text style={styles.matchTitle}>It&apos;s a Match!</Text>
            <Text style={styles.matchSubtitle}>
              You and {user.name} liked each other
            </Text>
          </Animated.View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onSendMessage}
            >
              <Text style={styles.primaryButtonText}>Send Message</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onKeepSwiping}
            >
              <Text style={styles.secondaryButtonText}>Keep Swiping</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: SCREEN_WIDTH * 0.85,
    alignItems: "center",
    padding: 24,
  },
  avatarContainer: {
    marginBottom: 32,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: "#FF6B6B",
  },
  matchTitle: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#00D66A",
    textAlign: "center",
    marginBottom: 12,
    textShadowColor: "rgba(0, 214, 106, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  matchSubtitle: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 40,
  },
  actions: {
    width: "100%",
    gap: 12,
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#FF6B6B",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#fff",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
