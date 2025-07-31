import axios, { AxiosResponse } from 'axios';
import { 
  Product, 
  User, 
  LoginRequest, 
  SignupRequest, 
  AuthResponse, 
  CartResponse,
  Address
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.token = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/users/signup', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/users/login', data);
    return response.data;
  },
};

// Products API
export const productsAPI = {
  getAllProducts: async (): Promise<Product[]> => {
    const response: AxiosResponse<Product[]> = await api.get('/users/productview');
    return response.data;
  },

  searchProducts: async (query: string): Promise<Product[]> => {
    const response: AxiosResponse<Product[]> = await api.get(`/users/search?name=${encodeURIComponent(query)}`);
    return response.data;
  },
};

// Cart API
export const cartAPI = {
  getCart: async (userId: string): Promise<CartResponse> => {
    const response: AxiosResponse<CartResponse> = await api.get(`/listcart?id=${userId}`);
    return response.data;
  },

  addToCart: async (userId: string, productId: string): Promise<any> => {
    const response = await api.get(`/addtocart?id=${userId}&pid=${productId}`);
    return response.data;
  },

  removeFromCart: async (userId: string, productId: string): Promise<any> => {
    const response = await api.get(`/removeitem?id=${userId}&pid=${productId}`);
    return response.data;
  },

  checkout: async (userId: string): Promise<any> => {
    const response = await api.get(`/cartcheckout?id=${userId}`);
    return response.data;
  },

  instantBuy: async (userId: string, productId: string): Promise<any> => {
    const response = await api.get(`/instantbuy?id=${productId}&userID=${userId}`);
    return response.data;
  },
};

// Address API
export const addressAPI = {
  addAddress: async (userId: string, address: Omit<Address, '_id'>): Promise<any> => {
    const response = await api.post(`/addaddress?id=${userId}`, address);
    return response.data;
  },

  editHomeAddress: async (userId: string, address: Omit<Address, '_id'>): Promise<any> => {
    const response = await api.put(`/edithomeaddress?id=${userId}`, address);
    return response.data;
  },

  editWorkAddress: async (userId: string, address: Omit<Address, '_id'>): Promise<any> => {
    const response = await api.put(`/editworkaddress?id=${userId}`, address);
    return response.data;
  },

  deleteAddress: async (userId: string): Promise<any> => {
    const response = await api.get(`/deleteaddresses?id=${userId}`);
    return response.data;
  },
};

export default api;