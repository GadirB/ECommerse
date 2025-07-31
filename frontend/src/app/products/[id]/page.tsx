'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, ShoppingCart, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { Product } from '@/types';
import { productsAPI, cartAPI } from '@/services/api';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatPrice, getErrorMessage } from '@/utils';
import toast from 'react-hot-toast';

const ProductDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        // Since we don't have a single product endpoint, we'll get all products and find the one we need
        const products = await productsAPI.getAllProducts();
        const foundProduct = products.find(p => p._id === productId);
        
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          toast.error('Product not found');
          router.push('/products');
        }
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(`Failed to load product: ${errorMessage}`);
        router.push('/products');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, router]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      router.push('/login');
      return;
    }

    if (!product) return;

    setIsAddingToCart(true);
    try {
      await addToCart(product._id);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to make a purchase');
      router.push('/login');
      return;
    }

    if (!product || !user?.user_id) return;

    setIsBuyingNow(true);
    try {
      await cartAPI.instantBuy(user.user_id, product._id);
      toast.success('Order placed successfully!');
      router.push('/orders');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setIsBuyingNow(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Button onClick={() => router.push('/products')}>Back to Products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <Card padding="none" className="overflow-hidden">
              <div className="relative aspect-square bg-gray-100">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.product_name || 'Product'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-lg">No Image Available</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.product_name || 'Unnamed Product'}
              </h1>
              
              {/* Rating */}
              {product.rating && (
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400 text-lg">
                    {generateStarRating(product.rating)}
                  </div>
                  <span className="ml-2 text-gray-600">
                    ({product.rating} out of 5)
                  </span>
                </div>
              )}
              
              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {formatPrice(product.price || 0)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={handleAddToCart}
                  isLoading={isAddingToCart}
                  disabled={!isAuthenticated}
                  className="flex-1"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleBuyNow}
                  isLoading={isBuyingNow}
                  disabled={!isAuthenticated}
                  className="flex-1"
                >
                  Buy Now
                </Button>
              </div>
              
              {!isAuthenticated && (
                <p className="text-sm text-gray-500 text-center">
                  Please <button onClick={() => router.push('/login')} className="text-primary-600 hover:underline">login</button> to purchase this product
                </p>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="text-center">
                <Truck className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Free Shipping</p>
                <p className="text-xs text-gray-500">On orders over $50</p>
              </Card>
              
              <Card className="text-center">
                <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                <p className="text-xs text-gray-500">100% protected</p>
              </Card>
              
              <Card className="text-center">
                <RotateCcw className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Easy Returns</p>
                <p className="text-xs text-gray-500">30-day policy</p>
              </Card>
            </div>

            {/* Product Information */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Product Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Product ID:</span>
                  <span className="font-medium">{product._id}</span>
                </div>
                {product.rating && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating:</span>
                    <span className="font-medium">{product.rating}/5</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Availability:</span>
                  <span className="font-medium text-green-600">In Stock</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;