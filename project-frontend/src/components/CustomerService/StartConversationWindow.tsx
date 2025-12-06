import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserContext } from "../../context/app";
import { useTranslation } from "../../i18n/hooks";
import api from "../../services/api";

// for customers to create a room containning current user and admin
function StartConversationWindow() {
  const { t } = useTranslation("chat");
  const user = useUserContext();
  const queryClient = useQueryClient();
  const { mutateAsync: createRoom, isPending } = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const res = await api.post("/chat/chatRooms", {
        userId: user._id,
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["chatRooms", { userId: user?._id }],
      });
      console.log("Chat room created:", data._id);
      // Room joining is now handled automatically on backend
    },
  });

  // for customers to start conversation with admin only
  return (
    <div className="bg-gray-400 flex-1 flex justify-center items-center">
      {isPending ? (
        <div className="border-10 rounded-full size-20 border-t-primary animate-spin"></div>
      ) : (
        <button
          disabled={!user || user.role !== "customer"}
          onClick={() => {
            createRoom();
          }}
          className="bg-primary text-white px-4 py-2 rounded-full border-2 hover:bg-primary-hover hover:text-purple-50 dark:bg-white dark:text-primary dark:hover:bg-purple-50 dark:hover:text-primary-hover transition-colors cursor-pointer"
        >
          {t("buttons.startConversation")}
        </button>
      )}
    </div>
  );
}

export default StartConversationWindow;
