import { supabase } from "@/src/api/supabase";
import AppHeader from "@/src/components/app-header";
import { MatchModal } from "@/src/components/match-modal";
import { SwipeCard } from "@/src/components/swipe-card";
import { useSwipeController } from "@/src/hooks/use-swipe-controller";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function SwipeScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Get current user
  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      setAuthLoading(false);
    }
    getUser();
  }, []);

  const {
    currentCandidate,
    loading,
    error,
    matchData,
    handleLike,
    handlePass,
    dismissMatch,
    hasMore,
  } = useSwipeController(userId || "");

  // Build main content depending on state so we can render the MatchModal
  // in a single place below.
  let content = null;

  if (authLoading) {
    content = (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  } else if (!userId) {
    content = (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Please sign in to continue</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/auth")}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (error && !currentCandidate) {
    content = (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (loading && !currentCandidate) {
    content = (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Finding people near you...</Text>
      </View>
    );
  } else if (!currentCandidate && !hasMore) {
    content = (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>No More People</Text>
        <Text style={styles.emptyText}>
          Check back later or adjust your preferences
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <Text style={styles.buttonText}>Edit Preferences</Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    content = (
      <>
        <AppHeader title="Dinner" />

        <View style={styles.cardContainer}>
          {currentCandidate && (
            <SwipeCard
              candidate={currentCandidate}
              onSwipeLeft={handlePass}
              onSwipeRight={handleLike}
              index={0}
            />
          )}
        </View>

        {/* Loading indicator when prefetching */}
        {loading && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="small" color="#FF6B6B" />
          </View>
        )}
      </>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {content}

      {/* Single MatchModal render point */}
      {matchData && (
        <MatchModal
          visible={!!matchData}
          user={matchData.user}
          matchId={matchData.matchId}
          onSendMessage={() => {
            dismissMatch();
            router.push(`/(tabs)/matches`);
          }}
          onKeepSwiping={dismissMatch}
        />
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#FF6B6B",
    textAlign: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingIndicator: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
  },
});
