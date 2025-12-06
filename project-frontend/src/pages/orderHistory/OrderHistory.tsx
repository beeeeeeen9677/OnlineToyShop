import { Activity } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import type { AxiosError } from "axios";
import { useTranslation } from "../../i18n/hooks";
import type { Order } from "../../interface/order";
import Header from "../../components/Header";
import LoadingPanel from "../../components/LoadingPanel";
import CustomerService from "../../components/CustomerService/CustomerService";
import BackToTopButton from "../../components/BackToTopButton";
import { useLoginContext, useUserContext } from "../../context/app";
import OrderData from "./OrderData";

function OrderHistory() {
  const { t } = useTranslation("shoppingCart");
  const user = useUserContext();
  const isLoggedIn = useLoginContext();

  const {
    data: items,
    isLoading,
    isError,
    error,
  } = useQuery<Order[]>({
    queryKey: ["userOrders"],
    queryFn: async () => {
      const res = await api.get("/orders/");
      return res.data;
      // return [];
    },
    enabled: isLoggedIn && !!user?._id,
  });

  if (isError) {
    return (
      <div>
        Error loading order history:{" "}
        {(error as AxiosError<{ error: string }>).response?.data.error}
      </div>
    );
  }

  return (
    <div className="animate-fade-in min-h-screen">
      <title>ORDERS | PREMIUM BEN TOYS</title>
      <Header />
      <Activity mode={isLoading ? "visible" : "hidden"}>
        <LoadingPanel />
      </Activity>
      <CustomerService />
      <BackToTopButton />
      <div className="flex flex-col mx-auto max-w-240 gap-8 px-6 mb-20">
        {items && items.length > 0 ? (
          <>
            <h1 className="font-oswald font-bold text-5xl my-10 mx-auto">
              {t("titles.orderHistory")}
            </h1>
            {items.map((order, index) => (
              <>
                {index !== 0 && (
                  <hr className="border-gray-300 dark:border-gray-500" />
                )}
                <OrderData key={order._id} item={order} />
              </>
            ))}
          </>
        ) : (
          <>
            <h1 className="font-oswald text-5xl mt-60 mb-20 self-center">
              {t("messages.noOrderFound")}
            </h1>
            <Link className="max-w-80 tw-round-primary-btn self-center" to="/">
              {t("buttons.home")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default OrderHistory;
