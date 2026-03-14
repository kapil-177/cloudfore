export function movingAverage(values, sampleSize = 5) {
  if (!values.length) {
    return null;
  }

  const window = values.slice(-sampleSize);
  const total = window.reduce((sum, value) => sum + value, 0);
  return Math.round(total / window.length);
}

export function simpleTrend(values, fallback = null) {
  if (values.length < 2) {
    return fallback;
  }

  const recent = values.slice(-5);
  const deltas = [];

  for (let index = 1; index < recent.length; index += 1) {
    deltas.push(recent[index] - recent[index - 1]);
  }

  const avgDelta = deltas.reduce((sum, value) => sum + value, 0) / deltas.length;
  return Math.round(recent[recent.length - 1] + avgDelta);
}

export function clampPercentage(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}
