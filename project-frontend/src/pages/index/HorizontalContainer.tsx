import type { Good } from "../../interface/good";
import ItemCard from "./ItemCard";

type HorizontalContainerProps = {
  title: string;
  goods: Good[];
  sortingKey: keyof Good;
};

function HorizontalContainer({
  title,
  goods,
  sortingKey,
}: HorizontalContainerProps) {
  const sortedGoods = [...goods].sort((a, b) => {
    const aValue = a[sortingKey];
    const bValue = b[sortingKey];

    // Handle date string sorting (for createdAt, preorderCloseDate, shippingDate)
    if (
      sortingKey === "createdAt" ||
      sortingKey === "preorderCloseDate" ||
      sortingKey === "shippingDate"
    ) {
      const aDate = new Date(aValue as string);
      const bDate = new Date(bValue as string);
      return bDate.getTime() - aDate.getTime(); // Newest first
    }

    // Handle numeric sorting
    if (typeof aValue === "number" && typeof bValue === "number") {
      return bValue - aValue; // Highest first
    }

    return 0;
  });

  return (
    <div>
      <div>{title}</div>
      <div className="flex gap-4 p-4 bg-black dark:bg-gray-600">
        {/* Goods */}
        {sortedGoods.map((good) => (
          <ItemCard key={good._id} itemDetails={good} />
        ))}
      </div>
    </div>
  );
}

export default HorizontalContainer;
