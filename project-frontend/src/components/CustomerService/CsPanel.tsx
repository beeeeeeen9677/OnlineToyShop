import { useRoomContext } from "../../context/useRoomContext";
import StartConversationWindow from "./StartConversationWindow";
import CsChatWindow from "./CsChatWindow";
import type { ChatRoom } from "../../interface/chatRoom";
import CsRoomList from "./CsRoomList";
import LoadingPanel from "../LoadingPanel";
import { useEffect, useEffectEvent } from "react";

type CsPanelProps = {
  isLoading: boolean;
  chatRooms: ChatRoom[];
  setShowWindow: (show: boolean) => void;
};

function CsPanel({ isLoading, chatRooms, setShowWindow }: CsPanelProps) {
  const { roomId, setRoomId } = useRoomContext();

  // Socket listener is now in CustomerService.tsx so it stays active even when panel is closed

  // select first room when open cs panel
  // (also trigger when user clicked start conversation btn)
  const setRoomIdEvent = useEffectEvent((chatRooms: ChatRoom[]) => {
    if (chatRooms && roomId === "" && chatRooms.length > 0) {
      //console.log("Setting roomId to:", chatRooms[0]?.roomId);
      setRoomId(chatRooms[0]._id);
    }
  });
  useEffect(() => {
    setRoomIdEvent(chatRooms);
  }, [chatRooms]);

  if (isLoading) {
    return <LoadingPanel />;
  }

  return (
    <div className="z-30 fixed top-15 bottom-25 inset-x-20 bg-gray-300 dark:bg-gray-500 rounded-2xl flex overflow-hidden animate-scale-in">
      <CsRoomList rooms={chatRooms} />
      {roomId ? <CsChatWindow /> : <StartConversationWindow />}
      <button
        className="absolute top-0 right-0 bg-red-700 rounded-full size-6 cursor-pointer text-white flex items-center justify-center hover:bg-red-800"
        onClick={() => setShowWindow(false)}
      >
        X
      </button>
    </div>
  );
}

export default CsPanel;
