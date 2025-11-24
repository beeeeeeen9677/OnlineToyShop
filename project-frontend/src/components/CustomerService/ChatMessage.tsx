import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";

type ChatMessageProps = {
  userId: string;
  isSender: boolean;
  message: string;
  timestamp: string;
};

type ChatUserData = {
  _id: string;
  firstName: string;
  lastName: string;
  role: string;
};

function ChatMessage({
  userId,
  isSender,
  message,
  timestamp,
}: ChatMessageProps) {
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery<ChatUserData>({
    queryKey: ["chatUser", userId],
    queryFn: async () => {
      const response = await api.get(`user/limited-data/${userId}`);
      return response.data;
    },
    enabled: !isSender,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading user data: {(error as Error).message}</div>;
  }

  return (
    <div className={`${isSender ? "ml-auto" : "mr-auto"} w-fit`}>
      {!isSender && (
        <div className="text-white ml-1 text-sm">
          {`${user?.firstName} ${user?.lastName} ${
            user?.role === "admin" ? "[admin]" : ""
          }`}
        </div>
      )}
      <div
        className={`${
          isSender ? "bg-green-300" : "bg-white"
        } text-black rounded-2xl p-2 w-fit`}
      >
        {message}
      </div>
      <div
        className={`text-white text-xs mx-1 mt-1 ${
          isSender ? "text-right" : ""
        }`}
      >
        {timestamp.split("T")[1].split(".")[0].substring(0, 5)}
      </div>
    </div>
  );
}

export default ChatMessage;
