import axios from 'axios';
import offlineCache from './offlineCache';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    console.log(`📡 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor (with offline fallback)
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    if (response.config.method === 'get' && response.status === 200) {
      offlineCache.saveToCache('menu', response.data).catch(console.error);
    }
    return response;
  },
  async (error) => {
    console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status || 'Network Error'}`);

    // Offline fallback for GET
    if (error.config?.method === 'get' && !navigator.onLine) {
      const cached = await offlineCache.getFromCache('menu');
      if (cached) {
        console.log('📦 Using cached data for:', error.config.url);
        return { data: cached };
      }
    }

    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// 🔐 Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// 🍽️ Menu API
export const menuAPI = {
  getAllItems: (params = {}) => api.get('/menu', { params }),
  getCategories: () => api.get('/menu/categories'),
  getItemById: (id) => api.get(`/menu/${id}`),
  createItem: (itemData) => api.post('/menu', itemData),
  updateItem: (id, itemData) => api.put(`/menu/${id}`, itemData),
  deleteItem: (id) => api.delete(`/menu/${id}`),
};

// 🧾 Order API
export const orderAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getMyOrders: () => api.get('/orders/my-orders'),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  getBranchOrders: (branchId, params = {}) => api.get(`/orders/branch/${branchId}`, { params }),
  getKitchenOrders: () => api.get('/orders/kitchen'),
};

// 👤 User API
export const userAPI = {
  updateProfile: (userData) => api.put('/users/profile', userData),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (addressData) => api.post('/users/addresses', addressData),
  updateAddress: (id, addressData) => api.put(`/users/addresses/${id}`, addressData),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
};

// 🎟️ Coupon API
export const couponAPI = {
  getActive: () => api.get('/coupons?active=true'),
  validate: (data) => api.post('/coupons/validate', data),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  getStats: () => api.get('/coupons/stats'),
};

// 📊 Analytics API
export const analyticsAPI = {
  getDashboard: (range = 'daily') => api.get('/analytics/dashboard', { params: { range } }),
  getBranches: (range = 'daily') => api.get('/analytics/branches', { params: { range } }),
  getMenu: () => api.get('/analytics/menu'),
  getStaff: () => api.get('/analytics/staff'),
  getCustomers: () => api.get('/analytics/customers'),
};

export default api;
