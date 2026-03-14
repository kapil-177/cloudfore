import Metric from "../models/metric.model.js";
import Project from "../models/project.model.js";
import { getSystemSnapshot } from "../utils/systemMetrics.js";

export async function captureMetricSample(projectId = null) {
  const snapshot = getSystemSnapshot();

  const metric = await Metric.create({
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

  return {
    metric,
    snapshot
  };
}

export async function getMetricHistory(projectId = null, limit = 40) {
  const query = projectId ? { project: projectId } : {};
  return Metric.find(query).sort({ createdAt: -1 }).limit(limit).lean();
}
