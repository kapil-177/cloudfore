import api from "./api";

export const getServicesApi = (params = {}) => api.get("/projects", { params });
export const getServiceStatsApi = () => api.get("/projects/stats/summary");
export const createServiceApi = (data) => api.post("/projects", data);
export const updateServiceApi = (id, data) => api.put(`/projects/${id}`, data);
export const deleteServiceApi = (id) => api.delete(`/projects/${id}`);
