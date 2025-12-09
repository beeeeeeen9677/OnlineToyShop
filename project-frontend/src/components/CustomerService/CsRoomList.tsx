import { useRoomIdContext } from "../../context/useRoomContext";
import type { ChatRoom } from "../../interface/chatRoom";
import CsRoomTab from "./CsRoomTab";

type CsRoomListProps = {
  rooms?: ChatRoom[];
};

function CsRoomList({ rooms = [] }: CsRoomListProps) {
  const { roomId, setRoomId } = useRoomIdContext(); // current selected room

  /*
  const {
    mutateAsync: markRoomAsRead,
    isError,
    error,
  } = useMutation({
    mutationFn: async (selectedRoomId: string) => {
      await api.put(`/chat/lastReadAt/${selectedRoomId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chatRooms", { userId: user?._id }],
      });
    },
  });
  */
  const handleRoomSelect = async (selectedRoomId: string) => {
    setRoomId(selectedRoomId);
    /*
    markRoomAsRead(selectedRoomId);
    if (isError) {
      console.error(
        "Error when marking room as read:",
        (error as AxiosError<{ error: string }>).response?.data.error
      );
    }
    */
  };

  const sortedRoom = rooms.sort((a, b) => {
    const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
    const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
    return timeB - timeA;
  });

  return (
    <div className="w-1/4">
      {sortedRoom.map((room) => (
        <div
          onClick={() => {
            //console.log(room);
            handleRoomSelect(room._id);
          }}
          key={room._id}
          className={`flex p-2 justify-center items-center h-18 overflow-hidden border-b border-gray-300 cursor-pointer ${
            roomId === room._id
              ? "bg-orange-200 text-black"
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
