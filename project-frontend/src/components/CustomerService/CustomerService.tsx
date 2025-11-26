import { Activity, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RiCustomerService2Fill } from "react-icons/ri";
import { auth } from "../../firebase/firebase";
import api from "../../services/api";
import type { AxiosError } from "axios";
import { RoomContext } from "../../context/useRoomContext";
import { useUserContext } from "../../context/app";
import CsPanel from "./CsPanel";

// root component for customer service chat
function CustomerService() {
  const [showWindow, setShowWindow] = useState(false);
  const [roomId, setRoomId] = useState<string>("");

  const user = useUserContext();
  const {
    data: chatRooms, // rooms current user joined
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["chatRooms", { userId: user?._id }],
    queryFn: async () => {
      const res = await api.get(`/chat/chatRooms/${user?._id}`);
      return res.data;
    },
    enabled: !!user,
  });

  if (isError) {
    console.error(
      (error as AxiosError<{ error: string }>).response?.data.error
    );
    return null;
  }

  if (!auth.currentUser)
    // not logged in
    return null;

  return (
    <RoomContext.Provider value={{ roomId, setRoomId }}>
      <button
        onClick={() => setShowWindow((prev) => !prev)}
        className={`bg-primary text-white hover:bg-primary-hover hover:text-purple-50 dark:bg-white dark:text-primary dark:hover:bg-purple-50 dark:hover:text-primary-hover border-2 border-primary rounded-full flex items-center justify-center font-extrabold text-3xl size-12 fixed bottom-10 right-10 lg:right-30 cursor-pointer transition-transform duration-300 z-20`}
      >
        <RiCustomerService2Fill />
      </button>
      <Activity mode={showWindow ? "visible" : "hidden"}>
        <CsPanel isLoading={isLoading} chatRooms={chatRooms} />
      </Activity>
    </RoomContext.Provider>
  );
}

export default CustomerService;
