import { createContext, useContext } from "react";
import { Socket } from "socket.io-client";

// Create the context
export const SocketContext = createContext<Socket | undefined>(undefined);
// Custom hook to use the socket
export const useSocketContext = (): Socket => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return socket;
};
