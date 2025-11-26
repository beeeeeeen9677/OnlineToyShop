import React from "react";
import { useRoomContext } from "../../context/useRoomContext";
import type { ChatRoom } from "../../interface/chatRoom";
import CsRoomTab from "./CsRoomTab";

type CsRoomListProps = {
  rooms?: ChatRoom[];
};

function CsRoomList({ rooms = [] }: CsRoomListProps) {
  const { roomId, setRoomId } = useRoomContext();

  return (
    <div className="w-1/4">
      {rooms.map((room) => (
        <div
          onClick={() => setRoomId(room.roomId)}
          key={room._id}
          className={`flex p-2 justify-center items-center h-18 overflow-hidden border-b border-gray-300 cursor-pointer ${
            roomId === room.roomId
              ? "bg-gray-100 text-black"
              : "bg-gray-300 text-black hover:bg-gray-400"
          }`}
        >
          <CsRoomTab room={room} />
        </div>
      ))}
    </div>
  );
}

export default CsRoomList;
