import axios from 'axios';
import type { CustomerDetails } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to dynamically inject the JWT bearer token into headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to clear credentials if token expires or is rejected
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
    }
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export const customerService = {
  getCustomers: async () => {
    const response = await api.get('/customers');
    return response.data;
  },
  searchCustomers: async (query: string) => {
    const response = await api.get(`/customers/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },
  createCustomer: async (customerData: CustomerDetails) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },
  updateCustomer: async (id: string, customerData: Partial<CustomerDetails>) => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  },
  deleteCustomer: async (id: string) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },
};

export const productService = {
  getProducts: async () => {
    const response = await api.get('/products');
    return response.data;
  },
  searchProducts: async (query: string) => {
    const response = await api.get(`/products/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },
  createProduct: async (productData: any) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  updateProduct: async (id: string, productData: any) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export const invoiceService = {
  getInvoices: async () => {
    const response = await api.get('/bills');
    return response.data;
  },
  searchInvoices: async (query: string) => {
    const response = await api.get(`/bills/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },
  createInvoice: async (invoiceData: any) => {
    const response = await api.post('/bills', invoiceData);
    return response.data;
  },
  updateInvoice: async (id: string, invoiceData: any) => {
    const response = await api.put(`/bills/${id}`, invoiceData);
    return response.data;
  },
  deleteInvoice: async (id: string) => {
    const response = await api.delete(`/bills/${id}`);
    return response.data;
  },
};

export const inventoryService = {
  getInventory: async () => {
    const response = await api.get('/inventory');
    return response.data;
  },
  createInventory: async (inventoryData: any) => {
    const response = await api.post('/inventory', inventoryData);
    return response.data;
  },
  updateInventory: async (id: string, inventoryData: any) => {
    const response = await api.put(`/inventory/${id}`, inventoryData);
    return response.data;
  },
  deleteInventory: async (id: string) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
  },
};

export const paymentService = {
  getPayments: async () => {
    const response = await api.get('/payments');
    return response.data;
  },
  createPayment: async (paymentData: any) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },
  updatePayment: async (id: string, paymentData: any) => {
    const response = await api.put(`/payments/${id}`, paymentData);
    return response.data;
  },
  deletePayment: async (id: string) => {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  },
};

export const employeeService = {
  getEmployees: async (query?: string) => {
    const url = query ? `/employees?query=${encodeURIComponent(query)}` : '/employees';
    const response = await api.get(url);
    return response.data;
  },
  getEmployeeById: async (id: string) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },
  createEmployee: async (employeeData: any) => {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },
  updateEmployee: async (id: string, employeeData: any) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },
  deleteEmployee: async (id: string) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },
};

export default api;
