import Header from "../../components/Header";
import { useEffect, useEffectEvent, useState } from "react";
import type { Good } from "../../interface/good";
import api from "../../services/api";
import type { AxiosError } from "axios";
import { Link } from "react-router";

function AdminEdit() {
  const [goods, setGoods] = useState<Array<Good>>([]);
  const fetchDataEvent = useEffectEvent(async () => {
    try {
      const response = await api.get("/goods/");
      setGoods(response.data); // Backend now returns array directly
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

  return (
    <div className="animate-fade-in min-h-screen">
      <title>Admin Edit</title>
      <Header />
      {/* Container for goods list */}
      <div className="flex gap-5 p-5 flex-wrap">
        {goods.map((good) => (
          // Content
          <Link
            key={good._id}
            to={`/admin/edit-product/${good._id}`}
            className="min-w-60 max-w-75 h-80 flex-1 bg-gray-300 dark:bg-gray-500 flex flex-col rounded-lg shadow-md shadow-yellow-500/50 cursor-pointer"
          >
            <img
              src={good.imageUrl}
              alt={good.name}
              className="w-full h-40 object-cover bg-white"
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

export default AdminEdit;
