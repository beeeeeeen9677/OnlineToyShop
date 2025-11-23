interface User {
  _id: string;
  firstName: string;
  lastName: string;
  firebaseUID: string;
  email: string;
  gender: "male" | "female" | "not answered";
  dateOfBirth: Date;
  role: "customer" | "admin";
}

export type { User };
