import { supabase } from "../supabase";

/**
 * Get user profile by ID for match profile screen
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return { success: true, profile: data };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to fetch profile",
    };
  }
}

/**
 * Find match ID between current user and target user
 */
export async function findMatchId(
  currentUserId: string,
  targetUserId: string
): Promise<{ success: boolean; matchId?: string; error?: string }> {
  try {
    // Order user IDs (smaller first, as per matches table constraint)
    const [userId1, userId2] =
      currentUserId < targetUserId
        ? [currentUserId, targetUserId]
        : [targetUserId, currentUserId];

    const { data, error } = await supabase
      .from("matches")
      .select("id")
      .eq("user_id_1", userId1)
      .eq("user_id_2", userId2)
      .single();

    if (error) {
      // No match found is not an error, just return null
      if (error.code === "PGRST116") {
        return { success: true, matchId: undefined };
      }
      throw error;
    }

    return { success: true, matchId: data?.id };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to find match",
    };
  }
}
