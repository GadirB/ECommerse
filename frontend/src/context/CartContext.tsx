'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ProductUser, CartResponse, CartItem } from '@/types';
import { cartAPI } from '@/services/api';
import { useAuth } from './AuthContext';
import { getErrorMessage, calculateCartTotal } from '@/utils';
import toast from 'react-hot-toast';

interface CartContextType {
  items: CartItem[];
  totalPrice: number;
  itemCount: number;
  isLoading: boolean;
  addToCart: (productId: string) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<boolean>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
  checkout: () => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const itemCount = items.length;

  // Fetch cart data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.user_id) {
      refreshCart();
    } else {
      setItems([]);
      setTotalPrice(0);
    }
  }, [isAuthenticated, user?.user_id]);

  const refreshCart = async () => {
    if (!user?.user_id) return;
    
    try {
      setIsLoading(true);
      const response = await cartAPI.getCart(user.user_id);
      setItems(response.user_cart || []);
      setTotalPrice(response.total_price || 0);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Failed to fetch cart:', errorMessage);
      // Don't show toast for cart fetch errors as it might be annoying
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: string): Promise<boolean> => {
    if (!user?.user_id) {
      toast.error('Please login to add items to cart');
      return false;
    }

    try {
      setIsLoading(true);
      await cartAPI.addToCart(user.user_id, productId);
      await refreshCart();
      toast.success('Item added to cart!');
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string): Promise<boolean> => {
    if (!user?.user_id) {
      toast.error('Please login to manage cart');
      return false;
    }

    try {
      setIsLoading(true);
      await cartAPI.removeFromCart(user.user_id, productId);
      await refreshCart();
      toast.success('Item removed from cart!');
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = () => {
    setItems([]);
    setTotalPrice(0);
  };

  const checkout = async (): Promise<boolean> => {
    if (!user?.user_id) {
      toast.error('Please login to checkout');
      return false;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return false;
    }

    try {
      setIsLoading(true);
      await cartAPI.checkout(user.user_id);
      clearCart();
      toast.success('Order placed successfully!');
      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value: CartContextType = {
    items,
    totalPrice,
    itemCount,
    isLoading,
    addToCart,
    removeFromCart,
    clearCart,
    refreshCart,
    checkout,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}