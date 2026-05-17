import axios from 'axios';

// Direct URL to your InfinityFree backend
const API_BASE_URL = 'https://vaccine-system.infinityfreeapp.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor: rewrite URL to use ?route= parameter
api.interceptors.request.use(
  (config) => {
    // Original URL like '/auth/login' -> remove leading slash
    let originalUrl = config.url;
    if (originalUrl.startsWith('/')) {
      originalUrl = originalUrl.substring(1);
    }
    // Build the correct backend URL: /index.php?route=auth/login
    config.url = `/index.php?route=${originalUrl}`;
    
    // Add token if exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (keep as is)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    if (response && response.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    if (response && response.status === 403) {
      console.error('Access denied:', response.data?.message);
    }
    if (response && response.status >= 500) {
      console.error('Server error:', response.data?.message);
    }
    return Promise.reject(error);
  }
);

export default api;