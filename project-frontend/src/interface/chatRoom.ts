interface ChatRoom {
  _id: string; // MongoDB document ID
  // roomId: string;  // use MongoDB _id directly
  createdAt: string; // ISO date string from API
  joinedUsers: string[]; // Array of User IDs
}

export type { ChatRoom };
