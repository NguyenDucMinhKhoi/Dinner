export type MessageType = "text" | "image" | "location";

export type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
};

export type MessageWithSender = Message & {
  sender: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
};

export type SendMessageParams = {
  matchId: string;
  content: string;
  messageType?: MessageType;
};

export type SendMessageResult = {
  success: boolean;
  message?: Message;
  error?: string;
};
