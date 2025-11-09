import { useCallback, useEffect, useState } from "react";
import { getMatchCandidates } from "../api/match";
import { createSwipe } from "../api/swipes";
import type { MatchCandidate } from "../types/match";

const PREFETCH_THRESHOLD = 3;
const INITIAL_BATCH_SIZE = 20;

interface MatchData {
  matchId: string;
  user: MatchCandidate;
}

interface UseSwipeControllerReturn {
  candidates: MatchCandidate[];
  currentCandidate: MatchCandidate | null;
  loading: boolean;
  error: string | null;
  matchData: MatchData | null;
  handleLike: () => Promise<void>;
  handlePass: () => Promise<void>;
  dismissMatch: () => void;
  hasMore: boolean;
}

export function useSwipeController(userId: string): UseSwipeControllerReturn {
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [noMoreCandidates, setNoMoreCandidates] = useState(false);

  // Load initial candidates
  useEffect(() => {
    if (userId) {
      loadCandidates(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadCandidates = useCallback(
    async (append: boolean) => {
      if (!userId || loading || (append && noMoreCandidates)) return;

      setLoading(true);
      setError(null);

      try {
        const newCandidates = await getMatchCandidates(
          userId,
          INITIAL_BATCH_SIZE
        );

        if (newCandidates.length === 0) {
          setNoMoreCandidates(true);
          if (!append) {
            setError("No candidates found. Try adjusting your preferences.");
          }
          return;
        }

        if (newCandidates.length < INITIAL_BATCH_SIZE) {
          setNoMoreCandidates(true);
        }

        setCandidates(prev =>
          append ? [...prev, ...newCandidates] : newCandidates
        );
      } catch (err: any) {
        setError(err.message || "Failed to load candidates");
      } finally {
        setLoading(false);
      }
    },
    [userId, loading, noMoreCandidates]
  );

  const advanceToNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);

    // Prefetch when running low
    const remaining = candidates.length - nextIndex;
    if (remaining <= PREFETCH_THRESHOLD && !noMoreCandidates && !loading) {
      loadCandidates(true);
    }
  }, [
    currentIndex,
    candidates.length,
    noMoreCandidates,
    loading,
    loadCandidates,
  ]);

  const handleLike = useCallback(async () => {
    const candidate = candidates[currentIndex];
    if (!candidate) return;

    try {
      const result = await createSwipe(userId, candidate.userId, "like");

      if (result.success && result.isMatch) {
        setMatchData({
          matchId: result.matchId!,
          user: candidate,
        });
      }

      advanceToNext();
    } catch (err: any) {
      console.error("Failed to create swipe:", err);
      // Still advance even if API fails
      advanceToNext();
    }
  }, [userId, candidates, currentIndex, advanceToNext]);

  const handlePass = useCallback(async () => {
    // Just advance - no API call for pass per user requirement
    advanceToNext();
  }, [advanceToNext]);

  const dismissMatch = useCallback(() => {
    setMatchData(null);
  }, []);

  const currentCandidate = candidates[currentIndex] || null;
  const hasMore = currentIndex < candidates.length || !noMoreCandidates;

  return {
    candidates,
    currentCandidate,
    loading,
    error,
    matchData,
    handleLike,
    handlePass,
    dismissMatch,
    hasMore,
  };
}
