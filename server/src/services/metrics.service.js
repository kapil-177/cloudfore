import Metric from "../models/metric.model.js";
import Project from "../models/project.model.js";
import { getSystemSnapshot } from "../utils/systemMetrics.js";

const fallbackSamples = [];
const MAX_FALLBACK_SAMPLES = 120;

function storeFallbackSample(projectId, snapshot) {
  fallbackSamples.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    project: projectId,
    cpuUsage: snapshot.cpuUsage,
    memoryUsage: snapshot.memory.usage,
    loadAverage: snapshot.load,
    createdAt: new Date()
  });

  if (fallbackSamples.length > MAX_FALLBACK_SAMPLES) {
    fallbackSamples.splice(0, fallbackSamples.length - MAX_FALLBACK_SAMPLES);
  }
}

function getFallbackHistory(projectId = null, limit = 40) {
  return fallbackSamples
    .filter((entry) => (projectId ? entry.project === projectId : !entry.project))
    .slice(-limit)
    .reverse();
}

export async function captureMetricSample(projectId = null) {
  const snapshot = getSystemSnapshot();
  storeFallbackSample(projectId, snapshot);

  let metric = null;

  try {
    metric = await Metric.create({
      project: projectId,
      cpuUsage: snapshot.cpuUsage,
      memoryUsage: snapshot.memory.usage,
      loadAverage: snapshot.load,
      source: projectId ? "project" : "system"
    });

    if (projectId) {
      await Project.findByIdAndUpdate(projectId, {
        currentUsage: {
          cpuUsage: snapshot.cpuUsage,
          memoryUsage: snapshot.memory.usage,
          storageUsage: Math.round(snapshot.memory.usage * 0.75)
        }
      });
    }
  } catch (error) {
    console.error("Metric persistence failed, serving live snapshot only:", error.message);
  }

  return {
    metric,
    snapshot
  };
}

export async function getMetricHistory(projectId = null, limit = 40) {
  const query = projectId ? { project: projectId } : {};

  try {
    return await Metric.find(query).sort({ createdAt: -1 }).limit(limit).lean();
  } catch (error) {
    console.error("Metric history fallback in use:", error.message);
    return getFallbackHistory(projectId, limit);
  }
}
