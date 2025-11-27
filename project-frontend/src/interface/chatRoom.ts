interface ChatRoom {
  _id: string; // MongoDB document ID
  // roomId: string;  // use MongoDB _id directly
  createdAt: string; // ISO date string from API
  joinedUsers: string[]; // Array of User IDs
  lastMessageTime: string | null; // Timestamp of latest message in room
  lastReadTime: string | null; // Last read timestamp for current user in this room
}

interface ChatMessage {
  _id: string;
  roomId: string;
  senderId: string;
  message: string;
  timestamp: string; // ISO date string
}

export type { ChatRoom, ChatMessage };
