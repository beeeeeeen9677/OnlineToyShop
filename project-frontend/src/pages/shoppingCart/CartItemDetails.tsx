import { useNavigate } from "react-router";
import { RiDeleteBin2Line } from "react-icons/ri";
import { useCart, type CartItemWithDetails } from "./useCart";
import { useTranslation } from "../../i18n/hooks";
import QuantityButtons from "../../components/QuantityButtons";
import { toHKDateString } from "../../utils/dateUtils";

type CartItemProps = {
  item: CartItemWithDetails;
};

function CartItemDetails({ item }: CartItemProps) {
  const navigate = useNavigate();
  const { t } = useTranslation("shoppingCart");
  const { updateQuantity, removeItem } = useCart();

  const modifyQuantity = (newQuantity: number) => {
    updateQuantity(item.goodId, newQuantity);
  };

  // Loading skeleton - isLoaded is false while fetching
  if (!item.isLoaded) {
    return (
      <div className="bg-white dark:bg-gray-600 h-fit animate-pulse">
        <div className="h-6 bg-gray-300 dark:bg-gray-500 rounded w-3/4 mb-2"></div>
        <div className="flex gap-4">
          <div className="bg-gray-300 dark:bg-gray-500 w-3/10 aspect-square"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-300 dark:bg-gray-500 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-500 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-300 dark:bg-gray-500 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-500 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  const preorderEnded = item
    ? new Date() > new Date(item.preorderCloseDate)
    : false;
  const available =
    !preorderEnded && item?.quota && item.quota > 0 && item?.available;

  return (
    <div className="h-fit relative">
      <h1
        className="font-oswald underline cursor-pointer text-base font-semibold md:text-xl mb-2 "
        onClick={() => {
          navigate(`/item/${item._id}`);
        }}
      >
        {item.name}
      </h1>
      <div className="flex gap-4 items-start">
        {/* LHS */}

        <div
          className="group w-3/10 aspect-square overflow-hidden rounded-md cursor-pointer "
          onClick={() => {
            navigate(`/item/${item._id}`);
          }}
        >
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        {/* RHS */}
        <div className="flex-1 flex flex-col relative">
          {!available && (
            <div className="absolute top-0 right-4 flex items-center justify-center text-white bg-gray-400 w-fit p-0.5 text-sm  md:text-xs lg:text-base">
              {t("status.preorderClosed", { ns: "goods" })}
            </div>
          )}
          <div className="font-oswald mb-4">HK$ {item.price}</div>
          <div className="text-xs mb-4 md:mb-0 lg:mb-4">
            {t("labels.shippingDate")}: {toHKDateString(item.shippingDate)}
          </div>
          <div className="text-sm">{t("labels.quantity")}</div>
          <QuantityButtons
            quantity={item.quantity}
            setQuantity={modifyQuantity}
            minQuantity={1}
            maxQuantity={3}
          />
          <div className="text-xs">
            {t("labels.subtotal")}: HK$ {item.price * item.quantity}
          </div>
        </div>
      </div>
      <RiDeleteBin2Line
        size={32}
        className="absolute bottom-3 right-3 cursor-pointer hover:text-red-600 transition-colors"
        onClick={() => {
          removeItem(item.goodId);
        }}
      />
    </div>
  );
}

export default CartItemDetails;
