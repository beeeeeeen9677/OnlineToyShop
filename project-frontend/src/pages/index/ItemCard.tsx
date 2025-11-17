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
    <div className="w-36 h-72 sm:w-45 sm:h-90 md:w-42 md:h-84 lg:w-44 lg:h-88 xl:w-48 xl:h-96 bg-white shrink-0">
      <Link to={""} className="group">
        <div className=" w-full h-2/3 overflow-hidden flex items-center ">
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
        <div className="font-oswald px-1 pt-1 text-black font-black text-sm line-clamp-2">
          {/* separate HKD and number style */}
          HKD$ {itemDetails.price}
        </div>
      </Link>
    </div>
  );
}

export default ItemCard;
