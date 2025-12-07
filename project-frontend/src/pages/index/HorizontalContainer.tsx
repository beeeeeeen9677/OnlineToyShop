import { Link } from "react-router";
import type { Good } from "../../interface/good";
import ItemCard from "./ItemCard";
import "./IndexPage.css";
import { useDragHook } from "../../hooks/useDragHook";

type HorizontalContainerProps = {
  title: string;
  subtitle: string;
  goods: Good[];
  sortingKey: keyof Good;
  titleColor?: string;
};

function HorizontalContainer({
  title,
  subtitle,
  goods,
  sortingKey,
  titleColor = "text-blue-500",
}: HorizontalContainerProps) {
  const {
    containerRef,
    handleMouseDown,
    handleTouchStart,
    containerStyle,
    dragged,
  } = useDragHook();

  const sortedGoods = [...goods]
    .sort((a, b) => {
      const aValue = a[sortingKey];
      const bValue = b[sortingKey];

      // Handle date string sorting (for createdAt, preorderCloseDate, shippingDate)
      if (sortingKey === "createdAt" || sortingKey === "shippingDate") {
        const aDate = new Date(aValue as string);
        const bDate = new Date(bValue as string);
        return bDate.getTime() - aDate.getTime(); // Newest first
      } else if (sortingKey === "preorderCloseDate") {
        const aDate = new Date(aValue as string);
        const bDate = new Date(bValue as string);
        return aDate.getTime() - bDate.getTime(); // Earliest first
      }

      // Handle numeric sorting
      if (typeof aValue === "number" && typeof bValue === "number") {
        return bValue - aValue; // Highest first
      }

      return 0;
    })
    .slice(0, 15); // Limit to 15 items

  const searchURL = new URLSearchParams();
  searchURL.append(
    "sort",
    (sortingKey as string) === "createdAt" ? "newest" : "preorderCloseDate_asc"
  );

  //console.log(searchURL);

  return (
    <div>
      <div
        className={`font-oswald text-center m-6 font-semibold text-3xl md:text-5xl ${titleColor}`}
      >
        <div> {title}</div>
        <Link to={`/search?${searchURL}`} className="underline text-xl">
          {subtitle}
        </Link>
      </div>
      <div
        className="flex gap-4 p-4 bg-black dark:bg-gray-600 overflow-x-auto scrollbar-custom "
        ref={containerRef}
        onMouseDown={handleMouseDown} // Start drag
        onTouchStart={handleTouchStart} // Start drag for mobile
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
            dragged={dragged}
          />
        ))}
      </div>
    </div>
  );
}

export default HorizontalContainer;
