import type { Good } from "../../interface/good";
import { useNavigate } from "react-router";

type SearchItemProps = {
  itemDetails: Good;
};

function SearchItem({ itemDetails }: SearchItemProps) {
  const navigate = useNavigate();
  return (
    <div
      className="group max-w-75 bg-white shrink-0 cursor-pointer"
      onClick={() => {
        navigate(`/item/${itemDetails._id}`);
      }}
    >
      <div className="w-full h-7/11 sm:h-8/11 md:h-2/3 overflow-hidden items-center flex ">
        <img
          src={itemDetails.imageUrl}
          className="object-contain aspect-square scale-200 transform translate-y-12 group-hover:scale-100 group-hover:translate-0 transition duration-300"
        />
      </div>

      <h1 className="font-oswald px-1 pt-1 text-black font-black text-md line-clamp-3">
        {itemDetails.name}
      </h1>
      <div className=" px-1 pt-1 text-black ">
        <span className="font-bold text-xs "> HK$ </span>
        <span className="font-oswald font-black text-sm ">
          {itemDetails.price}
        </span>
      </div>
    </div>
  );
}
export default SearchItem;
