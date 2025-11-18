import type { Good } from "../../interface/good";
import ItemCard from "./ItemCard";
import "./IndexPage.css";
import { useDragHook } from "../../hooks/useDragHook";

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
  const { containerRef, handleMouseDown, containerStyle } = useDragHook();

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
      <div className="font-oswald text-center m-6 font-semibold text-3xl md:text-5xl text-blue-500 dark:text-white">
        <div> {title}</div>
      </div>
      <div
        className="flex gap-4 p-4 bg-black dark:bg-gray-600 overflow-x-auto scrollbar-custom "
        ref={containerRef}
        onMouseDown={handleMouseDown} // Start drag
        style={containerStyle}
      >
        {/* Goods */}
        {sortedGoods.map((good) => (
          <ItemCard
            key={good._id}
            itemDetails={good}
            dateType={
              sortingKey === "createdAt" ? "createdAt" : "preorderCloseDate"
            }
          />
        ))}
        {/* Use Repeated Data for test */}
        {sortedGoods.map((good) => (
          <ItemCard
            key={good._id}
            itemDetails={good}
            dateType={
              sortingKey === "createdAt" ? "createdAt" : "preorderCloseDate"
            }
          />
        ))}
        {sortedGoods.map((good) => (
          <ItemCard
            key={good._id}
            itemDetails={good}
            dateType={
              sortingKey === "createdAt" ? "createdAt" : "preorderCloseDate"
            }
          />
        ))}
      </div>
    </div>
  );
}

export default HorizontalContainer;
