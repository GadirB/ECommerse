'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Star } from 'lucide-react';
import { ProductUser } from '@/types';
import { useCart } from '@/context/CartContext';
import Button from '@/components/ui/Button';
import { formatPrice, generateStarRating } from '@/utils';

interface CartItemProps {
  item: ProductUser;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const { removeFromCart } = useCart();

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeFromCart(item._id);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <Link href={`/products/${item._id}`}>
          <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.product_name || 'Product'}
                fill
                className="object-cover hover:scale-105 transition-transform duration-200"
                sizes="80px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400 text-xs">No Image</span>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <Link href={`/products/${item._id}`}>
          <h3 className="text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">
            {item.product_name || 'Unnamed Product'}
          </h3>
        </Link>
        
        {/* Rating */}
        {item.rating && (
          <div className="flex items-center mt-1">
            <div className="flex text-yellow-400 text-xs">
              {generateStarRating(item.rating)}
            </div>
            <span className="ml-1 text-xs text-gray-500">
              ({item.rating})
            </span>
          </div>
        )}
        
        {/* Price */}
        <div className="mt-2">
          <span className="text-lg font-semibold text-gray-900">
            {formatPrice(item.price || 0)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          isLoading={isRemoving}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default CartItem;