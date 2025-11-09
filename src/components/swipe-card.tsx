import React, { useEffect } from "react";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import type { MatchCandidate } from "../types/match";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface SwipeCardProps {
  candidate: MatchCandidate;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  index: number;
}

export function SwipeCard({
  candidate,
  onSwipeLeft,
  onSwipeRight,
  index,
}: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Reset position when candidate changes
  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
  }, [candidate.userId, translateX, translateY]);

  const gesture = Gesture.Pan()
    .onUpdate(event => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd(event => {
      if (event.translationX > SWIPE_THRESHOLD) {
        // Swipe right - Like
        translateX.value = withTiming(
          SCREEN_WIDTH * 1.5,
          { duration: 300 },
          () => {
            runOnJS(onSwipeRight)();
          }
        );
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        // Swipe left - Pass
        translateX.value = withTiming(
          -SCREEN_WIDTH * 1.5,
          { duration: 300 },
          () => {
            runOnJS(onSwipeLeft)();
          }
        );
      } else {
        // Return to center
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-15, 0, 15],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, SWIPE_THRESHOLD],
      [1, 0.5],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
      opacity,
    };
  });

  const likeStampStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  const nopeStampStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[styles.card, animatedStyle, { zIndex: 100 - index }]}
      >
        <Image
          source={{ uri: candidate.avatarUrl }}
          style={styles.avatar}
          resizeMode="cover"
        />

        {/* Like Stamp */}
        <Animated.View style={[styles.stamp, styles.likeStamp, likeStampStyle]}>
          <Text style={styles.stampText}>LIKE</Text>
        </Animated.View>

        {/* Nope Stamp */}
        <Animated.View style={[styles.stamp, styles.nopeStamp, nopeStampStyle]}>
          <Text style={styles.stampText}>NOPE</Text>
        </Animated.View>

        {/* Profile Info */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>
              {candidate.name}, {candidate.age}
            </Text>
            {candidate.distanceKm && (
              <Text style={styles.distance}>{candidate.distanceKm} km</Text>
            )}
          </View>

          {candidate.address && (
            <Text style={styles.location}>{candidate.address}</Text>
          )}

          {candidate.bio && (
            <Text style={styles.bio} numberOfLines={2}>
              {candidate.bio}
            </Text>
          )}

          {candidate.interests && candidate.interests.length > 0 && (
            <View style={styles.interestsContainer}>
              {candidate.interests.slice(0, 3).map((interest, idx) => (
                <View key={idx} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
              {candidate.interests.length > 3 && (
                <View style={styles.interestTag}>
                  <Text style={styles.interestText}>
                    +{candidate.interests.length - 3}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fe99a1",
    borderStyle: "solid",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: "100%",
    height: "70%",
  },
  infoContainer: {
    padding: 16,
    flex: 1,
    justifyContent: "flex-start",
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  distance: {
    fontSize: 14,
    color: "#666",
  },
  location: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestTag: {
    backgroundColor: "#FFE8E8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    fontSize: 12,
    color: "#FF6B6B",
    fontWeight: "500",
  },
  stamp: {
    position: "absolute",
    top: 80,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 4,
    zIndex: 10,
  },
  likeStamp: {
    right: 40,
    borderColor: "#00D66A",
    backgroundColor: "rgba(0, 214, 106, 0.1)",
    transform: [{ rotate: "15deg" }],
  },
  nopeStamp: {
    left: 40,
    borderColor: "#FF6B6B",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    transform: [{ rotate: "-15deg" }],
  },
  stampText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
});
