import { useEffect, useState } from "react";

import Loader, { EmptyState, ErrorState } from "../components/Loader";
import { getLiveMetricsApi, getMetricsHistoryApi } from "../api/metricsApi";

export default function Metrics() {
  const [cpu, setCpu] = useState(null);
  const [memory, setMemory] = useState(null);
  const [load, setLoad] = useState(null);
  const [history, setHistory] = useState([]);
  const [connected, setConnected] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAll() {
      try {
        const [liveResponse, historyResponse] = await Promise.all([
          getLiveMetricsApi(),
          getMetricsHistoryApi(null, 40)
        ]);
        const metrics = liveResponse?.data?.data || {};
        const historyItems = historyResponse?.data?.data || [];
        const cpuHistory = historyItems
          .map((entry) => entry?.cpuUsage)
          .filter((value) => typeof value === "number")
          .slice(-40);

        setConnected(true);
        setError("");
        setCpu(metrics.cpuUsage ?? 0);
        setMemory(metrics.memory ?? null);
        setLoad(metrics.load ?? null);
        setHistory(
          cpuHistory.length
            ? cpuHistory
            : typeof metrics.cpuUsage === "number"
            ? [metrics.cpuUsage]
            : []
        );
        setLastUpdated(new Date());
      } catch (nextError) {
        console.error("Metrics fetch error:", nextError);
        setConnected(false);
        setError(
          nextError.response?.data?.message ||
            "Unable to reach the metrics service right now."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
    const interval = setInterval(fetchAll, 2000);
    return () => clearInterval(interval);
  }, []);

  async function refreshMetrics() {
    setLoading(true);

    try {
      const [liveResponse, historyResponse] = await Promise.all([
        getLiveMetricsApi(),
        getMetricsHistoryApi(null, 40)
      ]);
      const metrics = liveResponse?.data?.data || {};
      const historyItems = historyResponse?.data?.data || [];
      const cpuHistory = historyItems
        .map((entry) => entry?.cpuUsage)
        .filter((value) => typeof value === "number")
        .slice(-40);

      setConnected(true);
      setError("");
      setCpu(metrics.cpuUsage ?? 0);
      setMemory(metrics.memory ?? null);
      setLoad(metrics.load ?? null);
      setHistory(
        cpuHistory.length
          ? cpuHistory
          : typeof metrics.cpuUsage === "number"
          ? [metrics.cpuUsage]
          : []
      );
      setLastUpdated(new Date());
    } catch (nextError) {
      console.error("Metrics fetch error:", nextError);
      setConnected(false);
      setError(
        nextError.response?.data?.message ||
          "Unable to reach the metrics service right now."
      );
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    const rows = [["timestamp", "cpu_usage_percent"]];
    const now = Date.now();
    const interval = 2000;

    history.forEach((value, index) => {
      const timestamp = new Date(
        now - (history.length - index) * interval
      ).toISOString();
      rows.push([timestamp, value]);
    });

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "cpu_metrics_report.csv";
    anchor.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={{ marginBottom: 6 }}>System Metrics</h1>
          <p style={styles.sub}>Live resource monitoring from your machine</p>
          <p style={styles.statusText}>
            {connected ? "Live stream connected" : "Reconnecting to backend"}
            {lastUpdated ? ` | Updated ${lastUpdated.toLocaleTimeString()}` : ""}
          </p>
        </div>

        <div style={styles.actionRow}>
          <button style={styles.secondaryBtn} onClick={refreshMetrics}>
            Refresh
          </button>
          <button
            style={styles.exportBtn}
            onClick={exportCSV}
            disabled={!history.length}
          >
            Export CSV
          </button>
        </div>
      </div>

      {loading ? <Loader label="Loading live metrics..." /> : null}

      {!loading && error ? (
        <ErrorState
          title="Metrics are temporarily unavailable"
          message={error}
          action={
            <button type="button" style={styles.exportBtn} onClick={refreshMetrics}>
              Retry connection
            </button>
          }
        />
      ) : null}

      {!loading && !error && !history.length ? (
        <EmptyState
          title="Waiting for metric samples"
          message="The backend is connected, but there are not enough samples to draw the chart yet."
          action={
            <button type="button" style={styles.secondaryBtn} onClick={refreshMetrics}>
              Check again
            </button>
          }
        />
      ) : null}

      {!loading && !error ? (
        <>
          <div style={styles.topGrid}>
            <div style={styles.card}>
              <span style={styles.label}>CPU usage</span>
              <div style={styles.big}>{cpu !== null ? `${cpu}%` : "--"}</div>
              <Bar value={cpu || 0} />
            </div>

            <div style={styles.card}>
              <span style={styles.label}>Memory usage</span>
              <div style={styles.big}>{memory ? `${memory.usage}%` : "--"}</div>
              <Bar value={memory?.usage || 0} />
              {memory ? (
                <p style={styles.small}>
                  Used {(memory.used / 1024 / 1024 / 1024).toFixed(1)} GB / {" "}
                  {(memory.total / 1024 / 1024 / 1024).toFixed(1)} GB
                </p>
              ) : null}
            </div>

            <div style={styles.card}>
              <span style={styles.label}>System load</span>
              {load &&
              load.load1 === 0 &&
              load.load5 === 0 &&
              load.load15 === 0 ? (
                <p style={styles.small}>Load average not supported on Windows</p>
              ) : (
                <div style={styles.loadRow}>
                  <div>
                    <strong>1m</strong>
                    <div>{load ? load.load1.toFixed(2) : "--"}</div>
                  </div>
                  <div>
                    <strong>5m</strong>
                    <div>{load ? load.load5.toFixed(2) : "--"}</div>
                  </div>
                  <div>
                    <strong>15m</strong>
                    <div>{load ? load.load15.toFixed(2) : "--"}</div>
                  </div>
                </div>
              )}
              <p style={styles.small}>OS load average</p>
            </div>

            <div style={styles.card}>
              <span style={styles.label}>Backend</span>
              <div
                style={{
                  marginTop: 10,
                  fontWeight: 700,
                  color: connected ? "#16a34a" : "#ef4444"
                }}
              >
                {connected ? "Connected" : "Disconnected"}
              </div>
              <p style={styles.small}>Source: Node OS module</p>
              <p style={styles.small}>Refresh: 2 seconds</p>
            </div>
          </div>

          <div style={styles.graphCard}>
            <h3 style={{ marginTop: 0 }}>CPU usage timeline</h3>
            <p style={styles.graphSub}>Live samples from your system</p>
            <Graph data={history} />
          </div>
        </>
      ) : null}
    </div>
  );
}

function Bar({ value }) {
  return (
    <div style={styles.barWrap}>
      <div
        style={{
          ...styles.bar,
          width: `${value}%`,
          background:
            value > 80
              ? "#ef4444"
              : value > 60
              ? "#f59e0b"
              : "linear-gradient(90deg,#22c55e,#16a34a)"
        }}
      />
    </div>
  );
}

function Graph({ data }) {
  const width = 800;
  const height = 240;
  const pad = 24;

  if (!data.length) {
    return <p style={{ color: "#6b7280" }}>Waiting for samples...</p>;
  }

  const points = data.map((value, index) => {
    const x = pad + (index / Math.max(data.length - 1, 1)) * (width - pad * 2);
    const y = height - pad - (value / 100) * (height - pad * 2);
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%" }}>
      {[0.25, 0.5, 0.75].map((guide, index) => (
        <line
          key={index}
          x1={pad}
          y1={pad + guide * (height - pad * 2)}
          x2={width - pad}
          y2={pad + guide * (height - pad * 2)}
          stroke="#e5e7eb"
        />
      ))}

      <polyline
        fill="none"
        stroke="#4f46e5"
        strokeWidth="3"
        points={points.join(" ")}
      />

      <line
        x1={pad}
        y1={height - pad}
        x2={width - pad}
        y2={height - pad}
        stroke="#e5e7eb"
      />
    </svg>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: 40,
    background:
      "radial-gradient(circle at top right, #dbeafe, #eef2ff, #ffffff)",
    fontFamily: "system-ui"
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginBottom: 10
  },
  actionRow: {
    display: "flex",
    gap: 12,
    alignItems: "center"
  },
  exportBtn: {
    height: 40,
    padding: "0 18px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(135deg,#4f46e5,#6366f1)",
    color: "white",
    fontWeight: 600
  },
  secondaryBtn: {
    height: 40,
    padding: "0 18px",
    borderRadius: 999,
    border: "1px solid #cbd5e1",
    cursor: "pointer",
    background: "white",
    color: "#334155",
    fontWeight: 600
  },
  sub: {
    color: "#6b7280",
    marginBottom: 28
  },
  statusText: {
    color: "#475569",
    fontSize: 14,
    marginBottom: 28
  },
  topGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
    gap: 24
  },
  card: {
    background: "white",
    borderRadius: 18,
    padding: 24,
    boxShadow: "0 15px 30px rgba(0,0,0,0.08)"
  },
  label: {
    fontSize: 14,
    color: "#6b7280"
  },
  big: {
    fontSize: 42,
    fontWeight: 800,
    marginTop: 8
  },
  barWrap: {
    marginTop: 14,
    height: 10,
    background: "#e5e7eb",
    borderRadius: 999,
    overflow: "hidden"
  },
  bar: {
    height: "100%",
    borderRadius: 999,
    transition: "width .4s ease"
  },
  loadRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 12,
    fontSize: 14
  },
  small: {
    marginTop: 6,
    fontSize: 13,
    color: "#6b7280"
  },
  graphCard: {
    marginTop: 32,
    background: "white",
    borderRadius: 18,
    padding: 28,
    boxShadow: "0 15px 30px rgba(0,0,0,0.08)"
  },
  graphSub: {
    marginTop: 4,
    marginBottom: 16,
    color: "#6b7280",
    fontSize: 13
  }
};
