import { useState } from "react";

import { getLiveMetricsApi, getMetricsHistoryApi } from "../api/metricsApi";
import AppShell from "../components/AppShell";
import Loader, { EmptyState, ErrorState } from "../components/Loader";
import usePolling from "../hooks/usePolling";

function getProgressTone(value) {
  if (value >= 80) {
    return "danger";
  }

  if (value >= 60) {
    return "warning";
  }

  return "";
}

export default function MetricsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [metrics, setMetrics] = useState({
    cpu: null,
    memory: null,
    load: null,
    history: []
  });

  async function loadMetrics() {
    try {
      const [liveResponse, historyResponse] = await Promise.all([
        getLiveMetricsApi(),
        getMetricsHistoryApi(null, 40)
      ]);

      const liveData = liveResponse.data.data || {};
      const historyItems = historyResponse.data.data || [];
      const history = historyItems
        .map((entry) => entry?.cpuUsage)
        .filter((value) => typeof value === "number")
        .slice(-40);

      setMetrics({
        cpu: liveData.cpuUsage ?? null,
        memory: liveData.memory ?? null,
        load: liveData.load ?? null,
        history
      });
      setConnected(true);
      setError("");
    } catch (err) {
      setConnected(false);
      setError(err.response?.data?.message || "Metrics stream is temporarily unavailable");
    } finally {
      setLastUpdated(new Date());
      setLoading(false);
    }
  }

  usePolling(loadMetrics, 5000);

  function exportCSV() {
    const rows = [["timestamp", "cpu_usage_percent"]];
    const now = Date.now();
    const interval = 5000;

    metrics.history.forEach((value, index) => {
      rows.push([
        new Date(now - (metrics.history.length - index) * interval).toISOString(),
        value
      ]);
    });

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "cloudfore-metrics.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const loadUnsupported =
    metrics.load &&
    metrics.load.load1 === 0 &&
    metrics.load.load5 === 0 &&
    metrics.load.load15 === 0;

  return (
    <AppShell
      title="System metrics"
      subtitle="Live resource monitoring with export support, connection feedback, and resilient fallback states."
      actions={
        <>
          <button type="button" className="secondary-button" onClick={loadMetrics}>
            Refresh now
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={exportCSV}
            disabled={!metrics.history.length}
          >
            Export CSV
          </button>
        </>
      }
    >
      {loading ? (
        <Loader label="Loading metrics..." />
      ) : error && !metrics.history.length ? (
        <ErrorState
          title="Metrics unavailable"
          message={error}
          action={
            <button type="button" className="primary-button" onClick={loadMetrics}>
              Retry connection
            </button>
          }
        />
      ) : (
        <div className="stack">
          <section className="panel">
            <div className="section-header">
              <div>
                <h2>Stream health</h2>
                <p className="page-subtitle" style={{ margin: "6px 0 0" }}>
                  {connected ? "Backend connection healthy." : "Showing the latest cached samples."}
                </p>
              </div>
              <span className={`badge ${connected ? "success" : "warning"}`}>
                {connected ? "Connected" : "Reconnecting"}
              </span>
            </div>

            <p className="status-text">
              Last updated {lastUpdated ? lastUpdated.toLocaleTimeString() : "just now"}.
              Polling pauses automatically when the tab is hidden.
            </p>
          </section>

          <section className="forecast-grid">
            <article className="metric-card">
              <span className="metric-label">CPU usage</span>
              <strong className="metric-value">
                {metrics.cpu !== null ? `${metrics.cpu}%` : "--"}
              </strong>
              <div className="progress-track">
                <div
                  className={`progress-bar ${getProgressTone(metrics.cpu || 0)}`}
                  style={{ width: `${metrics.cpu || 0}%` }}
                />
              </div>
              <p className="muted-text">Live CPU pressure from the host machine.</p>
            </article>

            <article className="metric-card">
              <span className="metric-label">Memory usage</span>
              <strong className="metric-value">
                {metrics.memory ? `${metrics.memory.usage}%` : "--"}
              </strong>
              <div className="progress-track">
                <div
                  className={`progress-bar ${getProgressTone(metrics.memory?.usage || 0)}`}
                  style={{ width: `${metrics.memory?.usage || 0}%` }}
                />
              </div>
              <p className="muted-text">
                {metrics.memory
                  ? `Using ${(metrics.memory.used / 1024 / 1024 / 1024).toFixed(1)} GB of ${(metrics.memory.total / 1024 / 1024 / 1024).toFixed(1)} GB`
                  : "Memory snapshot not available."}
              </p>
            </article>

            <article className="metric-card">
              <span className="metric-label">Load averages</span>
              <strong className="metric-value">
                {loadUnsupported || !metrics.load ? "--" : metrics.load.load1.toFixed(2)}
              </strong>
              <div className="tag-row">
                <span className="tag">1m {metrics.load ? metrics.load.load1.toFixed(2) : "--"}</span>
                <span className="tag">5m {metrics.load ? metrics.load.load5.toFixed(2) : "--"}</span>
                <span className="tag">15m {metrics.load ? metrics.load.load15.toFixed(2) : "--"}</span>
              </div>
              <p className="muted-text">
                {loadUnsupported
                  ? "Load average is not supported on this Windows host."
                  : "OS-level load averages captured by the backend."}
              </p>
            </article>

            <article className="metric-card">
              <span className="metric-label">Samples collected</span>
              <strong className="metric-value">{metrics.history.length}</strong>
              <div className="tag-row">
                <span className="tag">Auto refresh 5s</span>
                <span className="tag">CSV export ready</span>
              </div>
              <p className="muted-text">Enough history is retained to support the forecast screen.</p>
            </article>
          </section>

          <section className="panel">
            <div className="section-header">
              <div>
                <h2>CPU usage timeline</h2>
                <p className="page-subtitle" style={{ margin: "6px 0 0" }}>
                  Historical CPU samples plotted for quick trend recognition.
                </p>
              </div>
            </div>

            {metrics.history.length ? (
              <div className="graph-wrap">
                <MetricsGraph data={metrics.history} />
              </div>
            ) : (
              <EmptyState
                title="Waiting for samples"
                message="The backend has not returned enough CPU samples yet. Leave the page open for a moment."
              />
            )}
          </section>
        </div>
      )}
    </AppShell>
  );
}

function MetricsGraph({ data }) {
  const width = 900;
  const height = 260;
  const padding = 24;
  const points = data.map((value, index) => {
    const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - (value / 100) * (height - padding * 2);
    return `${x},${y}`;
  });

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
        points={points.join(" ")}
      />
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
