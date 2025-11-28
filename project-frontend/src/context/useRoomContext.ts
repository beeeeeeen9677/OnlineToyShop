import { useContext } from "react";
import { createContext } from "react";

interface RoomIdContextType {
  roomId: string;
  setRoomId: (roomId: string) => void;
}

export const RoomIdContext = createContext<RoomIdContextType | undefined>(
  undefined
);

export const useRoomIdContext = () => {
  const context = useContext(RoomIdContext);
  if (!context) {
    throw new Error("useRoomIdContext must be used within a RoomIdProvider");
  }
  return context;
};
