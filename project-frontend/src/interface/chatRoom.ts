interface ChatRoom {
  _id: string; // MongoDB document ID
  // roomId: string;  // use MongoDB _id directly
  createdAt: string; // ISO date string from API
  joinedUsers: string[]; // Array of User IDs
}

interface ChatMessage {
  _id: string;
  roomId: string;
  senderId: string;
  message: string;
  timestamp: string; // ISO date string
}

export type { ChatRoom, ChatMessage };
