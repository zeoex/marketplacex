import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — refresh token on 401
axiosInstance.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = Cookies.get('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(`${BASE_URL}/api/v1/auth/refresh`, { refreshToken });
        const { accessToken } = res.data.data;
        Cookies.set('access_token', accessToken, { expires: 1 / 96, secure: true });
        original.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(original);
      } catch {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  },
);

// ─── API Methods ─────────────────────────────────────────────

export const api = {
  // Auth
  auth: {
    register: (data: any) => axiosInstance.post('/auth/register', data),
    login: (data: any) => axiosInstance.post('/auth/login', data),
    logout: (refreshToken: string) => axiosInstance.post('/auth/logout', { refreshToken }),
    refresh: (refreshToken: string) => axiosInstance.post('/auth/refresh', { refreshToken }),
    me: () => axiosInstance.get('/auth/me'),
    forgotPassword: (email: string) => axiosInstance.post('/auth/forgot-password', { email }),
    resetPassword: (data: any) => axiosInstance.post('/auth/reset-password', data),
    verifyEmail: (userId: string, code: string) => axiosInstance.post('/auth/verify-email', { userId, code }),
    sendOtp: (userId: string, phone: string) => axiosInstance.post(`/auth/send-otp/${userId}`, { phone }),
    verifyPhone: (userId: string, code: string) => axiosInstance.post('/auth/verify-phone', { userId, code }),
  },

  // Users
  users: {
    getProfile: (username: string) => axiosInstance.get(`/users/${username}`),
    updateProfile: (data: any) => axiosInstance.patch('/users/me', data),
    uploadAvatar: (file: File) => {
      const fd = new FormData();
      fd.append('avatar', file);
      return axiosInstance.post('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    follow: (userId: string) => axiosInstance.post(`/users/${userId}/follow`),
    unfollow: (userId: string) => axiosInstance.delete(`/users/${userId}/follow`),
    getFollowers: (userId: string) => axiosInstance.get(`/users/${userId}/followers`),
    getFollowing: (userId: string) => axiosInstance.get(`/users/${userId}/following`),
  },

  // Products
  products: {
    getAll: (params?: any) => axiosInstance.get('/products', { params }),
    getOne: (slug: string) => axiosInstance.get(`/products/${slug}`),
    create: (data: FormData) =>
      axiosInstance.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    update: (id: string, data: any) => axiosInstance.patch(`/products/${id}`, data),
    delete: (id: string) => axiosInstance.delete(`/products/${id}`),
    getFeatured: () => axiosInstance.get('/products/featured'),
    getRelated: (id: string) => axiosInstance.get(`/products/${id}/related`),
    myProducts: (params?: any) => axiosInstance.get('/products/my', { params }),
  },

  // Categories
  categories: {
    getAll: () => axiosInstance.get('/categories'),
    getOne: (slug: string) => axiosInstance.get(`/categories/${slug}`),
  },

  // Orders
  orders: {
    getAll: (params?: any) => axiosInstance.get('/orders', { params }),
    getOne: (id: string) => axiosInstance.get(`/orders/${id}`),
    getSales: (params?: any) => axiosInstance.get('/orders/sales', { params }),
  },

  // Payments
  payments: {
    createStripeCheckout: (data: any) => axiosInstance.post('/payments/stripe/checkout', data),
    createPayPalOrder: (data: any) => axiosInstance.post('/payments/paypal/create', data),
    createMercadoPago: (data: any) => axiosInstance.post('/payments/mercadopago/create', data),
    getHistory: () => axiosInstance.get('/payments/history'),
  },

  // Messages
  messages: {
    sendRequest: (data: { sellerId: string; productId: string; requestMessage?: string }) =>
      axiosInstance.post('/messages/request', data),
    acceptRequest: (conversationId: string) =>
      axiosInstance.patch(`/messages/conversations/${conversationId}/accept`),
    rejectRequest: (conversationId: string) =>
      axiosInstance.patch(`/messages/conversations/${conversationId}/reject`),
    getConversations: () => axiosInstance.get('/messages/conversations'),
    getConversation: (id: string) => axiosInstance.get(`/messages/conversations/${id}`),
    getMessages: (id: string) => axiosInstance.get(`/messages/conversations/${id}/messages`),
    send: (conversationId: string, data: any) =>
      axiosInstance.post(`/messages/conversations/${conversationId}/messages`, data),
  },

  // Notifications
  notifications: {
    getAll: (params?: any) => axiosInstance.get('/notifications', { params }),
    markRead: (id: string) => axiosInstance.patch(`/notifications/${id}/read`),
    markAllRead: () => axiosInstance.patch('/notifications/read-all'),
    getUnreadCount: () => axiosInstance.get('/notifications/unread-count'),
  },

  // Reviews
  reviews: {
    create: (data: any) => axiosInstance.post('/reviews', data),
    getForUser: (userId: string) => axiosInstance.get(`/reviews/user/${userId}`),
    getForProduct: (productId: string) => axiosInstance.get(`/reviews/product/${productId}`),
  },

  // Favorites
  favorites: {
    getAll: () => axiosInstance.get('/favorites'),
    toggle: (productId: string) => axiosInstance.post(`/favorites/${productId}/toggle`),
    check: (productId: string) => axiosInstance.get(`/favorites/${productId}/check`),
  },

  // Reports
  reports: {
    create: (data: any) => axiosInstance.post('/reports', data),
  },

  // Search
  search: {
    query: (params: any) => axiosInstance.get('/search', { params }),
    autocomplete: (q: string) => axiosInstance.get('/search/autocomplete', { params: { q } }),
  },

  // Admin
  admin: {
    dashboard: () => axiosInstance.get('/admin/dashboard'),
    users: (params?: any) => axiosInstance.get('/admin/users', { params }),
    banUser: (id: string, reason: string) => axiosInstance.post(`/admin/users/${id}/ban`, { reason }),
    products: (params?: any) => axiosInstance.get('/admin/products', { params }),
    reports: (params?: any) => axiosInstance.get('/admin/reports', { params }),
    resolveReport: (id: string, resolution: string) =>
      axiosInstance.post(`/admin/reports/${id}/resolve`, { resolution }),
    categories: {
      create: (data: any) => axiosInstance.post('/admin/categories', data),
      update: (id: string, data: any) => axiosInstance.patch(`/admin/categories/${id}`, data),
      delete: (id: string) => axiosInstance.delete(`/admin/categories/${id}`),
    },
  },
};
