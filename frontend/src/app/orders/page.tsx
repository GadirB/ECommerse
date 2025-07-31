'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Calendar, CreditCard, MapPin, Eye } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Order } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatPrice, formatDate } from '@/utils';
import Image from 'next/image';
import Link from 'next/link';

// Mock order data since we don't have an orders API
const mockOrders: Order[] = [
  {
    _id: '1',
    order_list: [
      {
        _id: '1',
        product_name: 'Wireless Bluetooth Headphones',
        price: 79.99,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
        rating: 4.5
      },
      {
        _id: '2',
        product_name: 'Smart Watch Series 8',
        price: 299.99,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
        rating: 4.8
      }
    ],
    total_price: 379.98,
    ordered_at: '2024-01-15T10:30:00Z',
    payment_method: {
      Digital: true,
      COD: false
    }
  },
  {
    _id: '2',
    order_list: [
      {
        _id: '3',
        product_name: 'Laptop Stand Adjustable',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop',
        rating: 4.2
      }
    ],
    total_price: 99.98,
    ordered_at: '2024-01-20T14:15:00Z',
    payment_method: {
      Digital: false,
      COD: true
    }
  },
  {
    _id: '3',
    order_list: [
      {
        _id: '4',
        product_name: 'Wireless Mouse',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop',
        rating: 4.0
      }
    ],
    total_amount: 29.99,
    status: 'processing',
    created_at: '2024-01-22T09:45:00Z',
    shipping_address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip_code: '10001',
      country: 'United States'
    }
  }
];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'shipped':
      return 'bg-blue-100 text-blue-800';
    case 'processing':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return '✓';
    case 'shipped':
      return '🚚';
    case 'processing':
      return '⏳';
    case 'cancelled':
      return '✗';
    default:
      return '📦';
  }
};

const OrdersPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Simulate loading orders
    const loadOrders = async () => {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOrders(mockOrders);
      setIsLoading(false);
    };

    loadOrders();
  }, [isAuthenticated, router]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCloseOrderDetails = () => {
    setSelectedOrder(null);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">
            {orders.length === 0 ? 'No orders found' : `${orders.length} order${orders.length > 1 ? 's' : ''} found`}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No orders yet
            </h2>
            <p className="text-gray-600 mb-8">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Link href="/products">
              <Button size="lg">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order._id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-primary-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order._id}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(order.created_at)}
                        </span>
                        <span className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-1" />
                          {formatPrice(order.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOrder(order)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
                
                {/* Order Items Preview */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center space-x-4 overflow-x-auto">
                    {order.products.slice(0, 3).map((item, index) => (
                      <div key={`${order._id}-${item.product._id}-${index}`} className="flex items-center space-x-2 flex-shrink-0">
                        <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          {item.product.image ? (
                            <Image
                              src={item.product.image}
                              alt={item.product.product_name || 'Product'}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                            {item.product.product_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.products.length > 3 && (
                      <div className="text-sm text-gray-500 flex-shrink-0">
                        +{order.products.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order Details #{selectedOrder._id}
                  </h2>
                  <Button
                    variant="ghost"
                    onClick={handleCloseOrderDetails}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </Button>
                </div>
                
                {/* Order Status */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)} {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Items Ordered</h3>
                  <div className="space-y-4">
                    {selectedOrder.products.map((item, index) => (
                      <div key={`${selectedOrder._id}-${item.product._id}-${index}`} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product.image ? (
                            <Image
                              src={item.product.image}
                              alt={item.product.product_name || 'Product'}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900">
                            {item.product.product_name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatPrice((item.product.price || 0) * item.quantity)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatPrice(item.product.price || 0)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Shipping Address */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Shipping Address
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">
                      {selectedOrder.shipping_address.street}
                    </p>
                    <p className="text-gray-900">
                      {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip_code}
                    </p>
                    <p className="text-gray-900">
                      {selectedOrder.shipping_address.country}
                    </p>
                  </div>
                </div>
                
                {/* Order Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatPrice(selectedOrder.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;