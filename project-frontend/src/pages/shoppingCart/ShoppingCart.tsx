import { Activity } from "react";
import { Link, useNavigate } from "react-router";
import { BiLeaf } from "react-icons/bi";
import { GiWindSlap } from "react-icons/gi";
import { useState } from "react";
import { useLoginContext } from "../../context/app";
import { auth } from "../../firebase/firebase";
import api from "../../services/api";
import type { AxiosError } from "axios";
import Header from "../../components/Header";
import CustomerService from "../../components/CustomerService/CustomerService";
import BackToTopButton from "../../components/BackToTopButton";
import LoadingPanel from "../../components/LoadingPanel";
import SearchBar from "../../components/SearchBar";
import CartItemDetails from "./CartItemDetails";
import { useTranslation } from "react-i18next";
import { useCart } from "./useCart";

function ShoppingCart() {
  const { t } = useTranslation("shoppingCart");
  const navigate = useNavigate();
  const { items, itemsWithDetails, cartTotalAmount, refetch } = useCart();
  const isLoggedIn = useLoginContext();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const checkout = async () => {
    if (!isLoggedIn) {
      navigate("/auth");
      return;
    }

    if (!auth.currentUser?.emailVerified) {
      alert(t("messages.verifyEmail"));
      navigate("/user");
      return;
    }

    if (items.length === 0) {
      alert(t("messages.cartEmpty"));
      return;
    }

    setIsCheckingOut(true);

    try {
      // Create order (pending status)
      const orderResponse = await api.post("/orders", { items });
      const order = orderResponse.data;

      // TODO: Payment integration will go here
      // For now, immediately confirm payment (mock payment success)
      await api.post(`/orders/${order._id}/confirm`);

      // Refresh cart (items should be removed after payment confirmation)
      refetch();

      alert(t("messages.orderSuccess"));
      // TODO: Navigate to order confirmation page
      navigate("/");
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      console.error("Checkout error:", error);
      const errorMessage =
        axiosError.response?.data?.error || t("messages.orderFailed");
      alert(errorMessage);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="animate-fade-in min-h-screen">
      <title>SHOPPING CART | PREMIUM BEN TOYS</title>
      <Header />
      <Activity mode={isCheckingOut ? "visible" : "hidden"}>
        <LoadingPanel />
      </Activity>
      <CustomerService />
      <BackToTopButton />
      <SearchBar />
      <div className="my-10 md:my-20 flex flex-col px-8 items-center">
        <h1 className="text-3xl md:text-5xl font-oswald font-bold text-center mb-10">
          {t("titles.shoppingCart")}
        </h1>
        <div className="flex flex-col md:flex-row md:max-w-280 gap-10">
          {itemsWithDetails.length > 0 ? (
            <>
              {/* Cart Items */}
              <div className="flex-3 flex flex-col gap-8 ">
                {itemsWithDetails.map((item) => (
                  <CartItemDetails key={item.goodId} item={item} />
                ))}
              </div>
              {/* Cart Summary */}
              <div className="flex-2 px-5 py-8 h-fit border-10 border-orange-100  dark:border-gray-500 space-y-4 font-oswald">
                <h1 className="text-2xl font-bold">
                  {t("labels.billingSummary")}
                </h1>
                <hr className="border border-orange-100  dark:border-gray-500 " />
                <div className="flex justify-between text-md">
                  <div>{t("labels.itemTotal")}</div>
                  <div>HK$ {cartTotalAmount}</div>
                </div>
                <div className="flex justify-between text-md">
                  <div>{t("labels.shippingFee")}</div>
                  <div>HK$ 40</div>
                </div>{" "}
                <hr className="border border-orange-300  dark:border-gray-300 " />
                <div className="flex justify-between text-md">
                  <div>{t("labels.orderTotal")}</div>
                  <div>HK$ {cartTotalAmount + 40}</div>
                </div>{" "}
                <hr className="border border-orange-100  dark:border-gray-500 " />
                <div className="flex flex-col">
                  <div>{t("labels.shippingArea")}</div>
                  <div className="text-center text-xl font-bold border rounded-md m-4 py-1 select-none">
                    {t("locations.hongKong")}
                  </div>
                </div>
                <button
                  className="my-6 tw-round-primary-btn"
                  onClick={checkout}
                  disabled={isCheckingOut || items.length === 0}
                >
                  {isCheckingOut
                    ? t("buttons.processing")
                    : t("buttons.checkout")}
                </button>
                <div className="font-bold text-sm">
                  {t("messages.noExchangeOrReturn")}
                </div>
              </div>
            </>
          ) : (
            <div className="mt-16 flex flex-col items-center text-center w-100 md:w-180 ">
              <h1 className="font-oswald"> {t("messages.cartEmpty")}</h1>
              <div className="mt-10 ">
                <BiLeaf size={100} className=" inline-block rotate-180" />
                <GiWindSlap size={48} className="inline-block" />
              </div>
              <div className="mt-10 flex flex-col md:flex-row gap-8 w-full">
                <button
                  className="w-full  border-4 rounded-full py-2 hover:bg-white hover:text-primary cursor-pointer font-extrabold text-lg transition-colors disabled:bg-gray-400 disabled:cursor-default disabled:hover:text-white"
                  onClick={() => navigate(-1)}
                >
                  {t("buttons.previousPage")}
                </button>
                <Link className="tw-round-primary-btn" to="/">
                  {t("buttons.home")}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShoppingCart;
