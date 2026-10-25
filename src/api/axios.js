 import axios from 'axios';

// Local development ke liye default 'http://localhost:5000/api' use hoga
const BASE_URL = import.meta.env.VITE_API_URL 
  || (import.meta.env.MODE === 'development' 
      ? 'http://localhost:5000/api' 
      : 'https://hcm-wine.vercel.app/api');

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;