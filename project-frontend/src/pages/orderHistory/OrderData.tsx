import { useTranslation } from "react-i18next";
import type { Order, OrderItem } from "../../interface/order";
import { toHKDateString } from "../../utils/dateUtils";
import { Link } from "react-router";

type OrderItemProps = {
  order: Order;
};

function OrderData({ order }: OrderItemProps) {
  const { t } = useTranslation("shoppingCart");
  let statusColor = "";
  let opacity = "";
  switch (order.status) {
    case "paid":
      statusColor = "text-green-500";
      break;
    case "cancelled":
    case "expired":
      statusColor = "text-red-500";
      opacity = "opacity-50";
      break;
  }

  return (
    <div className={`font-oswald ${opacity}`}>
      <h1 className="">
        {t("labels.orderID")}: {order._id}
      </h1>
      <h1>
        {t("labels.status")}:
        <span className={statusColor}> {t(`status.${order.status}`)}</span>
      </h1>
      <h1>
        {t("labels.orderDate")}: {toHKDateString(new Date(order.createdAt))}
      </h1>
      <h1>
        {t("labels.total")}: HK$ {order.orderTotal}
      </h1>
      <h1>
        {t("labels.goods")}: {order.items.length}
      </h1>
      <div className="flex flex-col gap-4 mt-2">
        {order.items.map((orderItem: OrderItem, index: number) => {
          return (
            <div key={index} className="flex gap-4 items-start">
              {/* LHS */}
              <img
                src={orderItem.imageUrl}
                alt={orderItem.name}
                className="object-cover max-w-1/4 min-w-40 aspect-square rounded-sm"
              />
              {/* RHS */}

              <div className="flex-1 flex flex-col gap-1">
                <Link
                  to={`/item/${orderItem.goodId}`}
                  className="text-base underline mb-4 cursor-pointer"
                >
                  {orderItem.name}
                </Link>

                <hr className="border-gray-300 dark:border-gray-500 border-t-2" />

                <div className="flex justify-between text-base">
                  <span className="flex-1"> {t("labels.price")}</span>
                  <span className="flex-1">{`HK$ ${orderItem.price}`}</span>
                </div>

                <hr className="border-gray-300 dark:border-gray-500 border-t-2" />

                <div className="flex justify-between text-base">
                  <span className="flex-1"> {t("labels.quantity")}</span>
                  <span className="flex-1">{orderItem.quantity}</span>
                </div>

                <hr className="border-gray-300 dark:border-gray-500 border-t-2" />

                <div className="flex justify-between text-sm">
                  <span className="flex-1">{t("labels.subtotal")}</span>
                  <span className="flex-1">{`HK$ ${
                    orderItem.price * orderItem.quantity
                  }`}</span>
                </div>

                <hr className="border-gray-300 dark:border-gray-500 border-t-2" />

                <div className="flex justify-between text-sm mb-4 md:mb-0 lg:mb-4">
                  <span className="flex-1">{t("labels.shippingDate")}</span>
                  <span className="flex-1">
                    {toHKDateString(orderItem.shippingDate)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderData;
