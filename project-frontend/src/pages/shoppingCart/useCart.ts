import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLoginContext, useUserContext } from "../../context/app";
import api from "../../services/api";
import type { CartItem, CartResponse } from "../../interface/cart";
import {
  getLocalCart,
  addToLocalCart,
  updateLocalCartItem,
  removeFromLocalCart,
  clearLocalCart,
  CartLimitError,
} from "./localCartStorage";

// Re-export for consumers
export { CartLimitError };

// Query key for local cart (shared across all useCart instances)
const LOCAL_CART_QUERY_KEY = ["cart", "local"];

interface UseCartReturn {
  /** Cart items (unified for both logged-in and guest) */
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  totalItems: number;
  addItem: (goodId: string, quantity: number) => Promise<void>;
  updateQuantity: (goodId: string, quantity: number) => Promise<void>;
  removeItem: (goodId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  syncCart: () => Promise<void>;
  refetch: () => void;
}

export const useCart = (): UseCartReturn => {
  const isLoggedIn = useLoginContext();
  const user = useUserContext();
  const queryClient = useQueryClient();

  // Query key includes userId to separate cache per user
  const cartQueryKey = ["cart", user?._id];

  // Local cart state for guest users
  // const [localItems, setLocalItems] = useState<CartItem[]>(() =>
  //   isLoggedIn ? [] : getLocalCart());
  // ===== LOCAL CART STATE (React Query for shared state) =====
  const { data: localItems = [] } = useQuery<CartItem[]>({
    queryKey: LOCAL_CART_QUERY_KEY,
    queryFn: () => getLocalCart(),
    enabled: !isLoggedIn,
    staleTime: Infinity, // Never refetch automatically, we control updates
  });

  // Helper to update local cart in React Query cache
  const setLocalItems = useCallback(
    (items: CartItem[]) => {
      queryClient.setQueryData<CartItem[]>(LOCAL_CART_QUERY_KEY, items);
    },
    [queryClient]
  );

  // ===== SERVER STATE (React Query) =====

  // Fetch cart from API (only when logged in)
  const {
    data: cartData,
    isLoading: isQueryLoading,
    error: queryError,
    refetch,
  } = useQuery<CartResponse>({
    queryKey: cartQueryKey,
    queryFn: async () => {
      const res = await api.get("/cart");
      return res.data;
    },
    enabled: isLoggedIn && !!user?._id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Add item mutation
  const addMutation = useMutation({
    mutationFn: async ({
      goodId,
      quantity,
    }: {
      goodId: string;
      quantity: number;
    }) => {
      const res = await api.post("/cart/items", { goodId, quantity });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<CartResponse>(cartQueryKey, data);
    },
  });

  // Update quantity mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      goodId,
      quantity,
    }: {
      goodId: string;
      quantity: number;
    }) => {
      const res = await api.put(`/cart/items/${goodId}`, { quantity });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<CartResponse>(cartQueryKey, data);
    },
  });

  // Remove item mutation
  const removeMutation = useMutation({
    mutationFn: async (goodId: string) => {
      const res = await api.delete(`/cart/items/${goodId}`);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<CartResponse>(cartQueryKey, data);
    },
  });

  // Clear cart mutation
  const clearMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete("/cart");
      return res.data;
    },
    onSuccess: () => {
      queryClient.setQueryData<CartResponse>(cartQueryKey, { items: [] });
    },
  });

  // Sync cart mutation
  const syncMutation = useMutation({
    mutationFn: async (localCart: CartItem[]) => {
      // Clear local storage immediately before API call
      // This ensures logout won't see stale data even if sync is slow
      clearLocalCart();
      queryClient.setQueryData<CartItem[]>(LOCAL_CART_QUERY_KEY, []);

      const res = await api.post("/cart/sync", { localCart });
      return res.data;
    },
    onSuccess: () => {
      // Invalidate server cart queries to refetch merged cart
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (error, localCart) => {
      // Restore local cart if sync failed
      console.error("Sync failed, restoring local cart:", error);
      localCart.forEach((item) => {
        addToLocalCart(item.goodId, item.quantity);
      });
      queryClient.setQueryData<CartItem[]>(LOCAL_CART_QUERY_KEY, localCart);
    },
  });

  // ===== DERIVED STATE =====

  // Unified items - same shape for both logged-in and guest
  const items: CartItem[] = isLoggedIn ? cartData?.items || [] : localItems;

  const isLoading =
    isQueryLoading ||
    addMutation.isPending ||
    updateMutation.isPending ||
    removeMutation.isPending ||
    clearMutation.isPending ||
    syncMutation.isPending;

  const error =
    queryError?.message ||
    addMutation.error?.message ||
    updateMutation.error?.message ||
    removeMutation.error?.message ||
    null;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // ===== ACTIONS =====

  const addItem = useCallback(
    async (goodId: string, quantity: number) => {
      if (isLoggedIn) {
        await addMutation.mutateAsync({ goodId, quantity });
      } else {
        const updatedCart = addToLocalCart(goodId, quantity);
        setLocalItems(updatedCart);
      }
    },
    [isLoggedIn, addMutation, setLocalItems]
  );

  const updateQuantity = useCallback(
    async (goodId: string, quantity: number) => {
      if (isLoggedIn) {
        await updateMutation.mutateAsync({ goodId, quantity });
      } else {
        const updatedCart = updateLocalCartItem(goodId, quantity);
        setLocalItems(updatedCart);
      }
    },
    [isLoggedIn, updateMutation, setLocalItems]
  );

  const removeItem = useCallback(
    async (goodId: string) => {
      if (isLoggedIn) {
        await removeMutation.mutateAsync(goodId);
      } else {
        const updatedCart = removeFromLocalCart(goodId);
        setLocalItems(updatedCart);
      }
    },
    [isLoggedIn, removeMutation, setLocalItems]
  );

  const clearCartAction = useCallback(async () => {
    if (isLoggedIn) {
      await clearMutation.mutateAsync();
    } else {
      clearLocalCart();
      setLocalItems([]);
    }
  }, [isLoggedIn, clearMutation, setLocalItems]);

  const syncCart = useCallback(async () => {
    // if (!isLoggedIn) return;
    // Login check should be done by caller (e.g., App.tsx useEffect)
    // because this hook may be called outside LoginContext.Provider
    const localCart = getLocalCart();
    if (localCart.length === 0) {
      refetch();
      return;
    }

    console.log("Syncing local cart to server...");
    await syncMutation.mutateAsync(localCart);
  }, [syncMutation, refetch]);

  return {
    items,
    isLoading,
    error,
    totalItems,
    addItem,
    updateQuantity,
    removeItem,
    clearCart: clearCartAction,
    syncCart,
    refetch,
  };
};
