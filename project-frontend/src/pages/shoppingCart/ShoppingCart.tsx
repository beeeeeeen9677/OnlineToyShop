import { Activity } from "react";
import { Link, useNavigate } from "react-router";
import { BiLeaf } from "react-icons/bi";
import { GiWindSlap } from "react-icons/gi";
import Header from "../../components/Header";
import CustomerService from "../../components/CustomerService/CustomerService";
import BackToTopButton from "../../components/BackToTopButton";
import LoadingPanel from "../../components/LoadingPanel";
import SearchBar from "../../components/SearchBar";
import CartItemDetails from "./CartItemDetails";
import { useTranslation } from "react-i18next";
import { useCart } from "./useCart";

function ShoppingCart() {
  const isLoading = false;
  const { t } = useTranslation("shoppingCart");
  const navigate = useNavigate();
  const { itemsWithDetails } = useCart();

  return (
    <div className="animate-fade-in min-h-screen">
      <title>SHOPPING CART | PREMIUM BEN TOYS</title>
      <Header />
      <Activity mode={isLoading ? "visible" : "hidden"}>
        <LoadingPanel />
      </Activity>
      <CustomerService />
      <BackToTopButton />
      <SearchBar />
      <div className="my-20 flex flex-col px-8 items-center">
        <h1 className="text-2xl md:text-5xl font-oswald font-bold text-center mb-10">
          {t("titles.shoppingCart")}
        </h1>
        <div className="flex flex-col md:flex-row md:max-w-280">
          {itemsWithDetails.length > 0 ? (
            <>
              {/* Cart Items */}
              <div className="flex-1 flex flex-col gap-8 ">
                {itemsWithDetails.map((item) => (
                  <CartItemDetails key={item.goodId} item={item} />
                ))}
              </div>
              {/* Cart Summary */}
              <div className="flex-1 "></div>
            </>
          ) : (
            <div className="mt-16 flex flex-col items-center text-center w-100 md:w-180 ">
              <h1 className=""> {t("messages.cartEmpty")}</h1>
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
                <Link className=" tw-round-primary-btn" to="/">
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
