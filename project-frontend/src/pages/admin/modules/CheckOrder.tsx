import { useQuery } from "@tanstack/react-query";
import api from "../../../services/api";
import type { AxiosError } from "axios";
import OrderData from "../../orderHistory/OrderData";
import { useTranslation } from "react-i18next";
import { Fragment, useState, useMemo, useTransition } from "react";
import type { Order } from "../../../interface/order";
import { Link } from "react-router";

function CheckOrder() {
  const { t } = useTranslation("admin");
  const [isPending, startTransition] = useTransition();

  // Filter states
  const [showFilter, setShowFilter] = useState(true);
  const [userIdFilter, setUserIdFilter] = useState("");
  const [orderIdFilter, setOrderIdFilter] = useState("");
  const [showPaidOnly, setShowPaidOnly] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [amountFrom, setAmountFrom] = useState("");
  const [amountTo, setAmountTo] = useState("");

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

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders.filter((order) => {
      // User ID filter
      if (
        userIdFilter &&
        !order.userId.toLowerCase().includes(userIdFilter.toLowerCase())
      ) {
        return false;
      }

      // Order ID filter
      if (
        orderIdFilter &&
        !order._id.toLowerCase().includes(orderIdFilter.toLowerCase())
      ) {
        return false;
      }

      // Paid status filter
      if (showPaidOnly && order.status !== "paid") {
        return false;
      }

      // Date range filter
      const orderDate = new Date(order.createdAt);
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        if (orderDate < fromDate) return false;
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // Include entire day
        if (orderDate > toDate) return false;
      }

      // Amount range filter
      if (amountFrom && order.orderTotal < parseFloat(amountFrom)) {
        return false;
      }
      if (amountTo && order.orderTotal > parseFloat(amountTo)) {
        return false;
      }

      return true;
    });
  }, [
    orders,
    userIdFilter,
    orderIdFilter,
    showPaidOnly,
    dateFrom,
    dateTo,
    amountFrom,
    amountTo,
  ]);

  const handleFilterChange =
    (setter: (value: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      startTransition(() => {
        setter(value);
      });
    };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    startTransition(() => {
      setShowPaidOnly(checked);
    });
  };

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
        <>
          {/* Filters Section */}
          {orders && (
            <div
              className={`mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-4 overflow-hidden ${
                showFilter ? "h-fit" : "h-16"
              }`}
            >
              <h2
                className="font-oswald font-bold text-2xl mb-4 cursor-pointer select-none flex justify-between items-center"
                onClick={() => {
                  setShowFilter((prev) => !prev);
                }}
              >
                <p> {t("labels.filters")}</p>
                <p>{showFilter ? " ▲" : " ▼"}</p>
              </h2>

              {/* Search Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("labels.userID")}
                  </label>
                  <input
                    type="text"
                    value={userIdFilter}
                    onChange={handleFilterChange(setUserIdFilter)}
                    placeholder={t("placeholders.searchUserId")}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("labels.orderID")}
                  </label>
                  <input
                    type="text"
                    value={orderIdFilter}
                    onChange={handleFilterChange(setOrderIdFilter)}
                    placeholder={t("placeholders.searchOrderId")}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>

              {/* Paid Status Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="paidOnly"
                  checked={showPaidOnly}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="paidOnly" className="text-sm font-medium">
                  {t("labels.showPaidOnly")}
                </label>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("labels.dateFrom")}
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={handleFilterChange(setDateFrom)}
                    onClick={(e) => {
                      e.currentTarget.showPicker();
                    }}
                    className="w-full px-3 py-2 border rounded-md cursor-pointer dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("labels.dateTo")}
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={handleFilterChange(setDateTo)}
                    onClick={(e) => {
                      e.currentTarget.showPicker();
                    }}
                    className="w-full px-3 py-2 border rounded-md cursor-pointer dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>

              {/* Amount Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("labels.amountFrom")} (HK$)
                  </label>
                  <input
                    type="number"
                    value={amountFrom}
                    onChange={handleFilterChange(setAmountFrom)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t("labels.amountTo")} (HK$)
                  </label>
                  <input
                    type="number"
                    value={amountTo}
                    onChange={handleFilterChange(setAmountTo)}
                    placeholder="999999"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {isPending ? (
                  <span>{t("labels.filtering")}...</span>
                ) : (
                  <span>
                    {t("labels.showing")} {filteredOrders.length}{" "}
                    {t("labels.of")} {orders.length} {t("labels.orders")}
                  </span>
                )}
              </div>
            </div>
          )}
          <div className="overflow-auto max-h-140">
            {orders && orders.length > 0 ? (
              <>
                {/* Orders List */}
                <div
                  className={isPending ? "opacity-50 transition-opacity" : ""}
                >
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order, index) => (
                      <Fragment key={order._id}>
                        {index !== 0 && (
                          <hr className="border border-gray-300 dark:border-gray-500 my-6" />
                        )}
                        <Link
                          to={`/admin/view-user/${order.userId}`}
                          className="font-oswald font-bold underline"
                        >
                          {t("labels.userID")}: {order.userId}
                        </Link>
                        <OrderData order={order} />
                      </Fragment>
                    ))
                  ) : (
                    <h1 className="font-oswald text-3xl mt-20 mb-20 text-center">
                      {t("messages.noMatchingOrders")}
                    </h1>
                  )}
                </div>
              </>
            ) : (
              <h1 className="font-oswald text-5xl mt-60 mb-20 self-center">
                {t("messages.noOrderFound", { ns: "shoppingCart" })}
              </h1>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default CheckOrder;
