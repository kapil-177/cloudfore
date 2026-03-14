import Forecast from "../models/forecast.model.js";
import Recommendation from "../models/recommendation.model.js";
import Metric from "../models/metric.model.js";
import Project from "../models/project.model.js";
import { buildRecommendations } from "./recommendation.service.js";
import { clampPercentage, movingAverage, simpleTrend } from "../utils/forecast.js";

function confidenceFromSamples(sampleCount) {
  return Math.min(95, 50 + sampleCount * 5);
}

function riskLevelFromForecast(cpuForecast, memoryForecast) {
  const peak = Math.max(cpuForecast || 0, memoryForecast || 0);

  if (peak >= 85) {
    return "High";
  }

  if (peak >= 65) {
    return "Medium";
  }

  return "Low";
}

export async function generateForecast(projectId = null) {
  const query = projectId ? { project: projectId } : {};
  const metrics = await Metric.find(query).sort({ createdAt: -1 }).limit(20).lean();
  const orderedMetrics = [...metrics].reverse();

  const cpuValues = orderedMetrics.map((entry) => entry.cpuUsage);
  const memoryValues = orderedMetrics.map((entry) => entry.memoryUsage);

  const cpuForecast = clampPercentage(simpleTrend(cpuValues, movingAverage(cpuValues)));
  const memoryForecast = clampPercentage(
    simpleTrend(memoryValues, movingAverage(memoryValues))
  );
  const confidence = confidenceFromSamples(orderedMetrics.length);
  const riskLevel = riskLevelFromForecast(cpuForecast, memoryForecast);

  const forecast = await Forecast.create({
    project: projectId,
    cpuForecast: cpuForecast ?? 0,
    memoryForecast: memoryForecast ?? 0,
    confidence
  });

  const recommendationPayload = buildRecommendations({
    cpuForecast: cpuForecast ?? 0,
    memoryForecast: memoryForecast ?? 0
  });

  await Recommendation.deleteMany({ project: projectId });
  await Recommendation.insertMany(
    recommendationPayload.map((item) => ({
      ...item,
      project: projectId
    }))
  );

  if (projectId) {
    await Project.findByIdAndUpdate(projectId, {
      forecastSummary: {
        cpuForecast: cpuForecast ?? 0,
        memoryForecast: memoryForecast ?? 0,
        confidence,
        riskLevel
      }
    });
  }

  return {
    forecast,
    summary: {
      cpuForecast: cpuForecast ?? 0,
      memoryForecast: memoryForecast ?? 0,
      confidence,
      riskLevel
    },
    recommendations: recommendationPayload
  };
}
