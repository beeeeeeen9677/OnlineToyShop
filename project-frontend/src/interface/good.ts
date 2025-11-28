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
  preorderCloseDate: string; // ISO date string from API
  shippingDate: string; // ISO date string from API
  price: number;
  //description: string;
  description: Record<"en" | "zh", string>; // { en: "text", zh: "text" }
  quota: number;
  imageUrl: string;
  viewedCount: number;
  broughtCount: number;
  createdAt: string; // ISO date string from API
  category: Category[];
  available: boolean;
}
export type { Good, Category };
