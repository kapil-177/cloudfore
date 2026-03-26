import Recommendation from "../models/recommendation.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateForecast } from "../services/forecast.service.js";
import { getMetricHistory } from "../services/metrics.service.js";

export const getForecastOverview = asyncHandler(async (req, res) => {
  const projectId = req.query.projectId || null;
  const { summary } = await generateForecast(projectId);
  const history = await getMetricHistory(projectId, 20);
  const recommendations = await Recommendation.find({ project: projectId }).lean();

  res.json({
    success: true,
    data: {
      ...summary,
      history: history.reverse().map((entry) => ({
        cpuUsage: entry.cpuUsage,
        memoryUsage: entry.memoryUsage,
        createdAt: entry.createdAt
      })),
      recommendations: recommendations.map((item) => ({
        id: item._id,
        title: item.title,
        description: item.description || item.message || "",
        priority: item.priority || item.severity || "low"
      }))
    }
  });
});
