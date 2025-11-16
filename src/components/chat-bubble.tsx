import React from "react";
import { StyleSheet, Text, View } from "react-native";

type ChatBubbleProps = {
  message: string;
  isOwn: boolean;
  timestamp: string;
  senderName?: string;
};

export function ChatBubble({
  message,
  isOwn,
  timestamp,
  senderName,
}: ChatBubbleProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <View
      style={[
        styles.container,
        isOwn ? styles.ownContainer : styles.otherContainer,
      ]}
    >
      {!isOwn && senderName && (
        <Text style={styles.senderName}>{senderName}</Text>
      )}
      <View
        style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}
      >
        <Text
          style={[
            styles.message,
            isOwn ? styles.ownMessage : styles.otherMessage,
          ]}
        >
          {message}
        </Text>
      </View>
      <Text
        style={[
          styles.timestamp,
          isOwn ? styles.ownTimestamp : styles.otherTimestamp,
        ]}
      >
        {formatTime(timestamp)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 12,
    maxWidth: "75%",
  },
  ownContainer: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  otherContainer: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  senderName: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
    marginLeft: 12,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  ownBubble: {
    backgroundColor: "#FF6B6B",
  },
  otherBubble: {
    backgroundColor: "#F0F0F0",
  },
  message: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownMessage: {
    color: "#FFF",
  },
  otherMessage: {
    color: "#2C2C2C",
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    marginHorizontal: 12,
  },
  ownTimestamp: {
    color: "#999",
  },
  otherTimestamp: {
    color: "#999",
  },
});
