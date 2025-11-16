import { supabase } from "@/src/api/supabase";
import AppHeader from "@/src/components/app-header";
import { MatchCard } from "@/src/components/match-card";
import { MessageListItem } from "@/src/components/message-list-item";
import { SearchBar } from "@/src/components/search-bar";
import { useMatches } from "@/src/hooks/use-matches";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function MatchesScreen() {
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

  const { matches, loading, error, totalUnread, refresh } = useMatches(
    userId || ""
  );

  // Auto-refresh when screen comes back into focus (e.g., after navigating back from chat)
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        refresh();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId])
  );

  // Filter matches with messages for Messages section (sorted by last message time)
  const matchesWithMessages = matches
    .filter(m => m.lastMessageAt)
    .sort((a, b) => {
      const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return timeB - timeA; // Most recent first
    });

  if (authLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (!userId) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Please sign in to view matches</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Dinner" />

      <FlatList
        data={matchesWithMessages}
        keyExtractor={item => item.matchId}
        ListHeaderComponent={
          <>
            <SearchBar matchCount={matches.length} />

            {/* Matches Section - Always show */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Matches</Text>
                {matches.length > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{matches.length}</Text>
                  </View>
                )}
              </View>

              {matches.length > 0 ? (
                <FlatList
                  horizontal
                  data={matches}
                  keyExtractor={item => item.matchId}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalList}
                  renderItem={({ item }) => (
                    <MatchCard
                      userId={item.user.id}
                      name={item.user.username || "User"}
                      avatarUrl={item.user.avatar_url}
                      verified={true}
                      onPress={() => {
                        router.push(`/match-profile/${item.user.id}` as any);
                      }}
                    />
                  )}
                />
              ) : (
                <View style={styles.emptyMatches}>
                  <Text style={styles.emptyMatchesText}>
                    No matches yet. Start swiping!
                  </Text>
                </View>
              )}
            </View>

            {/* Messages Section Header */}
            {matchesWithMessages.length > 0 && (
              <View style={[styles.sectionHeader, styles.messagesHeader]}>
                <Text style={styles.sectionTitle}>Messages</Text>
                {totalUnread > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{totalUnread}</Text>
                  </View>
                )}
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <MessageListItem
            userId={item.user.id}
            name={item.user.username || "User"}
            avatarUrl={item.user.avatar_url}
            lastMessage={
              item.lastMessageAt
                ? new Date(item.lastMessageAt).toLocaleString()
                : "No messages yet"
            }
            unreadCount={item.unreadCount}
            onPress={() => {
              router.push(`/chat/${item.matchId}` as any);
            }}
          />
        )}
        ListEmptyComponent={
          !loading && matches.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No matches yet</Text>
              <Text style={styles.emptyText}>
                Start swiping to find your perfect match!
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            tintColor="#FF6B6B"
          />
        }
      />

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  messagesHeader: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2C2C2C",
  },
  badge: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
  },
  horizontalList: {
    paddingHorizontal: 16,
  },
  emptyMatches: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  emptyMatchesText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: "#999",
    textAlign: "center",
  },
  errorBanner: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#FF6B6B",
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: "#FFF",
    textAlign: "center",
    fontSize: 14,
  },
});
