import { useEffect, useState } from "react";

import { getForecastApi } from "../api/forecastApi";

export default function Forecast() {
  const [history, setHistory] = useState([]);
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState(null);

  const [memoryHistory, setMemoryHistory] = useState([]);
  const [memoryForecast, setMemoryForecast] = useState(null);

  const [connected, setConnected] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await getForecastApi();
        const data = response.data.data;

        setConnected(true);
        setCurrent(data.history.at(-1)?.cpuUsage ?? null);
        setHistory(data.history.map((entry) => entry.cpuUsage));
        setMemoryHistory(data.history.map((entry) => entry.memoryUsage));
        setForecast(data.cpuForecast);
        setMemoryForecast(data.memoryForecast);
      } catch {
        setConnected(false);
      }
    };

    fetchMetrics();
    const t = setInterval(fetchMetrics, 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={styles.page}>
      <h1 style={{ marginBottom: 6 }}>Forecast</h1>
      <p style={styles.sub}>
        Live short-term resource forecast from your machine
      </p>

      <div style={styles.grid}>
        {/* current CPU */}
        <div style={styles.card}>
          <span style={styles.label}>Current CPU</span>
          <div style={styles.big}>{current ?? "—"}%</div>
          <Bar value={current || 0} />
        </div>

        {/* CPU forecast */}
        <div style={{ ...styles.card, border: "2px solid #6366f1" }}>
          <span style={styles.label}>CPU forecast</span>
          <div style={styles.forecastBig}>{forecast ?? "—"}%</div>
          <p style={styles.note}>
            Moving average of last samples
          </p>
        </div>

        {/* Memory forecast */}
        <div style={{ ...styles.card, border: "2px solid #22c55e" }}>
          <span style={styles.label}>Memory forecast</span>
          <div
            style={{
              ...styles.forecastBig,
              color: "#16a34a"
            }}
          >
            {memoryForecast ?? "—"}%
          </div>
          <p style={styles.note}>
            Based on recent memory usage
          </p>
        </div>

        {/* Backend */}
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
          <p style={styles.small}>Source: Node OS</p>
          <p style={styles.small}>Refresh: 2 seconds</p>
        </div>
      </div>

      {/* timeline */}
      <div style={styles.graphCard}>
        <h3 style={{ marginTop: 0 }}>CPU forecast timeline</h3>
        <p style={styles.graphSub}>
          Solid line = real data, dashed point = predicted next value
        </p>

        <ForecastGraph data={history} forecast={forecast} />
      </div>
    </div>
  );
}

/* ---------------- */

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

/* ---------------- */

function ForecastGraph({ data, forecast }) {
  const w = 800;
  const h = 240;
  const pad = 24;

  if (!data.length) {
    return <p style={{ color: "#6b7280" }}>Collecting samples…</p>;
  }

  const all = forecast !== null ? [...data, forecast] : data;

  const points = all.map((v, i) => {
    const x = pad + (i / (all.length - 1)) * (w - pad * 2);
    const y = h - pad - (v / 100) * (h - pad * 2);
    return { x, y };
  });

  const realPts = points
    .slice(0, data.length)
    .map(p => `${p.x},${p.y}`)
    .join(" ");

  const forecastPt = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%" }}>
      {[0.25, 0.5, 0.75].map((g, i) => (
        <line
          key={i}
          x1={pad}
          y1={pad + g * (h - pad * 2)}
          x2={w - pad}
          y2={pad + g * (h - pad * 2)}
          stroke="#e5e7eb"
        />
      ))}

      <polyline
        fill="none"
        stroke="#4f46e5"
        strokeWidth="3"
        points={realPts}
      />

      {forecast !== null && data.length > 0 && (
        <line
          x1={points[data.length - 1].x}
          y1={points[data.length - 1].y}
          x2={forecastPt.x}
          y2={forecastPt.y}
          stroke="#6366f1"
          strokeDasharray="6 6"
          strokeWidth="2"
        />
      )}

      {forecast !== null && (
        <circle
          cx={forecastPt.x}
          cy={forecastPt.y}
          r="5"
          fill="#6366f1"
        />
      )}

      <line
        x1={pad}
        y1={h - pad}
        x2={w - pad}
        y2={h - pad}
        stroke="#e5e7eb"
      />
    </svg>
  );
}

/* ---------------- */

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
