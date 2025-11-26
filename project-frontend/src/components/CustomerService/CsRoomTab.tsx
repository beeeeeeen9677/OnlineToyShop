import React from "react";
import { useUserContext } from "../../context/app";
import type { ChatRoom } from "../../interface/chatRoom";

type CsRoomTabProps = {
  room: ChatRoom;
};

function CsRoomTab({ room }: CsRoomTabProps) {
  const user = useUserContext();

  return (
    <div>
      <div>{!user || user.role !== "admin" ? "Admin" : room.roomId}</div>
    </div>
  );
}

export default CsRoomTab;
