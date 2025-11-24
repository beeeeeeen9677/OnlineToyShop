import React from "react";

type ChatMessageProps = {
  isSender: boolean;
  message: string;
};

function ChatMessage({ isSender, message }: ChatMessageProps) {
  return <div>{message}</div>;
}

export default ChatMessage;
