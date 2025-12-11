import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
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

// APIs

export const authAPI = {
  login: (body) => api.post('/auth/login', body),
  signup: (body) => api.post('/auth/signup', body),
  me: () => api.get('/auth/me'),
};

export const userAPI = {
  getAddresses: () => api.get('/users/addresses'),
};

export const menuAPI = {
  getAllItems: (params = {}) => api.get('/menu', { params }),
  getCategories: () => api.get('/menu/categories'),
};

export const couponAPI = {
  validate: (body) => api.post('/coupons/validate', body),
  listActive: () => api.get('/coupons?active=true'),
};

export const orderAPI = {
  createOrder: (body) => api.post('/orders', body),
  myOrders: () => api.get('/orders/my'),
};

export default api;
