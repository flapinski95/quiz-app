import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3001',
  withCredentials: true,
});

export default api;
