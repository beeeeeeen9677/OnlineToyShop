import { useQuery } from "@tanstack/react-query";
import type { ChatMessage } from "../interface/chatRoom";
import api from "../services/api";

const fetchChatMessages = async (roomId: string): Promise<ChatMessage[]> => {
  const response = await api.get<ChatMessage[]>(`/chat/messages/${roomId}`);
  return response.data;
};
/**
 * React Query hook for fetching chat message history
 * - Only fetches when roomId is provided
 * - Uses staleTime: Infinity to prevent refetching (real-time updates via socket)
 * - Caches per room for quick switching between rooms
 */
export const useMessageQuery = (roomId: string) =>
  useQuery<ChatMessage[], Error>({
    queryKey: ["chatMessages", { roomId }],
    queryFn: async () => fetchChatMessages(roomId),
    enabled: !!roomId, // Only fetch when roomId exists
    staleTime: Infinity, // Never mark as stale (socket handles real-time updates)
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if cached
    refetchOnReconnect: false, // Don't refetch on network reconnect
  });
