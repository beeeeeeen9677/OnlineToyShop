import { useTranslation } from "../i18n/hooks";

type QuantityButtonsProps = {
  quantity: number;
  setQuantity: (quantity: number) => void;
  minQuantity?: number;
  maxQuantity?: number;
};

function QuantityButtons({
  quantity,
  setQuantity,
  minQuantity = 1,
  maxQuantity = 3,
}: QuantityButtonsProps) {
  const quantityBtnStyle =
    "bg-primary text-white disabled:bg-orange-200 disabled:text-black px-3 py-1 cursor-pointer";
  const quantityBtnOnClick = (mode: "+" | "-") => {
    if (mode === "+" && quantity < maxQuantity) {
      setQuantity(quantity + 1);
    } else if (mode === "-" && quantity > minQuantity) {
      setQuantity(quantity - 1);
    }
  };
  return (
    <div className="text-sm font-extrabold my-1 flex">
      <button
        className={quantityBtnStyle + " rounded-l-full"}
        onClick={() => {
          quantityBtnOnClick("-");
        }}
        disabled={quantity <= minQuantity}
      >
        -
      </button>
      <span className="px-2 flex items-center border border-gray-300 bg-white text-black">
        {quantity}
      </span>
      <button
        className={quantityBtnStyle + " rounded-r-full"}
        onClick={() => {
          quantityBtnOnClick("+");
        }}
        disabled={quantity >= maxQuantity}
      >
        +
      </button>
    </div>
  );
}

export default QuantityButtons;
