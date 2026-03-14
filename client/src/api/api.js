import axios from "axios";

function resolveApiBaseUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (typeof window === "undefined") {
    return "http://localhost:5000/api";
  }

  return window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "/api";
}

const api = axios.create({
  baseURL: resolveApiBaseUrl()
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cloudfore_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
