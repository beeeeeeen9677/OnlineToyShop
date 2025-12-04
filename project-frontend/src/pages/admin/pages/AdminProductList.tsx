import Header from "../../../components/Header";
//import { useEffect, useEffectEvent, useState } from "react";
import type { Good } from "../../../interface/good";
import api from "../../../services/api";
import type { AxiosError } from "axios";
import { Link } from "react-router";
import { useUserContext } from "../../../context/app";
import { useQuery } from "@tanstack/react-query";
import LoadingPanel from "../../../components/LoadingPanel";

function AdminProductList() {
  const user = useUserContext();
  /*
  const [goods, setGoods] = useState<Array<Good>>([]);
  const fetchDataEvent = useEffectEvent(async () => {
    try {
      const response = await api.get("/goods/");
      // sort by added date
      const sortedGoods = [...response.data].sort((a, b) => {
        const aValue = a["createdAt"];
        const bValue = b["createdAt"];

        const aDate = new Date(aValue as string);
        const bDate = new Date(bValue as string);
        return bDate.getTime() - aDate.getTime(); // Newest first
      });

      setGoods(sortedGoods); // Backend now returns array directly
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      console.error(
        "Error fetching goods data:",
        axiosError.response?.data?.error
      );
    }
  });
  useEffect(() => {
    fetchDataEvent();
  }, []);
 */
  const {
    data: goods = [],
    isLoading,
    isError,
    error,
  } = useQuery<Good[], AxiosError>({
    queryKey: ["goods"],
    queryFn: async () => {
      const response = await api.get("/goods/");
      // sort by added date
      const sortedGoods = [...response.data].sort((a, b) => {
        const aValue = a["createdAt"];
        const bValue = b["createdAt"];

        const aDate = new Date(aValue as string);
        const bDate = new Date(bValue as string);
        return bDate.getTime() - aDate.getTime(); // Newest first
      });
      return sortedGoods; // Backend now returns array directly
    },
  });

  if (user === undefined || user.role !== "admin") {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-100">
          <div className="text-5xl text">Restricted Access</div>
        </div>
      </>
    );
  }

  if (isError)
    return (
      <p>
        Error: {(error as AxiosError<{ error: string }>)?.response?.data?.error}
      </p>
    );
  if (isLoading) return <LoadingPanel />;

  return (
    <div className="animate-fade-in min-h-screen">
      <title>ADMIN PRODUCTS | PREMIUM BEN TOYS</title>
      <Header />
      <Link to="/admin/">
        <div className="mx-6 mt-3 underline text-2xl"> &lt;Back</div>
      </Link>
      {/* Container for goods list */}
      <div className="flex gap-5 p-5 flex-wrap">
        {goods.map((good) => (
          // Content
          <Link
            key={good._id}
            to={`/admin/edit-product/${good._id}`}
            className="min-w-60 max-w-75 h-90 flex-1 bg-gray-100 dark:bg-gray-500 flex flex-col rounded-lg shadow-md shadow-yellow-500/50 cursor-pointer overflow-hidden"
          >
            <img
              src={good.imageUrl}
              alt={good.name}
              className="w-full h-3/5 object-cover object-top bg-white"
            />
            <div className="p-1 flex flex-col justify-between flex-1">
              <div> {good.name}</div>
              <div> ID: {good._id} </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default AdminProductList;
