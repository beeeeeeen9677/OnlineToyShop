import type { Good } from "../../interface/good";
import BannerItem from "./BannerItem";

function Banner({ goods }: { goods: Good[] }) {
  const sortedGoods = [...goods].sort((a, b) => {
    const aValue: number = a["broughtCount"];
    const bValue: number = b["broughtCount"];

    return bValue - aValue; // Highest first
  });

  return (
    <div>
      <div className="flex flex-nowrap overflow-hidden gap-4 p-4 bg-black dark:bg-gray-600 select-none">
        {sortedGoods.map((good) => (
          <BannerItem key={good._id} itemDetails={good} />
        ))}
      </div>
    </div>
  );
}

export default Banner;
