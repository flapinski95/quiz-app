import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_GATEWAY_API_URL || "http://localhost:3001",
  withCredentials: false, 
});

export default api;