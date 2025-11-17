import { Link } from "react-router";
import type { Good } from "../../interface/good";

function ItemCard({ itemDetails }: { itemDetails: Good }) {
  return (
    <Link to={""} className="w-40 h-80 bg-white">
      <img
        src={itemDetails.imageUrl}
        className="bg-amber-200 w-full h-1/2"
      ></img>
      <div className="text-black font-bold text-xl">{itemDetails.name}</div>
    </Link>
  );
}

export default ItemCard;
