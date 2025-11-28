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

  return (
    <div className="w-1/4">
      {rooms.map((room) => (
        <div
          onClick={() => {
            //console.log(room);
            handleRoomSelect(room._id);
          }}
          key={room._id}
          className={`flex p-2 justify-center items-center h-18 overflow-hidden border-b border-gray-300 cursor-pointer ${
            roomId === room._id
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
