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

    if (aValue instanceof Date && bValue instanceof Date) {
      return bValue.getTime() - aValue.getTime(); // Newest first
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
