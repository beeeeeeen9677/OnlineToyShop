import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Fragment, useEffect } from "react";
import { useTranslation } from "../../../i18n/hooks";
import type { AxiosError } from "axios";
import api from "../../../services/api";
import { useUserContext } from "../../../context/app";
import { useChatRooms } from "../../../hooks/useChatRooms";
import Header from "../../../components/Header";
import LoadingPanel from "../../../components/LoadingPanel";
import UserForm, { type UserWithExtraData } from "../../profile/UserForm";
import OrderData from "../../orderHistory/OrderData";
import type { Order } from "../../../interface/order";
import CustomerService from "../../../components/CustomerService/CustomerService";
import { useCreateRoom } from "../../../hooks/useCreateRoom";

function AdminViewUser() {
  const { t } = useTranslation("admin");
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: orders,
    isLoading: isOrdersLoading,
    isError: isOrdersError,
    error: ordersError,
  } = useQuery<Order[]>({
    queryKey: ["orders", { userId }],
    queryFn: async () => {
      const res = await api.get(`/admin/orders/?userId=${userId}`);
      return res.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { chatRooms } = useChatRooms(user!);
  const { createRoom } = useCreateRoom(user?._id || "");

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

  if (isLoading) {
    return (
      <>
        <Header />
        <LoadingPanel />
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
          <div className="text-5xl text">User Not found</div>
        </div>
      </>
    );
  }

  const canCreateRoom = () => {
    if (userContext._id === user._id) return false; // user itself
    // console.log("chatRooms:", chatRooms);
    // console.log("userContext._id:", userContext._id);
    const created = chatRooms?.some((room) => {
      return room.joinedUsers.some((id) => {
        //console.log(id === userContext._id);
        return id === userContext._id;
      }); // is admin joined a room with this user
    });
    //console.log("Created:", created);
    if (created) return false;
    return true;
  };

  //console.log("Final Answer:", canCreateRoom());

  return (
    <div className="animate-fade-in min-h-screen">
      <title>PROFILE | PREMIUM BEN TOYS</title>
      <Header />
      <CustomerService />
      <h1 className="font-oswald font-bold text-center text-5xl my-10 mx-auto">
        {t("labels.userData")}
      </h1>
      {canCreateRoom() && (
        <button
          className="absolute top-20 right-10 border p-2 rounded-xl cursor-pointer"
          onClick={async () => {
            await createRoom();
          }}
        >
          {t("buttons.startConversation")}
        </button>
      )}
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
          <h1 className="font-oswald text-5xl my-15 self-center">
            {t("messages.noOrderFound", { ns: "shoppingCart" })}
          </h1>
        )}
      </div>
    </div>
  );
}

export default AdminViewUser;
