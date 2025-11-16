import { getTotalUnreadCount } from "@/src/api/messages";
import { getUserMatches } from "@/src/api/swipes";
import { useEffect, useState } from "react";

export type MatchWithUser = {
  matchId: string;
  createdAt: string;
  lastMessageAt: string | null;
  lastMessage: string | null;
  user: {
    id: string;
    username: string | null;
    avatar_url: string | null;
    bio: string | null;
  };
  unreadCount?: number;
};

export function useMatches(userId: string) {
  const [matches, setMatches] = useState<MatchWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUnread, setTotalUnread] = useState(0);

  const loadMatches = async (silent = false) => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Chỉ hiển thị loading khi không phải silent refresh
      if (!silent) {
        setLoading(true);
      }
      setError(null);

      // Fetch matches
      const matchesData = await getUserMatches(userId);
      setMatches(matchesData);

      // Fetch total unread count
      const unreadResult = await getTotalUnreadCount(userId);
      if (unreadResult.success) {
        setTotalUnread(unreadResult.count || 0);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load matches");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    matches,
    loading,
    error,
    totalUnread,
    refresh: () => loadMatches(true), // Silent refresh
  };
}
