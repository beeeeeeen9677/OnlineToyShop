import { RiDeleteBin2Line } from "react-icons/ri";
import type { CartItem } from "../../interface/cart";
import { useGood } from "../../hooks/useGood";
import { useCart } from "./useCart";
import { useTranslation } from "../../i18n/hooks";
import QuantityButtons from "../../components/QuantityButtons";
import type { AxiosError } from "axios";
type CartItemProps = {
  item: CartItem;
};

function CartItemDetails({ item }: CartItemProps) {
  const { good, isError, error } = useGood(item.goodId);
  const { t } = useTranslation("shoppingCart");
  const { updateQuantity, removeItem } = useCart();

  const modifyQuantity = (newQuantity: number) => {
    updateQuantity(item.goodId, newQuantity);
  };

  {
    /* loading skeleton */
  }
  if (!good) {
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

  if (isError) {
    const errorMessage =
      (error as AxiosError<{ error: string }>)?.response?.data?.error ||
      t("errors.loadFailed");
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-600 dark:text-red-400 font-medium">
          {t("errors.itemLoadError")}
        </p>
        <p className="text-red-500 dark:text-red-300 text-sm mt-1">
          {errorMessage}
        </p>
      </div>
    );
  }

  return (
    <div className=" h-fit relative">
      <div className="font-oswald text-sm font-semibold md:text-xl mb-2 ">
        {good?.name}
      </div>
      <div className="flex gap-4">
        {/* LHS */}
        <img
          src={good.imageUrl}
          alt={good?.name}
          className="object-cover max-w-3/10"
        />
        {/* RHS */}
        <div>
          <div className="font-oswald mb-4">HK$ {good?.price}</div>
          <div>{t("labels.quantity")}</div>
          <QuantityButtons
            quantity={item.quantity}
            setQuantity={modifyQuantity}
            minQuantity={1}
            maxQuantity={3}
          />
          <div className="text-xs">
            {t("labels.subtotal")}: HK$ {good.price * item.quantity}
          </div>
        </div>
      </div>
      <RiDeleteBin2Line
        size={32}
        className="absolute bottom-3 right-3 cursor-pointer"
        onClick={() => {
          removeItem(item.goodId);
        }}
      />
    </div>
  );
}

export default CartItemDetails;
