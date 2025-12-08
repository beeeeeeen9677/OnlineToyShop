import { useQuery } from "@tanstack/react-query";
import type { ChatRoom } from "../interface/chatRoom";
import type { User } from "../interface/user";
import api from "../services/api";
import { useMemo } from "react";

export const useChatRooms = (user: User) => {
  const chatRoomsQueryKey = useMemo(
    () => ["chatRooms", { userId: user?._id }],
    [user?._id]
  );
  const {
    data: chatRooms, // rooms of current user joined
    isLoading,
    isError,
    error,
  } = useQuery<ChatRoom[]>({
    queryKey: chatRoomsQueryKey,
    queryFn: async () => {
      const res = await api.get(`/chat/chatRooms/${user?._id}`);
      return res.data;
    },
    enabled: !!user,
  });
  return { chatRooms, isLoading, isError, error, chatRoomsQueryKey };
};
