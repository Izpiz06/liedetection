import axios from 'axios';
import useStore from '../store/useStore';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rs_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getReviews: (id, params) => api.get(`/products/${id}/reviews`, { params }),
};

// Reviews API
export const reviewsAPI = {
  create: (data) => api.post('/reviews/create', data),
  getById: (id) => api.get(`/reviews/${id}`),
  report: (id, data) => api.post(`/reviews/${id}/report`, data),
  vote: (id, data) => api.post(`/reviews/${id}/vote`, data),
};

// Analytics API
export const analyticsAPI = {
  overview: () => api.get('/analytics/overview'),
  products: () => api.get('/analytics/products'),
  reviewers: () => api.get('/analytics/reviewers'),
  suspicious: () => api.get('/analytics/suspicious'),
  sentimentTrend: () => api.get('/analytics/sentiment-trend'),
  classificationDist: () => api.get('/analytics/classification-distribution'),
  trustDist: () => api.get('/analytics/trust-distribution'),
};

// Admin API
export const adminAPI = {
  getQueue: () => api.get('/admin/moderation'),
  approve: (id) => api.post(`/admin/review/${id}/approve`),
  reject: (id) => api.post(`/admin/review/${id}/reject`),
};

export default api;
