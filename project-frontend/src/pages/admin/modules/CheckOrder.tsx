import { useQuery } from "@tanstack/react-query";
import api from "../../../services/api";
import type { AxiosError } from "axios";
import OrderData from "../../orderHistory/OrderData";
import { useTranslation } from "react-i18next";
import { Fragment } from "react/jsx-runtime";
import type { Order } from "../../../interface/order";

function CheckOrder() {
  const { t } = useTranslation("admin");
  const {
    data: orders,
    isLoading,
    isError,
    error,
  } = useQuery<Order[]>({
    queryKey: ["allOrders"],
    queryFn: async () => {
      const res = await api.get("/admin/orders");
      return res.data;
    },
  });

  return (
    <div>
      {isLoading ? (
        <div>Loading orders...</div>
      ) : isError ? (
        <div>
          Error loading orders:{" "}
          {(error as AxiosError<{ error: string }>).response?.data?.error}
        </div>
      ) : (
        <div className="overflow-auto max-h-170">
          {orders && orders.length > 0 ? (
            <>
              {orders.map((order, index) => (
                <Fragment key={order._id}>
                  {index !== 0 && (
                    <hr className="border border-gray-300 dark:border-gray-500 my-6" />
                  )}
                  <h1 className="font-oswald font-bold">
                    {t("labels.userID")}: {order.userId}
                  </h1>
                  <OrderData order={order} />
                </Fragment>
              ))}
            </>
          ) : (
            <h1 className="font-oswald text-5xl mt-60 mb-20 self-center">
              {t("messages.noOrderFound", { ns: "shoppingCart" })}
            </h1>
          )}
        </div>
      )}
    </div>
  );
}

export default CheckOrder;
