import { useTranslation } from "../../../i18n/hooks";
import { useState, useTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../services/api";
import type { AxiosError } from "axios";
import type { Good } from "../../../interface/good";
import Header from "../../../components/Header";
import { Link } from "react-router";
import { useUserContext } from "../../../context/app";
import LoadingPanel from "../../../components/LoadingPanel";
import CustomerService from "../../../components/CustomerService/CustomerService";

function AdminProductList() {
  const { t } = useTranslation("admin");
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

  const [isPending, startTransition] = useTransition();
  const [searchFilter, setSearchFilter] = useState("");

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

  const filteredGoods = goods.filter((good) =>
    good.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    startTransition(() => {
      setSearchFilter(event.target.value);
    });
  };

  return (
    <div className="animate-fade-in min-h-screen">
      <title>ADMIN PRODUCTS | PREMIUM BEN TOYS</title>
      <Header />
      <CustomerService />
      <div className="flex items-center justify-between px-6 pt-3">
        <Link to="/admin/">
          <div className=" underline text-2xl  ">&lt;Back</div>
        </Link>
        <div className="w-2/3 max-w-4xl flex flex-col">
          <input
            type="text"
            value={searchFilter}
            onChange={handleSearchChange}
            placeholder={t("placeholders.searchGoodName")}
            className="w-full px-2 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
          />
          <p className="text-right text-xs mt-2">
            {filteredGoods.length} of {goods.length}
          </p>
        </div>
      </div>

      {/* Container for goods list */}
      <div className="flex gap-5 p-5 flex-wrap">
        {isPending ? (
          <div className="w-full flex justify-center  text-3xl">
            {t("labels.filtering")}
          </div>
        ) : (
          filteredGoods.map((good) => (
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
          ))
        )}
      </div>
    </div>
  );
}

export default AdminProductList;
