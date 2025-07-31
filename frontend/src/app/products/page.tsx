'use client';

import React, { useEffect, useState } from 'react';
import { Filter, SortAsc, SortDesc } from 'lucide-react';
import { Product } from '@/types';
import { productsAPI } from '@/services/api';
import ProductGrid from '@/components/product/ProductGrid';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { getErrorMessage, debounce } from '@/utils';
import toast from 'react-hot-toast';

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'rating-desc';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await productsAPI.getAllProducts();
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        toast.error(`Failed to load products: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.product_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply price range filter
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(product => {
        const price = product.price || 0;
        const min = priceRange.min ? parseFloat(priceRange.min) : 0;
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return (a.product_name || '').localeCompare(b.product_name || '');
        case 'name-desc':
          return (b.product_name || '').localeCompare(a.product_name || '');
        case 'price-asc':
          return (a.price || 0) - (b.price || 0);
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        case 'rating-desc':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchQuery, sortBy, priceRange]);

  const handleSearchChange = debounce((value: string) => {
    setSearchQuery(value);
  }, 300);

  const clearFilters = () => {
    setSearchQuery('');
    setPriceRange({ min: '', max: '' });
    setSortBy('name-asc');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            All Products
          </h1>
          <p className="text-gray-600">
            Discover our complete collection of amazing products
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search products..."
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Sort */}
            <div className="w-full lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="rating-desc">Rating (High to Low)</option>
              </select>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          <div className={`mt-6 pt-6 border-t border-gray-200 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-full"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          
          {searchQuery && (
            <p className="text-sm text-gray-500">
              Search results for: <span className="font-medium">"{searchQuery}"</span>
            </p>
          )}
        </div>

        {/* Products Grid */}
        <ProductGrid
          products={filteredProducts}
          isLoading={isLoading}
          emptyMessage={searchQuery ? `No products found for "${searchQuery}"` : 'No products available'}
        />
      </div>
    </div>
  );
};

export default ProductsPage;