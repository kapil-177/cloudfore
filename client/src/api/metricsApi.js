import api from "./api";

export const getLiveMetricsApi = (projectId) =>
  api.get("/metrics/live", {
    params: projectId ? { projectId } : undefined
  });

export const getMetricsHistoryApi = (projectId, limit = 40) =>
  api.get("/metrics/history", {
    params: {
      limit,
      ...(projectId ? { projectId } : {})
    }
  });
