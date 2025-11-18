import { Link } from "react-router";
import { useTranslation } from "../../i18n/hooks";
import type { Good } from "../../interface/good";

type ItemCardProps = {
  itemDetails: Good;
  dateType?: "preorderCloseDate" | "createdAt";
};

function ItemCard({ itemDetails, dateType }: ItemCardProps) {
  const { t } = useTranslation("index");
  return (
    <div className="w-[calc(100%/3-0.5rem)] aspect-1/2 md:w-36 md:h-80 lg:w-44 lg:h-88 xl:w-48 xl:h-96 bg-white shrink-0">
      <Link to={""} className="group">
        <div className="w-full h-1/2 sm:h-2/3 md:h-1/2 lg:h-2/3 overflow-hidden items-center flex ">
          <img
            src={itemDetails.imageUrl}
            className="object-contain scale-200 transform translate-y-6 group-hover:scale-100 group-hover:translate-0 transition duration-300"
          />
        </div>
        <div
          className={`px-1 pt-1 ${
            dateType === "createdAt" ? "text-blue-500" : "text-red-500"
          } font-bold text-xs `}
        >
          {t("info." + (dateType === "createdAt" ? "preorderOpen" : "openTo")) +
            ": "}
          {
            (dateType === "createdAt"
              ? itemDetails.createdAt
              : itemDetails.preorderCloseDate
            )
              .toString()
              .split("T")[0]
          }
        </div>
        <div className="font-oswald px-1 pt-1 text-black font-black text-sm line-clamp-2">
          {itemDetails.name}
        </div>
        <div className=" px-1 pt-1 text-black ">
          <span className="font-bold text-xs "> HK$ </span>
          <span className="font-oswald font-black text-sm ">
            {itemDetails.price}
          </span>
        </div>
      </Link>
    </div>
  );
}

export default ItemCard;
