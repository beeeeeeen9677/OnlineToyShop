import { useQuery } from "@tanstack/react-query";
import type { Good } from "../interface/good";
import type { AxiosError } from "axios";
import api from "../services/api";

export const useAllGoods = () => {
  const {
    data: allGoods = [],
    isLoading,
    isError,
    error,
  } = useQuery<Good[], AxiosError>({
    queryKey: ["allGoods"],
    queryFn: async () => {
      const response = await api.get("/goods/");
      return response.data.filter((good: Good) => good.available);
    },
  });

  return { allGoods, isLoading, isError, error };
};
