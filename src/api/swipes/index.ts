import type { SwipeAction, SwipeResult } from "../../types/swipe";
import { supabase } from "../supabase";

/**
 * Create a swipe record and check for mutual match
 *
 * Flow:
 * 1. Insert swipe record (user_id swipes on target_user_id with action)
 * 2. If action is 'like', check if target_user_id also liked user_id
 * 3. If mutual like exists, create match record
 * 4. Return result with match status
 */
export async function createSwipe(
  userId: string,
  targetUserId: string,
  action: SwipeAction
): Promise<SwipeResult> {
  try {
    // Step 1: Insert swipe record
    const { error: swipeError } = await supabase.from("swipes").insert({
      user_id: userId,
      target_user_id: targetUserId,
      action,
    });

    if (swipeError) {
      throw swipeError;
    }

    // Step 2: If action is 'like', check for mutual match
    if (action === "like") {
      const isMutual = await checkMutualMatch(userId, targetUserId);

      if (isMutual) {
        // Step 3: Create match record
        const matchId = await createMatch(userId, targetUserId);
        return {
          success: true,
          isMatch: true,
          matchId,
        };
      }
    }

    return {
      success: true,
      isMatch: false,
    };
  } catch (error: any) {
    return {
      success: false,
      isMatch: false,
      error: error.message || "Failed to create swipe",
    };
  }
}

/**
 * Check if target user has also liked the current user
 * (reverse swipe exists with action='like')
 */
async function checkMutualMatch(
  userId: string,
  targetUserId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("swipes")
    .select("action")
    .eq("user_id", targetUserId)
    .eq("target_user_id", userId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.action === "like";
}

/**
 * Create a match record when mutual like is detected
 * Uses ordered UUIDs (smaller first) for consistent match identification
 */
async function createMatch(
  userId: string,
  targetUserId: string
): Promise<string> {
  // Order user IDs to ensure consistency (smaller UUID first)
  const [user1Id, user2Id] =
    userId < targetUserId ? [userId, targetUserId] : [targetUserId, userId];

  const { data, error } = await supabase
    .from("matches")
    .insert({
      user_id_1: user1Id,
      user_id_2: user2Id,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create match: ${error.message}`);
  }

  return data.id;
}

/**
 * Get all swipes for a user (optional: filter by action)
 */
export async function getUserSwipes(
  userId: string,
  action?: SwipeAction
): Promise<any[]> {
  let query = supabase
    .from("swipes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (action) {
    query = query.eq("action", action);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get user swipes: ${error.message}`);
  }

  return data || [];
}

/**
 * Get all matches for a user with profile info
 */
export async function getUserMatches(userId: string): Promise<any[]> {
  // Query matches where user is either user1 or user2
  const { data, error } = await supabase
    .from("matches")
    .select(
      `
      id,
      created_at,
      last_message_at,
      user1:user_id_1 (id, username, avatar_url, bio),
      user2:user_id_2 (id, username, avatar_url, bio)
    `
    )
    .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get user matches: ${error.message}`);
  }

  // Transform to return the matched user (not current user)
  return (
    data?.map((match: any) => {
      const matchedUser = match.user1.id === userId ? match.user2 : match.user1;
      return {
        matchId: match.id,
        createdAt: match.created_at,
        lastMessageAt: match.last_message_at,
        user: matchedUser,
      };
    }) || []
  );
}
