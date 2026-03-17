import { useState } from "react";

import { getForecastApi } from "../api/forecastApi";
import AppShell from "../components/AppShell";
import Loader, { EmptyState, ErrorState } from "../components/Loader";
import usePolling from "../hooks/usePolling";

function getRiskBadge(riskLevel) {
  const normalized = String(riskLevel || "").toLowerCase();

  if (normalized === "high") {
    return "danger";
  }

  if (normalized === "medium") {
    return "warning";
  }

  return "success";
}

export default function ForecastPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [forecastData, setForecastData] = useState(null);

  async function loadForecast() {
    try {
      const response = await getForecastApi();
      setForecastData(response.data.data || null);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Forecast data could not be generated");
    } finally {
      setLoading(false);
    }
  }

  usePolling(loadForecast, 5000);

  const history = forecastData?.history || [];
  const recommendations = forecastData?.recommendations || [];

  return (
    <AppShell
      title="Forecast console"
      subtitle="Translate raw system metrics into predictive signals, confidence levels, and practical recommendations."
      actions={
        <button type="button" className="secondary-button" onClick={loadForecast}>
          Refresh forecast
        </button>
      }
    >
      {loading ? (
        <Loader label="Generating forecast..." />
      ) : error && !forecastData ? (
        <ErrorState
          title="Forecast unavailable"
          message={error}
          action={
            <button type="button" className="primary-button" onClick={loadForecast}>
              Retry
            </button>
          }
        />
      ) : (
        <div className="stack">
          <section className="forecast-grid">
            <article className="metric-card">
              <span className="metric-label">CPU forecast</span>
              <strong className="metric-value">
                {typeof forecastData?.cpuForecast === "number"
                  ? `${forecastData.cpuForecast}%`
                  : "--"}
              </strong>
              <p className="muted-text">Predicted next CPU utilization based on recent trend movement.</p>
            </article>

            <article className="metric-card">
              <span className="metric-label">Memory forecast</span>
              <strong className="metric-value">
                {typeof forecastData?.memoryForecast === "number"
                  ? `${forecastData.memoryForecast}%`
                  : "--"}
              </strong>
              <p className="muted-text">Projected memory demand from recent samples.</p>
            </article>

            <article className="metric-card">
              <span className="metric-label">Confidence</span>
              <strong className="metric-value">
                {typeof forecastData?.confidence === "number"
                  ? `${forecastData.confidence}%`
                  : "--"}
              </strong>
              <p className="muted-text">Confidence rises as the app collects more observations.</p>
            </article>

            <article className="metric-card">
              <span className="metric-label">Risk level</span>
              <strong className="metric-value">{forecastData?.riskLevel || "--"}</strong>
              <span className={`badge ${getRiskBadge(forecastData?.riskLevel)}`}>
                {forecastData?.riskLevel || "Unknown"}
              </span>
            </article>
          </section>

          <section className="content-grid">
            <div className="panel">
              <div className="section-header">
                <div>
                  <h2>Prediction timeline</h2>
                  <p className="page-subtitle" style={{ margin: "6px 0 0" }}>
                    Solid line shows historical CPU samples, and the final marker shows the next prediction.
                  </p>
                </div>
              </div>

              {history.length ? (
                <div className="graph-wrap">
                  <ForecastGraph
                    data={history.map((entry) => entry.cpuUsage)}
                    forecast={forecastData?.cpuForecast ?? null}
                  />
                </div>
              ) : (
                <EmptyState
                  title="Forecast needs more samples"
                  message="Open the metrics page or create services so the backend can collect more data points."
                />
              )}
            </div>

            <div className="panel">
              <div className="section-header">
                <div>
                  <h2>Scaling recommendations</h2>
                  <p className="page-subtitle" style={{ margin: "6px 0 0" }}>
                    Generated advice based on forecasted CPU and memory pressure.
                  </p>
                </div>
              </div>

              {recommendations.length ? (
                <div className="recommendation-list">
                  {recommendations.map((item) => (
                    <article key={item._id || item.title} className="service-card">
                      <div>
                        <strong>{item.title}</strong>
                        <p className="muted-text" style={{ marginTop: 6 }}>
                          {item.description || item.message}
                        </p>
                      </div>
                      <span className={`badge ${getRiskBadge(item.priority || item.severity)}`}>
                        {item.priority || item.severity || "info"}
                      </span>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="empty-inline">
                  Recommendations will appear once the system has enough metrics to score risk.
                </p>
              )}
            </div>
          </section>

          {error ? (
            <section className="panel" style={{ background: "var(--warning-soft)" }}>
              <strong style={{ display: "block", marginBottom: 8 }}>Recoverable issue</strong>
              <p className="muted-text" style={{ margin: 0 }}>
                {error}. The page remains usable with the most recent forecast response.
              </p>
            </section>
          ) : null}
        </div>
      )}
    </AppShell>
  );
}

function ForecastGraph({ data, forecast }) {
  const width = 900;
  const height = 260;
  const padding = 24;
  const allPoints = forecast !== null ? [...data, forecast] : data;
  const points = allPoints.map((value, index) => ({
    x: padding + (index / Math.max(allPoints.length - 1, 1)) * (width - padding * 2),
    y: height - padding - (value / 100) * (height - padding * 2)
  }));
  const realPoints = points
    .slice(0, data.length)
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
  const forecastPoint = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", display: "block" }}>
      {[0.25, 0.5, 0.75].map((fraction) => (
        <line
          key={fraction}
          x1={padding}
          y1={padding + fraction * (height - padding * 2)}
          x2={width - padding}
          y2={padding + fraction * (height - padding * 2)}
          stroke="var(--border-strong)"
        />
      ))}
      <polyline
        fill="none"
        stroke="var(--primary)"
        strokeWidth="3"
        points={realPoints}
      />
      {forecast !== null && data.length ? (
        <>
          <line
            x1={points[data.length - 1].x}
            y1={points[data.length - 1].y}
            x2={forecastPoint.x}
            y2={forecastPoint.y}
            stroke="var(--secondary)"
            strokeDasharray="6 6"
            strokeWidth="2"
          />
          <circle cx={forecastPoint.x} cy={forecastPoint.y} r="5" fill="var(--secondary)" />
        </>
      ) : null}
      <line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        stroke="var(--border-strong)"
      />
    </svg>
  );
}
