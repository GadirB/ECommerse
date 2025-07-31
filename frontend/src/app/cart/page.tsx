'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatPrice, calculateCartTotal } from '@/utils';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

const CartPage: React.FC = () => {
  const router = useRouter();
  const { items: cart, isLoading, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemoveItem(productId);
      return;
    }
    
    // For now, we'll just show a message that quantity updates aren't supported
    toast.error('Quantity updates not supported. Please remove and re-add items.');
  };

  const handleClearCart = async () => {
    setIsClearing(true);
    try {
      await clearCart();
      toast.success('Cart cleared successfully');
    } catch (error) {
      console.error('Failed to clear cart:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleCheckout = () => {
    if (!cart || cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    router.push('/checkout');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const cartItems = cart || [];
  const isEmpty = cartItems.length === 0;
  const total = calculateCartTotal(cartItems);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {isEmpty ? 'Your cart is empty' : `${cartItems.length} item${cartItems.length > 1 ? 's' : ''} in your cart`}
          </p>
        </div>

        {isEmpty ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link href="/products">
              <Button size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item._id} className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.product_name || 'Product'}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          <Link 
                            href={`/products/${item._id}`}
                            className="hover:text-primary-600 transition-colors"
                          >
                            {item.product_name || 'Unnamed Product'}
                          </Link>
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item._id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <p className="text-2xl font-bold text-gray-900 mb-4">
                        {formatPrice(item.price || 0)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                            className="px-3 py-2 hover:bg-gray-50"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="px-4 py-2 font-medium text-gray-900">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                            className="px-3 py-2 hover:bg-gray-50"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Subtotal</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatPrice((item.product.price || 0) * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Clear Cart Button */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={handleClearCart}
                  isLoading={isClearing}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Order Summary
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>{formatPrice(total * 0.1)}</span>
                  </div>
                  
                  <hr className="border-gray-200" />
                  
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(total * 1.1)}</span>
                  </div>
                </div>
                
                <Button
                  size="lg"
                  onClick={handleCheckout}
                  className="w-full mb-4"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <Link href="/products">
                  <Button variant="outline" size="lg" className="w-full">
                    Continue Shopping
                  </Button>
                </Link>
                
                {/* Security Notice */}
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    🔒 Your payment information is secure and encrypted
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;