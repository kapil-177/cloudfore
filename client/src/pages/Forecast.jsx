import { useEffect, useState } from "react";

import Loader, { EmptyState, ErrorState } from "../components/Loader";
import { getForecastApi } from "../api/forecastApi";

export default function Forecast() {
  const [history, setHistory] = useState([]);
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [memoryForecast, setMemoryForecast] = useState(null);
  const [connected, setConnected] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await getForecastApi();
        const data = response.data.data;

        setConnected(true);
        setError("");
        setCurrent(data.history.at(-1)?.cpuUsage ?? null);
        setHistory(data.history.map((entry) => entry.cpuUsage));
        setForecast(data.cpuForecast);
        setMemoryForecast(data.memoryForecast);
      } catch (nextError) {
        setConnected(false);
        setError(
          nextError.response?.data?.message ||
            "Unable to generate the forecast right now."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();
    const timer = setInterval(fetchMetrics, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={styles.page}>
      <h1 style={{ marginBottom: 6 }}>Forecast</h1>
      <p style={styles.sub}>Live short-term resource forecast from your machine</p>

      {loading ? <Loader label="Preparing forecast..." /> : null}

      {!loading && error ? (
        <ErrorState
          title="Forecast is unavailable"
          message={error}
        />
      ) : null}

      {!loading && !error && !history.length ? (
        <EmptyState
          title="Not enough data yet"
          message="Create more metric samples and the forecast chart will appear here."
        />
      ) : null}

      {!loading && !error ? (
        <>
          <div style={styles.grid}>
            <div style={styles.card}>
              <span style={styles.label}>Current CPU</span>
              <div style={styles.big}>{current ?? "--"}%</div>
              <Bar value={current || 0} />
            </div>

            <div style={{ ...styles.card, border: "2px solid #6366f1" }}>
              <span style={styles.label}>CPU forecast</span>
              <div style={styles.forecastBig}>{forecast ?? "--"}%</div>
              <p style={styles.note}>Moving average of the latest resource samples</p>
            </div>

            <div style={{ ...styles.card, border: "2px solid #22c55e" }}>
              <span style={styles.label}>Memory forecast</span>
              <div style={{ ...styles.forecastBig, color: "#16a34a" }}>
                {memoryForecast ?? "--"}%
              </div>
              <p style={styles.note}>Projection based on recent memory usage</p>
            </div>

            <div style={styles.card}>
              <span style={styles.label}>Backend</span>
              <div
                style={{
                  marginTop: 12,
                  fontWeight: 700,
                  color: connected ? "#16a34a" : "#ef4444"
                }}
              >
                {connected ? "Connected" : "Disconnected"}
              </div>
              <p style={styles.small}>Source: Node OS metrics</p>
              <p style={styles.small}>Refresh: 2 seconds</p>
            </div>
          </div>

          <div style={styles.graphCard}>
            <h3 style={{ marginTop: 0 }}>CPU forecast timeline</h3>
            <p style={styles.graphSub}>
              Solid line shows real data. The final highlighted point is the next prediction.
            </p>
            <ForecastGraph data={history} forecast={forecast} />
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

function ForecastGraph({ data, forecast }) {
  const width = 800;
  const height = 240;
  const pad = 24;

  if (!data.length) {
    return <p style={{ color: "#6b7280" }}>Collecting samples...</p>;
  }

  const allPoints = forecast !== null ? [...data, forecast] : data;
  const points = allPoints.map((value, index) => {
    const x = pad + (index / Math.max(allPoints.length - 1, 1)) * (width - pad * 2);
    const y = height - pad - (value / 100) * (height - pad * 2);
    return { x, y };
  });

  const realPoints = points
    .slice(0, data.length)
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const forecastPoint = points[points.length - 1];

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
        points={realPoints}
      />

      {forecast !== null && data.length > 0 ? (
        <line
          x1={points[data.length - 1].x}
          y1={points[data.length - 1].y}
          x2={forecastPoint.x}
          y2={forecastPoint.y}
          stroke="#6366f1"
          strokeDasharray="6 6"
          strokeWidth="2"
        />
      ) : null}

      {forecast !== null ? (
        <circle cx={forecastPoint.x} cy={forecastPoint.y} r="5" fill="#6366f1" />
      ) : null}

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
  sub: {
    color: "#6b7280",
    marginBottom: 28
  },
  grid: {
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
  forecastBig: {
    fontSize: 54,
    fontWeight: 900,
    marginTop: 10,
    color: "#4f46e5"
  },
  note: {
    marginTop: 6,
    fontSize: 13,
    color: "#6b7280"
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
