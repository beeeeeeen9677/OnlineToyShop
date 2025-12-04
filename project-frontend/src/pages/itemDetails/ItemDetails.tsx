import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "../../i18n/hooks";
import i18n from "../../i18n";
import type { AxiosError } from "axios";
import Header from "../../components/Header";
import LoadingPanel from "../../components/LoadingPanel";
import { useScrollToggleVisibility } from "../../hooks/useScrollToggleVisibility";
import { useGood } from "../../hooks/useGood";
import { useCart, CartLimitError } from "../shoppingCart/useCart";

function ItemDetails() {
  const { t } = useTranslation("goods");
  const { id } = useParams();
  const { isVisible } = useScrollToggleVisibility(150);
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState<{
    type: "success" | "error" | "limit";
    transKey: string;
  } | null>(null);

  // Fetch product details and track view count
  const {
    good: itemDetails,
    isLoading,
    isError,
    error,
  } = useGood(id, { trackView: true });

  const [quantity, setQuantity] = useState<number>(1);
  const minQuantity = 1;
  const maxQuantity = 3;
  const quantityBtnStyle =
    "bg-primary text-white disabled:bg-orange-200 disabled:text-black px-3 py-1 cursor-pointer";
  const quantityBtnOnClick = (mode: "+" | "-") => {
    if (mode === "+" && quantity < maxQuantity) {
      setQuantity(quantity + 1);
    } else if (mode === "-" && quantity > minQuantity) {
      setQuantity(quantity - 1);
    }
  };

  const preorderEnded = itemDetails
    ? new Date() > new Date(itemDetails.preorderCloseDate)
    : false;

  const handleAddToCart = async () => {
    if (preorderEnded || !id) return;

    setIsAdding(true);
    setCartMessage(null);

    try {
      await addItem(id, quantity);
      setCartMessage({ type: "success", transKey: t("messages.addedToCart") });
      // Clear success message after 3 seconds
      setTimeout(() => setCartMessage(null), 3000);
    } catch (err) {
      // Check for quantity limit error
      if (err instanceof CartLimitError) {
        setCartMessage({
          type: "limit",
          transKey: "messages.quantityLimitReached",
        });
      } else if (
        (err as AxiosError<{ error: string }>)?.response?.data?.error ===
        "QUANTITY_LIMIT_REACHED"
      ) {
        setCartMessage({
          type: "limit",
          transKey: "messages.quantityLimitReached",
        });
      } else {
        console.error("Failed to add to cart:", err);
        setCartMessage({ type: "error", transKey: "messages.addToCartFailed" });
      }
    } finally {
      setIsAdding(false);
    }
  };

  // dynamic title
  useEffect(() => {
    if (itemDetails?.name) {
      document.title = itemDetails.name + " | PREMIUM BEN TOYS";
    }
  }, [itemDetails?.name]);

  if (isError) {
    return (
      <div>Error loading item details: {error?.response?.data?.error}</div>
    );
  }
  if (!itemDetails) {
    return <LoadingPanel />;
  }

  return (
    <div className="animate-fade-in ">
      <Header />
      {isLoading && <LoadingPanel />}
      {/* <title>{item?.name}</title> */}
      <div className="p-8 space-y-10 max-w-280 mx-auto">
        <div className="flex flex-col md:flex-row gap-10 justify-center items-start ">
          <img
            src={itemDetails.imageUrl}
            alt={itemDetails?.name}
            className=" md:w-3/5 md:max-w-140 shrink-0"
          />
          <div className=" p-5 border-10 border-orange-100  dark:border-gray-500 space-y-4">
            <div className="font-oswald font-extrabold text-2xl">
              {itemDetails.name}
            </div>
            <div>
              <span className="ftext-xl "> HK$ </span>
              <span className="font-oswald font-medium text-xl ">
                {itemDetails.price}
              </span>
            </div>
            <div
              className={`text-white ${
                preorderEnded ? "bg-gray-400" : "bg-red-400"
              } w-fit p-0.5 text-xs`}
            >
              {preorderEnded
                ? t("status.preorderClosed")
                : t("status.preorder")}
            </div>
            {/*  Break line  */}
            <div className="border border-orange-100   dark:border-gray-500 " />
            <div className="text-sm flex">
              <div className="w-2/5"> {t("info.preorderOpen")}</div>
              <div className="font-extrabold ml-3 flex-1  ">
                : {itemDetails.createdAt.toString().split("T")[0]}
              </div>
            </div>
            <div className="text-sm flex">
              <div className="w-2/5"> {t("info.openTo")}</div>
              <div className="font-extrabold ml-3 flex-1  ">
                : {itemDetails.preorderCloseDate.toString().split("T")[0]}
              </div>
            </div>
            <div className="text-sm flex">
              <div className="w-2/5">{t("info.shippingDate")}</div>
              <div className="font-extrabold ml-3 flex-1  ">
                : {itemDetails.shippingDate.toString().split("T")[0]}
              </div>
            </div>
            {/*  Break line  */}
            <div className="border border-orange-100   dark:border-gray-500 " />
            <div className="text-sm font-extrabold">
              {t("info.quantity")}
              <div className="my-2">
                <button
                  className={quantityBtnStyle + " rounded-l-full"}
                  onClick={() => {
                    quantityBtnOnClick("-");
                  }}
                  disabled={quantity <= minQuantity}
                >
                  -
                </button>
                <span className="px-2 py-1 border border-gray-300 bg-white text-black">
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
              {quantity >= maxQuantity && (
                <div className="text-red-500 text-sm mt-1">
                  *{t("info.reachLimit")}
                </div>
              )}
            </div>
            {/*  Break line  */}
            <div className="border border-orange-100   dark:border-gray-500 " />
            <button
              className="rounded-full bg-primary text-white  py-2 w-full hover:bg-primary-hover cursor-pointer font-extrabold text-lg transition-colors disabled:bg-gray-400 disabled:cursor-default"
              onClick={handleAddToCart}
              disabled={preorderEnded || isAdding}
            >
              {preorderEnded
                ? t("status.preorderClosed")
                : isAdding
                ? t("buttons.adding")
                : t("buttons.addToCart")}
            </button>
            {/* Cart feedback message */}
            {cartMessage && (
              <div
                className={`text-sm mt-2 p-2 rounded text-center ${
                  cartMessage.type === "success"
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : cartMessage.type === "limit"
                    ? "bg-yellow-100 text-red-500 dark:bg-yellow-500 dark:text-red-500"
                    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                }`}
              >
                {t(cartMessage.transKey)}
              </div>
            )}
          </div>
        </div>
        {/*  Break line  */}
        <div className="border border-orange-100   dark:border-gray-500 " />
        <div>
          <div className="font-oswald font-extrabold text-xl mb-3">
            {t("info.productIntroduction")}
          </div>
          <div>{itemDetails.description[i18n.language as "en" | "zh"]}</div>
        </div>
      </div>
      <div className="mb-45" />
      <div
        className={
          `fixed bottom-0 bg-primary w-full py-6 text-white ` +
          (isVisible ? "animate-appear" : "animate-disappear")
        }
      >
        <div className="mx-auto max-w-280 px-8  lg:items-center flex flex-col lg:flex-row lg:justify-between">
          <div className="flex flex-col lg:flex-row justify-between">
            <div className="font-oswald font-extrabold text-md lg:max-w-5/7">
              {itemDetails.name}
            </div>
            <div>
              <span className="ftext-xl "> HK$ </span>
              <span className="font-oswald font-medium text-xl ">
                {itemDetails.price}
              </span>
            </div>
          </div>

          <button
            className="mx-auto border-white border-4 rounded-full bg-primary py-2 w-80 hover:bg-white hover:text-primary cursor-pointer font-extrabold text-lg transition-colors disabled:bg-gray-400 disabled:cursor-default disabled:hover:text-white"
            onClick={handleAddToCart}
            disabled={preorderEnded || isAdding}
          >
            {preorderEnded
              ? t("status.preorderClosed")
              : isAdding
              ? t("buttons.adding")
              : t("buttons.addToCart")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ItemDetails;
