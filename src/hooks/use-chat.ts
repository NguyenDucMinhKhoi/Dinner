import {
  getMatchMessages,
  markMessagesAsRead,
  sendMessage,
  subscribeToMatchMessages,
  unsubscribeFromMatchMessages,
} from "@/src/api/messages";
import type { MessageWithSender } from "@/src/types/messages";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export function useChat(matchId: string, userId: string) {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load messages
  const loadMessages = async () => {
    if (!matchId || !userId) return;

    try {
      setLoading(true);
      const result = await getMatchMessages(matchId, 100);

      if (result.success && result.messages) {
        setMessages(result.messages);
        // Mark as read
        await markMessagesAsRead(userId, matchId);
      } else {
        setError(result.error || "Failed to load messages");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || sending) return;

    try {
      setSending(true);
      const result = await sendMessage(userId, {
        matchId,
        content: content.trim(),
      });

      if (result.success && result.message) {
        // Optimistically add to UI (realtime will also trigger, but that's ok)
        setMessages(prev => [
          ...prev,
          {
            ...result.message!,
            sender: {
              id: userId,
              username: null,
              avatar_url: null,
            },
          },
        ]);
      } else {
        setError(result.error || "Failed to send message");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  // Setup realtime subscription
  useEffect(() => {
    if (!matchId) return;

    let subscription: RealtimeChannel | null = null;

    const setupRealtime = () => {
      subscription = subscribeToMatchMessages(matchId, newMessage => {
        // Only add if not from current user (to avoid duplication with optimistic update)
        if (newMessage.sender_id !== userId) {
          setMessages(prev => [
            ...prev,
            {
              ...newMessage,
              sender: {
                id: newMessage.sender_id,
                username: null,
                avatar_url: null,
              },
            },
          ]);
        }
      });
    };

    setupRealtime();

    return () => {
      if (subscription) {
        unsubscribeFromMatchMessages(subscription);
      }
    };
  }, [matchId, userId]);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, [matchId, userId]);

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage: handleSendMessage,
    refresh: loadMessages,
  };
}
