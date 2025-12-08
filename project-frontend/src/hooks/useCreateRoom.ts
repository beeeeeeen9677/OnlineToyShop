import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

export const useCreateRoom = (userId: string) => {
  const queryClient = useQueryClient();
  const { mutateAsync: createRoom, isPending } = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      const res = await api.post("/chat/chatRooms", {
        userId,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["chatRooms", { userId }],
      });
      console.log("Chat room created:", data._id);
      // Room joining is now handled automatically on backend
    },
  });

  return { createRoom, isPending };
};
