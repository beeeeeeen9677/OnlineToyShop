import { useTranslation } from "react-i18next";
import type { Order, OrderItem } from "../../interface/order";
import { toHKDateString } from "../../utils/dateUtils";

type OrderItemProps = {
  item: Order;
};

function OrderData({ item }: OrderItemProps) {
  const { t } = useTranslation("shoppingCart");
  return (
    <div className="font-oswald ">
      <h1 className="">
        {t("labels.orderID")}: {item._id}
      </h1>
      <h1>
        {t("labels.status")}: {t(`status.${item.status}`)}
      </h1>
      <h1>
        {t("labels.orderDate")}: {toHKDateString(new Date(item.createdAt))}
      </h1>
      <h1>
        {t("labels.total")}: HK$ {item.orderTotal}
      </h1>
      <h1>
        {t("labels.goods")}: {item.items.length}
      </h1>
      <div className="flex flex-col gap-4 mt-2">
        {item.items.map((orderItem: OrderItem, index: number) => (
          <div key={index} className="flex gap-4 items-start">
            {/* LHS */}
            <img
              src={orderItem.imageUrl}
              alt={orderItem.name}
              className="object-cover max-w-1/4 min-w-40 aspect-square rounded-sm"
            />
            {/* RHS */}

            <div className="flex-1 flex flex-col gap-1">
              <div className="text-md underline mb-4">{orderItem.name}</div>

              <hr className="border-gray-300 dark:border-gray-500 border-t-2" />

              <div className="flex justify-between text-md">
                <span className="flex-1"> {t("labels.price")}</span>
                <span className="flex-1">{`HK$ ${orderItem.price}`}</span>
              </div>

              <hr className="border-gray-300 dark:border-gray-500 border-t-2" />

              <div className="flex justify-between text-md">
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
        ))}
      </div>
    </div>
  );
}

export default OrderData;
