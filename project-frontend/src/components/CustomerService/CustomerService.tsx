import { Activity, useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RiCustomerService2Fill } from "react-icons/ri";
import { auth } from "../../firebase/firebase";
import type { AxiosError } from "axios";
import { RoomIdContext } from "../../context/useRoomContext";
import { useUserContext } from "../../context/app";
import { useSocketContext } from "../../context/socket";
import type { ChatRoom, ChatMessage } from "../../interface/chatRoom";
import CsPanel from "./CsPanel";
import { useChatRooms } from "../../hooks/useChatRooms";

// ROOT component for customer service chat
function CustomerService() {
  const [showWindow, setShowWindow] = useState(false);
  const [roomId, setRoomId] = useState<string>("");

  const user = useUserContext();
  const socket = useSocketContext();
  const queryClient = useQueryClient();
  const isFirstConnect = useRef(true);

  const { chatRooms, isLoading, isError, error, chatRoomsQueryKey } =
    useChatRooms(user!);

  // Listen for socket messages
  // moved to root level to ensure consistent updates
  useEffect(() => {
    const handleReceiveMessage = (data: ChatMessage) => {
      // Merge new message into the cached data (msg record) for this room
      queryClient.setQueryData<ChatMessage[]>(
        ["chatMessages", { roomId: data.roomId }],
        (oldMessages) => {
          if (!oldMessages) return; // probably havn't open the chat window, not fetch yet
          // Avoid duplicates by checking if message already exists
          const exists = oldMessages.some(
            (msg) =>
              msg.timestamp === data.timestamp &&
              msg.senderId === data.senderId &&
              msg.message === data.message
          );
          // console.log(data);
          if (exists) return oldMessages;
          return [...oldMessages, data];
        }
      );

      // Update lastMessageTime and lastMessageSenderId in chatRooms cache
      queryClient.setQueryData<ChatRoom[]>(chatRoomsQueryKey, (oldRooms) =>
        oldRooms?.map((room) =>
          room._id === data.roomId
            ? {
                ...room,
                lastMessageTime: data.timestamp,
                lastMessageSenderId: data.senderId,
              }
            : room
        )
      );

      //console.log("Received message:", data);

      // queryClient.invalidateQueries({ queryKey: chatRoomsQueryKey });
      // queryClient.invalidateQueries({
      //   queryKey: ["chatMessages", { roomId: data.roomId }],
      // });
    };

    // Invalidate cache on reconnect to fetch any missed messages
    const handleReconnect = () => {
      if (isFirstConnect.current) {
        isFirstConnect.current = false;
        return; // Skip invalidation on first connect
      }
      queryClient.invalidateQueries({ queryKey: ["chatMessages"] });
    };

    const handleNewChatRoom = (newRoom: ChatRoom) => {
      queryClient.setQueryData<ChatRoom[]>(chatRoomsQueryKey, (oldRooms) => {
        if (!oldRooms) return [newRoom];
        // Avoid duplicates
        const exists = oldRooms.some((room) => room._id === newRoom._id);
        if (exists) return oldRooms;
        return [...oldRooms, newRoom];
      });
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("connect", handleReconnect);
    socket.on("newChatRoom", handleNewChatRoom);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("connect", handleReconnect);
      socket.off("newChatRoom", handleNewChatRoom);
    };
  }, [socket, queryClient, chatRoomsQueryKey]);

  if (isError) {
    console.error(
      (error as AxiosError<{ error: string }>).response?.data.error
    );
    return null;
  }

  if (!auth.currentUser)
    // not logged in
    return null;

  // check if any room has unread messages
  // ignore if last message is from current user
  const hasAnyUnread = chatRooms?.some(
    (room) =>
      room.lastMessageTime &&
      room.lastMessageSenderId !== user?._id &&
      (!room.lastReadTime || room.lastMessageTime > room.lastReadTime)
  );

  return (
    <RoomIdContext.Provider value={{ roomId, setRoomId }}>
      <button
        onClick={() => setShowWindow((prev) => !prev)}
        className={`bg-primary text-white hover:bg-primary-hover hover:text-purple-50 dark:bg-white dark:text-primary dark:hover:bg-purple-50 dark:hover:text-primary-hover border-2 border-primary rounded-full flex items-center justify-center font-extrabold text-3xl size-12 fixed bottom-10 right-10 lg:right-30 cursor-pointer transition-transform duration-300 z-20`}
      >
        <RiCustomerService2Fill />
        {hasAnyUnread && !showWindow && (
          <span className="bg-red-500 rounded-full size-3 animate-pulse absolute top-0 right-0" />
        )}
      </button>

      <Activity mode={showWindow ? "visible" : "hidden"}>
        <CsPanel
          isLoading={isLoading}
          chatRooms={chatRooms ?? []}
          setShowWindow={setShowWindow}
        />
      </Activity>
    </RoomIdContext.Provider>
  );
}

export default CustomerService;
