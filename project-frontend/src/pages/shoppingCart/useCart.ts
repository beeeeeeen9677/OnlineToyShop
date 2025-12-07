import { useCallback } from "react";
import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useLoginContext, useUserContext } from "../../context/app";
import api from "../../services/api";
import type { CartItem, CartResponse } from "../../interface/cart";
import type { Good } from "../../interface/good";
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

/** Cart item with full product details (Good properties spread) */
export type CartItemWithDetails =
  | (CartItem & Good & { isLoaded: true })
  | (CartItem & { isLoaded: false });

interface UseCartReturn {
  /** Cart items (unified for both logged-in and guest) */
  items: CartItem[];
  /** Cart items with full product details (for summary/display) */
  itemsWithDetails: CartItemWithDetails[];
  /** Whether product details are still loading */
  isLoadingDetails: boolean;
  /** Total price of all items in cart */
  cartTotalAmount: number;
  isLoading: boolean;
  error: string | null;
  totalItems: number;
  cartQueryKey: readonly [string, string | undefined];
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
  const cartQueryKey = ["cart", user?._id] as const;

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

  // ===== FETCH PRODUCT DETAILS FOR ALL CART ITEMS =====
  const goodQueries = useQueries({
    queries: items.map((item) => ({
      queryKey: ["good", { id: item.goodId }],
      queryFn: async () => {
        const res = await api.get(`/goods/${item.goodId}`);
        return res.data as Good;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
      enabled: items.length > 0,
    })),
  });

  // Combine cart items with their product details (spread Good properties)
  const itemsWithDetails: CartItemWithDetails[] = items.map((item, index) => {
    const good = goodQueries[index]?.data;
    if (good) {
      return { ...item, ...good, isLoaded: true as const };
    }
    return { ...item, isLoaded: false as const };
  });

  const isLoadingDetails = goodQueries.some((q) => q.isLoading);

  // Calculate cart total (only from items with loaded prices)
  const cartTotalAmount = itemsWithDetails.reduce((sum, item) => {
    if (item.isLoaded) {
      return sum + item.price * item.quantity;
    }
    return sum;
  }, 0);

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
    itemsWithDetails,
    isLoadingDetails,
    cartTotalAmount,
    isLoading,
    error,
    totalItems,
    cartQueryKey,
    addItem,
    updateQuantity,
    removeItem,
    clearCart: clearCartAction,
    syncCart,
    refetch,
  };
};
