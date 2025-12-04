import { Activity } from "react";
import Header from "../../components/Header";
import CustomerService from "../../components/CustomerService/CustomerService";
import BackToTopButton from "../../components/BackToTopButton";
import LoadingPanel from "../../components/LoadingPanel";
import SearchBar from "../../components/SearchBar";
import { useTranslation } from "react-i18next";
import { useCart } from "./useCart";
import CartItemDetails from "./CartItemDetails";

function ShoppingCart() {
  const isLoading = false;
  const { t } = useTranslation("shoppingCart");
  const { items } = useCart();
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
      <div className="mt-20 flex flex-col">
        <h1 className="text-5xl font-oswald font-bold text-center">
          {t("titles.shoppingCart")}
        </h1>
        <div className="flex flex-col md:flex-row">
          <div className="flex-1 flex flex-col">
            {items.map((item, index) => (
              <CartItemDetails key={index} item={item} />
            ))}
          </div>
          <div className="flex-1 "></div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingCart;
