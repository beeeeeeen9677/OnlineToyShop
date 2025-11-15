type Category =
  | "gunpla"
  | "model"
  | "figure"
  | "puzzle"
  | "board game"
  | "electronic";

export const categories: Category[] = [
  "gunpla",
  "model",
  "figure",
  "puzzle",
  "board game",
  "electronic",
];

interface Good {
  _id: string; // MongoDB document ID
  id: string;
  name: string;
  preorderCloseDate: Date;
  shippingDate: Date;
  price: number;
  description: string;
  imageUrl: string;
  viewedCount: number;
  broughtCount: number;
  createdAt: Date;
  category: Category[];
}
export type { Good, Category };
