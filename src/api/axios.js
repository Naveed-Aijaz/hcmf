import axios from 'axios';

// VITE_API_URL must include the /api suffix, e.g. https://my-backend.vercel.app/api
const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  console.error('VITE_API_URL is not set for this build; API calls will go to', baseURL);
}

const API = axios.create({
  baseURL,
  withCredentials: true, // httpOnly auth cookie
  headers: { 'Content-Type': 'application/json' },
});

// Expired/invalid session on a protected call -> force back to login (not for the auth calls themselves).
API.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url || '';
    const isAuthCall = url.startsWith('/auth/');
    if (error.response?.status === 401 && !isAuthCall && window.location.pathname !== '/login') {
      window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

export const errorMessage = (error, fallback = 'Something went wrong') =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  (error?.code === 'ERR_NETWORK' ? 'Cannot reach the server. Check your connection and API URL/CORS settings.' : fallback);

export default API;
