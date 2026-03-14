import api from "./api";

export const getForecastApi = (projectId) =>
  api.get("/forecast", {
    params: projectId ? { projectId } : undefined
  });
