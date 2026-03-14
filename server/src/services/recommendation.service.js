export function buildRecommendations({ cpuForecast, memoryForecast }) {
  const recommendations = [];

  if (cpuForecast >= 80) {
    recommendations.push({
      title: "High CPU forecast",
      message: "Consider scaling compute resources or distributing workloads.",
      severity: "high"
    });
  }

  if (memoryForecast >= 75) {
    recommendations.push({
      title: "Memory pressure expected",
      message: "Review caching strategy or increase memory allocation.",
      severity: "medium"
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      title: "Healthy forecast",
      message: "Current resource trends are stable for the near term.",
      severity: "low"
    });
  }

  return recommendations;
}
