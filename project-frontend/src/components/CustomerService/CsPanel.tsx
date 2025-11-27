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
};

function CsPanel({ isLoading, chatRooms }: CsPanelProps) {
  const { roomId, setRoomId } = useRoomContext();

  // select first room when open cs panel
  // (also trigger when user clicked start conversation btn)
  const setRoomIdEvent = useEffectEvent((chatRooms: ChatRoom[]) => {
    if (chatRooms && roomId === "" && chatRooms.length > 0) {
      //console.log("Setting roomId to:", chatRooms[0]?.roomId);
      return;
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
    </div>
  );
}

export default CsPanel;
