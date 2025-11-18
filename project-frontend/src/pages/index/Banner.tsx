import React from "react";
import type { Good } from "../../interface/good";

function Banner({ goods }: { goods: Good[] }) {
  const sortedGoods = [...goods].sort((a, b) => {
    const aValue: number = a["broughtCount"];
    const bValue: number = b["broughtCount"];

    return bValue - aValue; // Highest first
  });

  return <div>Banner</div>;
}

export default Banner;
