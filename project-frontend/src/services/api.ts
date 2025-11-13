import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { auth } from "../firebase/firebase";

// Create Axios instance
const api: AxiosInstance = axios.create({
  baseURL: "/api", // your API base URL
});

// Add request interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await auth.currentUser?.getIdToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
