'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Truck, Shield, Headphones } from 'lucide-react';
import { Product } from '@/types';
import { productsAPI } from '@/services/api';
import ProductGrid from '@/components/product/ProductGrid';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { getErrorMessage } from '@/utils';
import toast from 'react-hot-toast';

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const products = await productsAPI.getAllProducts();
        // Show first 8 products as featured
        setFeaturedProducts(products.slice(0, 8));
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(`Failed to load products: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to ECommerce
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Discover amazing products with great prices and fast delivery
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white hover:text-primary-600">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-lg text-gray-600">
              We provide the best shopping experience with these amazing features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Wide Selection
              </h3>
              <p className="text-gray-600 text-sm">
                Thousands of products across multiple categories
              </p>
            </Card>
            
            <Card className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Fast Delivery
              </h3>
              <p className="text-gray-600 text-sm">
                Quick and reliable shipping to your doorstep
              </p>
            </Card>
            
            <Card className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Secure Shopping
              </h3>
              <p className="text-gray-600 text-sm">
                Your data and payments are always protected
              </p>
            </Card>
            
            <Card className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                24/7 Support
              </h3>
              <p className="text-gray-600 text-sm">
                Get help whenever you need it from our team
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600">
              Check out our most popular and trending items
            </p>
          </div>
          
          <ProductGrid
            products={featuredProducts}
            isLoading={isLoading}
            emptyMessage="No featured products available"
          />
          
          {featuredProducts.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/products">
                <Button size="lg">
                  View All Products
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of satisfied customers and find your perfect products today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Create Account
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white hover:text-primary-600">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;