
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://hcm-wine.vercel.app/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default API;
