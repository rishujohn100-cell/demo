import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { CartItem, InsertCartItem, WishlistItem, InsertWishlistItem } from "@shared/schema";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./use-auth";

type CartContextType = {
  cartItems: CartItem[];
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  addToCartMutation: UseMutationResult<CartItem, Error, InsertCartItem>;
  updateCartMutation: UseMutationResult<CartItem, Error, { id: string; updates: Partial<InsertCartItem> }>;
  removeFromCartMutation: UseMutationResult<void, Error, string>;
  addToWishlistMutation: UseMutationResult<WishlistItem, Error, InsertWishlistItem>;
  removeFromWishlistMutation: UseMutationResult<void, Error, string>;
  cartTotal: number;
  cartCount: number;
  wishlistCount: number;
};

export const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    data: cartItems = [],
    isLoading: cartLoading,
  } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
    enabled: !!user,
  });

  const {
    data: wishlistItems = [],
    isLoading: wishlistLoading,
  } = useQuery<WishlistItem[]>({
    queryKey: ["/api/wishlist"],
    enabled: !!user,
  });

  const addToCartMutation = useMutation({
    mutationFn: async (cartItem: InsertCartItem) => {
      const res = await apiRequest("POST", "/api/cart", cartItem);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add to cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCartMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InsertCartItem> }) => {
      const res = await apiRequest("PUT", `/api/cart/${id}`, updates);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/cart/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove from cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (wishlistItem: InsertWishlistItem) => {
      const res = await apiRequest("POST", "/api/wishlist", wishlistItem);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Added to wishlist",
        description: "Item has been added to your wishlist",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add to wishlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      await apiRequest("DELETE", `/api/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove from wishlist",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.customPrice ? parseFloat(item.customPrice) : 25.99;
    return sum + (price * item.quantity);
  }, 0);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlistItems,
        isLoading: cartLoading || wishlistLoading,
        addToCartMutation,
        updateCartMutation,
        removeFromCartMutation,
        addToWishlistMutation,
        removeFromWishlistMutation,
        cartTotal,
        cartCount,
        wishlistCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
