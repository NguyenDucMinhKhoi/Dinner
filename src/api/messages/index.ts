import type {
  Message,
  MessageWithSender,
  SendMessageParams,
  SendMessageResult,
} from "@/src/types/messages";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../supabase";

// ============================================================================
// 1. SEND MESSAGE
// ============================================================================

/**
 * Send a message in a match conversation
 *
 * Flow:
 * 1. Validates user is part of the match
 * 2. Inserts message
 * 3. Updates matches.last_message_at (manually, no trigger)
 *
 * @param userId - Current authenticated user ID
 * @param params - Message parameters (matchId, content, messageType)
 * @returns Result with success status and message data
 */
export async function sendMessage(
  userId: string,
  params: SendMessageParams
): Promise<SendMessageResult> {
  try {
    // Step 1: Validate user is part of match
    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("id, user_id_1, user_id_2")
      .eq("id", params.matchId)
      .single();

    if (matchError || !match) {
      throw new Error("Match not found");
    }

    if (match.user_id_1 !== userId && match.user_id_2 !== userId) {
      throw new Error("Unauthorized: You are not part of this match");
    }

    // Step 2: Insert message
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({
        match_id: params.matchId,
        sender_id: userId,
        content: params.content.trim(),
        message_type: params.messageType || "text",
      })
      .select()
      .single();

    if (messageError) {
      throw messageError;
    }

    // Step 3: Update matches.last_message_at manually (no trigger)
    const { error: updateError } = await supabase
      .from("matches")
      .update({ last_message_at: message.created_at })
      .eq("id", params.matchId);

    if (updateError) {
      console.error("Failed to update last_message_at:", updateError);
      // Don't throw - message was sent successfully
    }

    return { success: true, message };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to send message",
    };
  }
}

// ============================================================================
// 2. GET MESSAGES FOR A MATCH
// ============================================================================

/**
 * Get all messages in a match conversation
 *
 * @param matchId - Match ID
 * @param limit - Number of messages to fetch (default 50)
 * @param offset - Offset for pagination (default 0)
 * @returns Result with messages array sorted by created_at ASC (oldest first)
 */
export async function getMatchMessages(
  matchId: string,
  limit = 50,
  offset = 0
): Promise<{
  success: boolean;
  messages?: MessageWithSender[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select(
        `
        id,
        match_id,
        sender_id,
        content,
        message_type,
        read,
        read_at,
        created_at,
        updated_at,
        sender:profiles!messages_sender_id_fkey (
          id,
          username,
          avatar_url
        )
      `
      )
      .eq("match_id", matchId)
      .order("created_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return { success: true, messages: (data as any) || [] };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to get messages",
    };
  }
}

// ============================================================================
// 3. MARK MESSAGES AS READ
// ============================================================================

/**
 * Mark all unread messages in a match as read (for current user)
 * Only marks messages sent by the OTHER user
 *
 * @param userId - Current user ID
 * @param matchId - Match ID
 * @returns Result with success status
 */
export async function markMessagesAsRead(
  userId: string,
  matchId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("messages")
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq("match_id", matchId)
      .eq("read", false)
      .neq("sender_id", userId); // Don't mark own messages as read

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to mark messages as read",
    };
  }
}

// ============================================================================
// 4. GET UNREAD MESSAGE COUNT FOR A MATCH
// ============================================================================

/**
 * Get unread message count for a specific match
 * Counts messages sent by OTHER user that are unread
 *
 * @param userId - Current user ID
 * @param matchId - Match ID
 * @returns Result with unread count
 */
export async function getUnreadCount(
  userId: string,
  matchId: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const { count, error } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("match_id", matchId)
      .eq("read", false)
      .neq("sender_id", userId);

    if (error) {
      throw error;
    }

    return { success: true, count: count || 0 };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to get unread count",
    };
  }
}

// ============================================================================
// 5. GET TOTAL UNREAD COUNT (ALL MATCHES)
// ============================================================================

/**
 * Get total unread message count across all user's matches
 * Used for badge on Messages tab
 *
 * @param userId - Current user ID
 * @returns Result with total unread count
 */
export async function getTotalUnreadCount(
  userId: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    // Get all user's match IDs
    const { data: matches, error: matchError } = await supabase
      .from("matches")
      .select("id")
      .or(`user_id_1.eq.${userId},user_id_2.eq.${userId}`);

    if (matchError) {
      throw matchError;
    }

    if (!matches || matches.length === 0) {
      return { success: true, count: 0 };
    }

    const matchIds = matches.map(m => m.id);

    // Count unread messages in those matches (not sent by user)
    const { count, error: countError } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .in("match_id", matchIds)
      .eq("read", false)
      .neq("sender_id", userId);

    if (countError) {
      throw countError;
    }

    return { success: true, count: count || 0 };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to get total unread count",
    };
  }
}

// ============================================================================
// 6. DELETE MESSAGE
// ============================================================================

/**
 * Delete a message (optional feature)
 * User can only delete their own messages (enforced by RLS)
 *
 * @param messageId - Message ID to delete
 * @returns Result with success status
 */
export async function deleteMessage(
  messageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to delete message",
    };
  }
}

// ============================================================================
// 7. REAL-TIME SUBSCRIPTION (OPTIONAL)
// ============================================================================

/**
 * Subscribe to new messages in a match
 * Returns a subscription that can be unsubscribed later
 *
 * Usage example:
 * ```typescript
 * const subscription = subscribeToMatchMessages(matchId, (message) => {
 *   console.log('New message:', message);
 *   // Update UI with new message
 * });
 *
 * // Later, cleanup:
 * subscription.unsubscribe();
 * ```
 *
 * @param matchId - Match ID to subscribe to
 * @param onMessage - Callback when new message arrives
 * @returns Supabase RealtimeChannel subscription
 */
export function subscribeToMatchMessages(
  matchId: string,
  onMessage: (message: Message) => void
): RealtimeChannel {
  return supabase
    .channel(`match:${matchId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `match_id=eq.${matchId}`,
      },
      payload => {
        onMessage(payload.new as Message);
      }
    )
    .subscribe();
}

/**
 * Unsubscribe from match messages
 *
 * @param subscription - The subscription to unsubscribe
 */
export async function unsubscribeFromMatchMessages(
  subscription: RealtimeChannel
): Promise<void> {
  await supabase.removeChannel(subscription);
}
