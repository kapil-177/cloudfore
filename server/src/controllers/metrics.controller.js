import asyncHandler from "../utils/asyncHandler.js";
import { captureMetricSample, getMetricHistory } from "../services/metrics.service.js";

function serializeHistory(metrics) {
  return metrics.map((metric) => ({
    id: metric._id,
    cpuUsage: metric.cpuUsage,
    memoryUsage: metric.memoryUsage,
    loadAverage: metric.loadAverage,
    createdAt: metric.createdAt
  }));
}

export const getLiveMetrics = asyncHandler(async (req, res) => {
  const projectId = req.query.projectId || null;
  const { snapshot } = await captureMetricSample(projectId);

  res.json({
    success: true,
    data: {
      cpuUsage: snapshot.cpuUsage,
      memory: snapshot.memory,
      load: snapshot.load
    }
  });
});

export const getMetricsHistory = asyncHandler(async (req, res) => {
  const projectId = req.query.projectId || null;
  const limit = Number(req.query.limit) || 40;
  const history = await getMetricHistory(projectId, limit);

  res.json({
    success: true,
    count: history.length,
    data: serializeHistory(history)
  });
});

export const getCpuUsage = asyncHandler(async (req, res) => {
  const { snapshot } = await captureMetricSample();
  res.json({ usage: snapshot.cpuUsage });
});

export const getMemoryUsage = asyncHandler(async (req, res) => {
  const { snapshot } = await captureMetricSample();
  res.json(snapshot.memory);
});

export const getSystemLoad = asyncHandler(async (req, res) => {
  const { snapshot } = await captureMetricSample();
  res.json(snapshot.load);
});
