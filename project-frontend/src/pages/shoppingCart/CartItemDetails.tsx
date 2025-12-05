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

  if (!good) {
    return <div>null</div>;
  }

  if (isError) {
    return (
      <div>
        Error loading item details:
        {(error as AxiosError<{ error: string }>)?.response?.data?.error}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-600 h-fit relative">
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
