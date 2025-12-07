import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, Fragment } from "react";
import { useTranslation } from "../../../i18n/hooks";
import type { AxiosError } from "axios";
import api from "../../../services/api";
import { useUserContext } from "../../../context/app";
import Header from "../../../components/Header";
import LoadingPanel from "../../../components/LoadingPanel";
import UserForm, { type UserWithExtraData } from "../../profile/UserForm";
import OrderData from "../../orderHistory/OrderData";
import type { Order } from "../../../interface/order";

function AdminViewUser() {
  const { t } = useTranslation("admin");
  const { userId } = useParams<{ userId: string }>();
  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useQuery<UserWithExtraData>({
    queryKey: ["user", { id: userId }],
    queryFn: async () => {
      const res = await api.get(`/admin/user/${userId}`);
      return res.data;
    },
  });

  const {
    data: orders,
    isLoading: isOrdersLoading,
    isError: isOrdersError,
    error: ordersError,
  } = useQuery<Order[]>({
    queryKey: ["orders", { userId }],
    queryFn: async () => {
      const res = await api.get(`/admin/orders/${userId}`);
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isLoading = isUserLoading || isOrdersLoading;
  const isError = isUserError || isOrdersError;

  const userContext = useUserContext();
  if (userContext === undefined || userContext.role !== "admin") {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-100">
          <div className="text-5xl text">Restricted Access</div>
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <div>
        Error loading user profile:{" "}
        {(userError as AxiosError<{ error: string }>).response?.data.error} /{" "}
        {(ordersError as AxiosError<{ error: string }>).response?.data.error}
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-100">
          <div className="text-5xl text">Not found / Still fetching</div>
        </div>
      </>
    );
  }

  return (
    <div className="animate-fade-in min-h-screen">
      <title>PROFILE | PREMIUM BEN TOYS</title>
      <Activity mode={isLoading ? "visible" : "hidden"}>
        <LoadingPanel />
      </Activity>
      <Header />
      <h1 className="font-oswald font-bold text-center text-5xl my-10 mx-auto">
        {t("labels.userData")}
      </h1>
      <UserForm user={user} adminView={true} />
      <h1 className="font-oswald font-bold text-center text-5xl my-10 mx-auto">
        {t("titles.orderHistory", { ns: "shoppingCart" })}
      </h1>
      <div className="flex flex-col mx-auto max-w-240 gap-8 px-6 mb-20 overflow-auto max-h-140">
        {orders && orders.length > 0 ? (
          <>
            {orders.map((order, index) => (
              <Fragment key={order._id}>
                {index !== 0 && (
                  <hr className="border border-gray-300 dark:border-gray-500" />
                )}
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
    </div>
  );
}

export default AdminViewUser;
