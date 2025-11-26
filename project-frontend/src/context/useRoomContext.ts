import { useContext } from "react";
import { createContext } from "react";

interface RoomContextType {
  roomId: string;
  setRoomId: (roomId: string) => void;
}

export const RoomContext = createContext<RoomContextType | undefined>(
  undefined
);

export const useRoomContext = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useRoomContext must be used within a RoomProvider");
  }
  return context;
};
