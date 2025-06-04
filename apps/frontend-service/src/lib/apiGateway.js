import axios from "axios";

const apiGateway = axios.create({
  baseURL: process.env.NEXT_PUBLIC_GATEWAY_API_URL || "http://localhost:3001",
  withCredentials: true,
});

export default apiGateway;