import { useTranslation } from "../../i18n/hooks";
import React, { useEffect, useEffectEvent } from "react";
import { useUserContext } from "../../context/app";
import { useSocketContext } from "../../context/socket";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { useRoomIdContext } from "../../context/useRoomContext";
import ChatMessage from "./ChatMessage";
import { toHKDateString } from "../../utils/dateUtils";
import type {
  ChatMessage as ChatMessageType,
  ChatRoom,
} from "../../interface/chatRoom";
import { useMessageQuery } from "../../hooks/useMessageQuery";
import api from "../../services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

function CsChatWindow() {
  const { t } = useTranslation("chat");
  const user = useUserContext();
  const { roomId } = useRoomIdContext();
  const maxMessageLength = 300;
  const socket = useSocketContext();

  // Fetch initial chat history from API
  const {
    data: chatRecords = [] as ChatMessageType[],
    isLoading,
    isError,
  } = useMessageQuery(roomId!);

  const [inputMessage, setInputMessage] = React.useState("");

  const messageContainerRef = useAutoScroll(chatRecords);

  const queryClient = useQueryClient();

  const { mutateAsync: setLastReadTime } = useMutation({
    mutationFn: async () => {
      const res = await api.put(`/chat/lastReadAt/${roomId}`);
      return res.data;
    },
    onSuccess: (data) => {
      const lastReadTime = data.lastReadTime;
      queryClient.setQueryData<ChatRoom[]>(
        ["chatRooms", { userId: user?._id }],
        (oldRooms) =>
          oldRooms?.map((room) =>
            room._id === roomId ? { ...room, lastReadTime } : room
          )
      );
    },
  });

  const setLastReadTimeEvent = useEffectEvent(async () => {
    await setLastReadTime();
  });

  // set last read time when opening room or receiving new messages
  useEffect(() => {
    if (chatRecords.length === 0) return;

    setLastReadTimeEvent();
  }, [roomId, chatRecords.length]);

  // Socket listener is now in CsPanel so it stays active even when this component unmounts

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
        //senderId: user._id,
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
          // show same date once (HK timezone)
          const currentDate = toHKDateString(msg.timestamp);
          const previousDate =
            index > 0 ? toHKDateString(chatRecords[index - 1].timestamp) : null;
          const showDate = currentDate !== previousDate;

          return (
            <React.Fragment key={index}>
              {showDate && (
                <div className="bg-white text-black text-xs w-fit mx-auto p-0.75 px-2 rounded-lg sticky top-0 z-10 shadow-sm">
                  {currentDate}
                </div>
              )}
              <ChatMessage
                senderId={msg.senderId}
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
