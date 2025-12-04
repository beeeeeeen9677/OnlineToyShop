import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import api from "../services/api";
import type { Good } from "../interface/good";
import type { AxiosError } from "axios";

interface UseGoodOptions {
  /** Whether to track view count (only for ItemDetails page) */
  trackView?: boolean;
}

interface UseGoodReturn {
  good: Good | undefined;
  isLoading: boolean;
  isError: boolean;
  error: AxiosError<{ error: string }> | null;
}

/**
 * Hook to fetch a single good by ID
 * Reuses cache across components (same query key pattern)
 */
export const useGood = (
  goodId: string | undefined,
  options: UseGoodOptions = {}
): UseGoodReturn => {
  const { trackView = false } = options;

  // Always use GET for fetching - consistent query
  const {
    data: good,
    isLoading,
    isError,
    error,
  } = useQuery<Good, AxiosError<{ error: string }>>({
    queryKey: ["good", { id: goodId }],
    queryFn: async () => {
      const res = await api.get(`/goods/${goodId}`);
      return res.data;
    },
    enabled: !!goodId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Track view count separately (fire-and-forget)
  // Server handles session-based deduplication
  useEffect(() => {
    if (trackView && goodId) {
      api.put(`/goods/${goodId}/view`).catch((err) => {
        console.error("Failed to track view:", err);
      });
    }
  }, [trackView, goodId]);

  return {
    good,
    isLoading,
    isError,
    error: error || null,
  };
};
