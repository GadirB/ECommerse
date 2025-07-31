'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, MapPin, User, Lock, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { addressAPI } from '@/services/api';
import { Address, Payment } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatPrice, calculateCartTotal, isValidEmail, getErrorMessage } from '@/utils';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface CheckoutForm {
  // Address fields
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  
  // Payment fields
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  
  // Contact
  email: string;
  phone: string;
}

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const { items: cart, isLoading: cartLoading, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  const [form, setForm] = useState<CheckoutForm>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: user?.email || '',
    phone: ''
  });
  
  const [errors, setErrors] = useState<Partial<CheckoutForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [useNewAddress, setUseNewAddress] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (!cart || cart.length === 0) {
      toast.error('Your cart is empty');
      router.push('/cart');
      return;
    }
    
    // Load user addresses
    loadAddresses();
  }, [isAuthenticated, cart, router]);

  const loadAddresses = async () => {
    // Since getUserAddresses API doesn't exist, we'll skip loading saved addresses
    // Users will need to enter address manually
    setUseNewAddress(true);
  };

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutForm> = {};
    
    // Email validation
    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(form.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    // Phone validation
    if (!form.phone) {
      newErrors.phone = 'Phone number is required';
    }
    
    // Address validation (only if using new address)
    if (useNewAddress) {
      if (!form.street) newErrors.street = 'Street address is required';
      if (!form.city) newErrors.city = 'City is required';
      if (!form.state) newErrors.state = 'State is required';
      if (!form.zipCode) newErrors.zipCode = 'ZIP code is required';
      if (!form.country) newErrors.country = 'Country is required';
    }
    
    // Payment validation
    if (!form.cardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (form.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    
    if (!form.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(form.expiryDate)) {
      newErrors.expiryDate = 'Please enter date in MM/YY format';
    }
    
    if (!form.cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (form.cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }
    
    if (!form.cardholderName) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user?.user_id || !cart) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let addressId = selectedAddressId;
      
      // Create new address if needed
      if (useNewAddress) {
        const newAddress: Omit<Address, '_id'> = {
          house_name: form.street,
          street_name: form.street,
          city_name: form.city,
          pin_code: form.zipCode
        };
        
        const createdAddress = await addressAPI.addAddress(user.user_id, newAddress);
        addressId = createdAddress._id;
      }
      
      // Create payment method
      // Process checkout (simulate payment processing)
      // Since we don't have a payment API, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
      
      // Clear cart after successful checkout
      await clearCart();
      
      toast.success('Order placed successfully!');
      router.push('/orders');
      
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(`Checkout failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  if (!isAuthenticated || cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const cartItems = cart || [];
  const subtotal = calculateCartTotal(cartItems);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contact Information */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Contact Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Email Address"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={errors.email}
                    required
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    error={errors.phone}
                    required
                  />
                </div>
              </Card>

              {/* Shipping Address */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Shipping Address
                </h2>
                
                {addresses.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={!useNewAddress}
                          onChange={() => setUseNewAddress(false)}
                          className="mr-2"
                        />
                        Use saved address
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={useNewAddress}
                          onChange={() => setUseNewAddress(true)}
                          className="mr-2"
                        />
                        Use new address
                      </label>
                    </div>
                    
                    {!useNewAddress && (
                      <select
                        value={selectedAddressId}
                        onChange={(e) => setSelectedAddressId(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        {addresses.map((address) => (
                          <option key={address._id} value={address._id}>
                            {address.house_name}, {address.street_name}, {address.city_name} {address.pin_code}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
                
                {useNewAddress && (
                  <div className="space-y-4">
                    <Input
                      label="Street Address"
                      value={form.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      error={errors.street}
                      required
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="City"
                        value={form.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        error={errors.city}
                        required
                      />
                      <Input
                        label="State"
                        value={form.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        error={errors.state}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="ZIP Code"
                        value={form.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        error={errors.zipCode}
                        required
                      />
                      <Input
                        label="Country"
                        value={form.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        error={errors.country}
                        required
                      />
                    </div>
                  </div>
                )}
              </Card>

              {/* Payment Information */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Information
                </h2>
                
                <div className="space-y-4">
                  <Input
                    label="Card Number"
                    value={form.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                    error={errors.cardNumber}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                  />
                  
                  <Input
                    label="Cardholder Name"
                    value={form.cardholderName}
                    onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                    error={errors.cardholderName}
                    required
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiry Date"
                      value={form.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                      error={errors.expiryDate}
                      placeholder="MM/YY"
                      maxLength={5}
                      required
                    />
                    <Input
                      label="CVV"
                      value={form.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                      error={errors.cvv}
                      placeholder="123"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center">
                  <Lock className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600">
                    Your payment information is secure and encrypted
                  </span>
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Order Summary
                </h2>
                
                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex items-center space-x-3">
                      <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.product_name || 'Product'}
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
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice((item.price || 0) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                
                <hr className="border-gray-200 mb-4" />
                
                {/* Totals */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  size="lg"
                  isLoading={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Processing...' : `Place Order • ${formatPrice(total)}`}
                </Button>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;