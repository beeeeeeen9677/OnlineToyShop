import type { CartItem } from "../../interface/cart";
import { useGood } from "../../hooks/useGood";
type CartItemProps = {
  item: CartItem;
};

function CartItemDetails({ item }: CartItemProps) {
  const { good, isLoading, isError } = useGood(item.goodId);

  if (isError) {
    return <div>Error loading item details.</div>;
  }

  return <div className="bg-white"></div>;
}

export default CartItemDetails;
