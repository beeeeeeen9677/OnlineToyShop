import { Link } from "react-router";
import { useTranslation } from "../../i18n/hooks";
import type { Good } from "../../interface/good";
import i18n from "../../i18n";

function BannerItem({ itemDetails }: { itemDetails: Good }) {
  const { t } = useTranslation("index");

  return (
    <Link
      to={""}
      className="flex transition duration-150 ease-in hover:brightness-80 w-full h-full"
    >
      <div className="bg-white flex-5 lg:flex-4 flex flex-col justify-center">
        <div className="px-2 md:px-4 xl:px-6">
          <div className="text-white bg-red-400 w-fit p-0.5 text-xs">
            {t("info.PRE-ORDER")}
          </div>
          <div
            className="font-bold font-oswald text-black line-clamp-2 2xl:line-clamp-4
          text-sm sm:text-lg md:text-3xl lg:text-4xl xl:text-5xl
          "
          >
            {itemDetails.name}
          </div>
          <div className="text-gray-600 mt-2 lg:mt-6 line-clamp-3 md:line-clamp-4 lg:line-clamp-9 text-xs md:text-sm ">
            {itemDetails.description[i18n.language as "en" | "zh"]}
          </div>
        </div>
      </div>
      <div className="flex-4 md:flex-5  ">
        <img
          src={itemDetails.imageUrl}
          alt={itemDetails.name}
          className="object-cover w-full h-full"
        />
      </div>
    </Link>
  );
}

export default BannerItem;
