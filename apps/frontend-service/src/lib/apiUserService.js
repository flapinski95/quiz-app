import axios from 'axios';

const apiUser = axios.create({
  baseURL: process.env.NEXT_PUBLIC_USER_API_URL || 'http://localhost:3002',
  withCredentials: false,
});

export default apiUser;
