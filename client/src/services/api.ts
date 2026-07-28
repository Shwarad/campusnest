import axios from 'axios';

/**
 * Base URL resolution:
 *  - Local dev  → Vite proxy rewrites /api → http://localhost:5000/api
 *                 so baseURL = '/api' works fine.
 *  - Production → Set VITE_API_URL=https://your-backend.vercel.app in
 *                 Vercel frontend env vars.  If unset, falls back to '/api'
 *                 (same-origin, valid when frontend + backend share one domain).
 */
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('campusnest_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('campusnest_token');
      localStorage.removeItem('campusnest_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
