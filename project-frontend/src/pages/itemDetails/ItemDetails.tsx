import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import api from "../../services/api";
import type { AxiosError } from "axios";
import type { Good } from "../../interface/good";

function ItemDetails() {
  const { id } = useParams();

  const {
    data: item,
    isLoading,
    isError,
    error,
  } = useQuery<Good, AxiosError<{ error: string }>>({
    queryKey: ["good", { id }],
    queryFn: async () => {
      const res = await api.get(`/goods/${id}`);
      return res.data;
    },
    refetchOnWindowFocus: false,
  });

  if (isError) {
    return (
      <div>Error loading item details: {error?.response?.data?.error}</div>
    );
  }

  return <div>Item Details Page - Item ID: {id}</div>;
}

export default ItemDetails;
