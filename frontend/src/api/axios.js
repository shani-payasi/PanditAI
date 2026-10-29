import axios from "axios";

// If VITE_BACKEND_URL is set (e.g. in production), use it; otherwise fallback to relative /api for local dev proxy
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const baseURL = backendUrl ? `${backendUrl.replace(/\/$/, "")}/api` : "/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("chat_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
