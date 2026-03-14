import api from "./api";

export const loginApi = (data) => api.post("/auth/login", data);
export const registerApi = (data) => api.post("/auth/register", data);
export const getCurrentUserApi = () => api.get("/auth/me");
export const updateSettingsApi = (data) => api.put("/auth/settings", data);
