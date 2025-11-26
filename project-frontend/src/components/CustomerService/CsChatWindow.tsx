import { useTranslation } from "../../i18n/hooks";
import React, { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUserContext } from "../../context/app";
import { useSocketContext } from "../../context/socket";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { useRoomContext } from "../../context/useRoomContext";
import ChatMessage from "./ChatMessage";
import type { ChatMessage as ChatMessageType } from "../../interface/chatRoom";
import { useMessageQuery } from "../../hooks/useMessageQuery";

function CsChatWindow() {
  const { t } = useTranslation("chat");
  const user = useUserContext();
  const { roomId } = useRoomContext();
  const maxMessageLength = 300;
  const socket = useSocketContext();
  const queryClient = useQueryClient();
  const isFirstConnect = useRef(true);

  // Fetch initial chat history from API
  const {
    data: chatRecords = [] as ChatMessageType[],
    isLoading,
    isError,
  } = useMessageQuery(roomId!);

  const [inputMessage, setInputMessage] = React.useState("");

  const messageContainerRef = useAutoScroll(chatRecords);

  // Listen for socket messages and merge into React Query cache
  useEffect(() => {
    const handleReceiveMessage = (data: ChatMessageType) => {
      // Merge new message into the cached data for this room
      queryClient.setQueryData<ChatMessageType[]>(
        ["chatMessages", { roomId }],
        (oldMessages) => {
          if (!oldMessages) return [data];
          // Avoid duplicates by checking if message already exists
          const exists = oldMessages.some(
            (msg) =>
              msg.timestamp === data.timestamp &&
              msg.senderId === data.senderId &&
              msg.message === data.message
          );
          if (exists) return oldMessages;
          return [...oldMessages, data];
        }
      );
    };

    // Invalidate cache on reconnect to fetch any missed messages
    const handleReconnect = () => {
      if (isFirstConnect.current) {
        isFirstConnect.current = false;
        return; // Skip invalidation on first connect
      }
      if (roomId) {
        queryClient.invalidateQueries({
          queryKey: ["chatMessages", { roomId }],
        });
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("connect", handleReconnect);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("connect", handleReconnect);
    };
  }, [socket, queryClient, roomId]);

  if (!user) return <div>User not exist</div>;
  if (isLoading)
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="border-10 rounded-full size-20 border-t-primary animate-spin"></div>
      </div>
    );
  if (isError)
    return (
      <div className="flex-1 flex items-center justify-center text-red-500">
        Error loading messages
      </div>
    );

  const sendMessage = () => {
    if (inputMessage.trim() !== "") {
      socket.emit("sendMessage", {
        roomId,
        message: inputMessage,
      });
      setInputMessage("");
    }
  };

  return (
    <div className="bg-gray-400 flex-1 flex flex-col  ">
      <h1 className="text-center">
        {user.role !== "admin" ? "Admin" : roomId}
      </h1>
      <div
        ref={messageContainerRef}
        className="border-2 border-[#ccc] p-2 overflow-y-auto flex-1 space-y-3"
      >
        {chatRecords.map((msg, index) => {
          // show same date once
          const currentDate = msg.timestamp.split("T")[0];
          const previousDate =
            index > 0 ? chatRecords[index - 1].timestamp.split("T")[0] : null;
          const showDate = currentDate !== previousDate;

          return (
            <React.Fragment key={index}>
              {showDate && (
                <div className="bg-white text-black text-xs w-fit mx-auto p-0.75 rounded-lg">
                  {currentDate}
                </div>
              )}
              <ChatMessage
                userId={user._id}
                isSender={msg.senderId === user._id}
                message={msg.message}
                timestamp={msg.timestamp}
              />
            </React.Fragment>
          );
        })}
      </div>
      <div className="flex items-end">
        <div className="flex-1 relative m-1">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={t("placeholders.typeMessage")}
            maxLength={maxMessageLength}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); // Prevent newline
                sendMessage();
              }
            }}
            className="w-full overflow-auto resize-none field-sizing-content wrap-anywhere p-2 pb-6 border rounded text-gray-700 max-h-40 bg-white"
          />
          <span className="absolute bottom-2 right-6 text-xs text-gray-500">
            {inputMessage.length}/{maxMessageLength}
          </span>
        </div>

        <button
          onClick={sendMessage}
          className="cursor-pointer p-2 bg-primary text-white rounded-2xl m-1"
        >
          {t("buttons.send")}
        </button>
      </div>
    </div>
  );
}

export default CsChatWindow;
