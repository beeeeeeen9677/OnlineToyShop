import { useUserContext } from "../../context/app";
import { useRoomContext } from "../../context/useRoomContext";
import type { ChatRoom } from "../../interface/chatRoom";

type CsRoomTabProps = {
  room: ChatRoom;
};

function CsRoomTab({ room }: CsRoomTabProps) {
  const user = useUserContext();
  const { roomId: currentRoomId } = useRoomContext();

  // Check if there are unread messages
  // ignore if last message is from current user
  const hasUnread =
    room.lastMessageTime &&
    room.lastMessageSenderId !== user?._id &&
    (!room.lastReadTime || room.lastMessageTime > room.lastReadTime);

  // console.log("Room:", room._id, {
  //   lastMessageTime: room.lastMessageTime,
  //   lastReadTime: room.lastReadTime,
  //   hasUnread,
  // });

  return (
    <div className="flex w-full h-full items-center justify-center relative">
      <div>{!user || user.role !== "admin" ? "Admin" : room._id}</div>
      {hasUnread && currentRoomId !== room._id && (
        <span className="bg-red-500 rounded-full size-3 animate-pulse absolute top-0 right-0" />
      )}
    </div>
  );
}

export default CsRoomTab;
