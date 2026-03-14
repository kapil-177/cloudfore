import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { getLiveMetricsApi } from "../api/metricsApi";
import { getServicesApi } from "../api/serviceApi";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState([]);
  const [serviceCount, setServiceCount] = useState(0);
  const [cpuUsage, setCpuUsage] = useState("Live");
  const [forecastState, setForecastState] = useState("Ready");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [servicesResponse, metricsResponse] = await Promise.all([
          getServicesApi(),
          getLiveMetricsApi()
        ]);

        const services = servicesResponse.data.data || [];
        setRecent(services.slice(0, 3));
        setServiceCount(services.length);
        setCpuUsage(`${metricsResponse.data.data.cpuUsage}%`);
        setForecastState(services.length ? "Active" : "Ready");
        localStorage.setItem("services", JSON.stringify(services));
      } catch {
        const saved = localStorage.getItem("services");

        if (saved) {
          const parsed = JSON.parse(saved);
          setRecent(parsed.slice(0, 3));
          setServiceCount(parsed.length);
        }
      }
    }

    loadDashboard();
  }, []);

  const cards = [
    { title: "Services", icon: "🛠️", path: "/services", desc: "Manage cloud services" },
    { title: "Metrics", icon: "📊", path: "/metrics", desc: "System performance data" },
    { title: "Forecast", icon: "☁️", path: "/forecast", desc: "Usage prediction" }
  ];

  return (
    <div style={styles.page}>
      {/* top bar */}
      <div style={styles.topBar}>
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p style={styles.sub}>Manage and monitor your cloud platform</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            style={styles.primaryBtn}
            onClick={() => navigate("/services", { state: { openCreate: true } })}
          >
            + Create Service
          </button>

          <div style={{ position: "relative" }}>
            <img
              src="https://imgs.search.brave.com/elZT_vFWzWDekolVJN0IPeofEYKOPHsVpvW_3xp3X6k/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJjYXZlLmNv/bS93cC93cDEwNTA5/NTkxLmpwZw"
              alt="profile"
              style={styles.avatar}
              onClick={() => setOpen(!open)}
            />

            {open && (
              <div style={styles.menu}>
                <div style={styles.menuItem} onClick={() => navigate("/profile")}>
                  My Profile
                </div>
                <div style={styles.menuItem} onClick={() => navigate("/settings")}>
                  Settings
                </div>
                <div
                  style={{ ...styles.menuItem, color: "#ef4444" }}
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* stats */}
      <div style={styles.stats}>
        <div style={styles.statCard}><span>Active Services</span><h2>{serviceCount}</h2></div>
        <div style={styles.statCard}><span>CPU Usage</span><h2>{cpuUsage}</h2></div>
        <div style={styles.statCard}><span>Forecast</span><h2>{forecastState}</h2></div>
      </div>

      {/* recent services */}
      <div style={styles.recentBox}>
          <h3 style={{ marginBottom: 12 }}>
            Recent services {user ? `for ${user.name}` : ""}
          </h3>

        {recent.length === 0 && (
          <div style={{ color: "#6b7280" }}>No services created yet</div>
        )}

        {recent.map(s => (
          <div key={s.id} style={styles.recentRow}>
            <strong>{s.name}</strong>
            <span
              style={{
                ...styles.recentBadge,
                background:
                  s.status === "Running"
                    ? "linear-gradient(135deg,#22c55e,#16a34a)"
                    : "#e5e7eb",
                color: s.status === "Running" ? "white" : "#374151"
              }}
            >
              {s.status}
            </span>
          </div>
        ))}
      </div>

      {/* main cards */}
      <div style={styles.grid}>
        {cards.map(c => (
          <div
            key={c.title}
            style={styles.card}
            onClick={() => navigate(c.path)}
          >
            <div style={styles.icon}>{c.icon}</div>
            <h3>{c.title}</h3>
            <p style={{ color: "#6b7280" }}>{c.desc}</p>
            <span style={styles.open}>Open →</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: 40,
    fontFamily: "system-ui",
    background:
      "radial-gradient(circle at top right, #dbeafe, #eef2ff, #ffffff)"
  },

  topBar: { display: "flex", justifyContent: "space-between", marginBottom: 26 },

  sub: { color: "#6b7280" },

  primaryBtn: {
    padding: "10px 16px",
    border: "none",
    borderRadius: 10,
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
    background: "linear-gradient(135deg,#2563eb,#4f46e5)"
  },

  avatar: { width: 42, height: 42, borderRadius: "50%", cursor: "pointer" },

  menu: {
    position: "absolute",
    right: 0,
    top: 50,
    background: "white",
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 15px 35px rgba(0,0,0,0.15)"
  },

  menuItem: { padding: "10px 14px", cursor: "pointer" },

  stats: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 },

  statCard: {
    background: "white",
    borderRadius: 14,
    padding: 18,
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)"
  },

  recentBox: {
    maxWidth: 520,
    background: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    boxShadow: "0 15px 30px rgba(0,0,0,0.08)"
  },

  recentRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0"
  },

  recentBadge: {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
    gap: 24
  },

  card: {
    background: "white",
    borderRadius: 18,
    padding: 26,
    cursor: "pointer",
    boxShadow: "0 15px 30px rgba(0,0,0,0.08)"
  },

  icon: { fontSize: 32, marginBottom: 10 },

  open: { color: "#4f46e5", fontWeight: 600 }
};
