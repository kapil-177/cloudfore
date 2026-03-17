import axios from "axios";

function resolveApiBaseUrl() {
  if (typeof window === "undefined") {
    return "http://localhost:5000/api";
  }

  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const pointsToLocalApi =
    configuredUrl &&
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?/i.test(configuredUrl);

  if (configuredUrl && (!pointsToLocalApi || isLocalHost)) {
    return configuredUrl;
  }

  return isLocalHost ? "http://localhost:5000/api" : "/api";
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
