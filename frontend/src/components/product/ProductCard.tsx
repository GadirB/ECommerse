'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, Eye } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatPrice, getStarRatingData } from '@/utils';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  showQuickView?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  showQuickView = true 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    setIsLoading(true);
    try {
      await addToCart(product._id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement quick view modal
    toast.info('Quick view coming soon!');
  };

  return (
    <Card hover className="group relative overflow-hidden">
      <Link href={`/products/${product._id}`}>
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.product_name || 'Product'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}
          
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2">
              {showQuickView && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleQuickView}
                  className="bg-white hover:bg-gray-100"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddToCart}
                isLoading={isLoading}
                disabled={!isAuthenticated}
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
            {product.product_name || 'Unnamed Product'}
          </h3>
          
          {/* Rating */}
          {product.rating && (
            <div className="flex items-center mb-2">
              <div className="flex text-yellow-400 text-sm">
                {(() => {
                  const { fullStars, hasHalfStar, emptyStars } = getStarRatingData(product.rating);
                  
                  return (
                    <>
                      {Array.from({ length: fullStars }, (_, i) => (
                        <span key={`${product._id}-full-${i}`}>★</span>
                      ))}
                      {hasHalfStar && (
                        <span key={`${product._id}-half`}>☆</span>
                      )}
                      {Array.from({ length: emptyStars }, (_, i) => (
                        <span key={`${product._id}-empty-${i}`}>☆</span>
                      ))}
                    </>
                  );
                })()}
              </div>
              <span className="ml-1 text-sm text-gray-500">
                ({product.rating})
              </span>
            </div>
          )}
          
          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price || 0)}
            </span>
            
            {/* Mobile Add to Cart */}
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddToCart}
              isLoading={isLoading}
              disabled={!isAuthenticated}
              className="md:hidden"
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default ProductCard;