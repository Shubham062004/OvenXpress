import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Something went wrong with the request';
    console.error('API error:', message, error?.response || '');
    return Promise.reject(error);
  }
);

// Auth header helper
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Customer Auth API
export const authAPI = {
  login: (body) => api.post('/auth/login', body),
  register: (body) => api.post('/auth/register', body),
  signup: (body) => api.post('/auth/register', body), // backwards-compatible alias
  me: () => api.get('/auth/me'),
  updateProfile: (body) => api.put('/auth/profile', body),
  forgotPassword: (body) => api.post('/auth/forgot-password', body),
  resetPassword: (body) => api.post('/auth/reset-password', body),
};

// Customer User & Addresses API
export const userAPI = {
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (body) => api.post('/users/addresses', body),
  updateAddress: (id, body) => api.put(`/users/addresses/${id}`, body),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
};

// Customer Branch Discovery API
export const branchAPI = {
  getBranches: (params = {}) => api.get('/branches', { params }),
  getBranchById: (id) => api.get(`/branches/${id}`),
  getCities: () => api.get('/branches/cities'),
};

// Customer Menu API
export const menuAPI = {
  getAllItems: (params = {}) => api.get('/menu', { params }),
  getCategories: () => api.get('/menu/categories'),
  getItemById: (id) => api.get(`/menu/${id}`),
};

// Customer Coupon API
export const couponAPI = {
  validate: (body) => api.post('/coupons/validate', body),
  listActive: () => api.get('/coupons?active=true'),
  getActive: () => api.get('/coupons?active=true'), // compatibility alias
};

// Customer Order API
export const orderAPI = {
  createOrder: (body) => api.post('/orders', body),
  myOrders: () => api.get('/orders/my-orders'),
  getMyOrders: () => api.get('/orders/my-orders'), // compatibility alias
  getOrderById: (id) => api.get(`/orders/${id}`),
};

export default api;
