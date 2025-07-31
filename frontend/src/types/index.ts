export interface Product {
  _id: string;
  product_name: string;
  price: number;
  rating: number;
  image: string;
}

export interface ProductUser {
  _id: string;
  product_name: string;
  price: number;
  rating: number;
  image: string;
}

export interface Address {
  _id: string;
  house_name: string;
  street_name: string;
  city_name: string;
  pin_code: string;
}

export interface Payment {
  Digital: boolean;
  COD: boolean;
}

export interface Order {
  _id: string;
  order_list: ProductUser[];
  ordered_at: string;
  total_price: number;
  discount?: number;
  payment_method: Payment;
}

export interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  token?: string;
  refresh_token?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  usercart: ProductUser[];
  address: Address[];
  order_status: Order[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
}

export interface AuthResponse {
  InsertedID?: string;
  message?: string;
  token?: string;
  refresh_token?: string;
}

export interface CartResponse {
  user_cart: ProductUser[];
  total_price: number;
}

export interface ApiError {
  Error?: string;
  error?: string;
  message?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface CartItem extends ProductUser {
  quantity?: number;
}