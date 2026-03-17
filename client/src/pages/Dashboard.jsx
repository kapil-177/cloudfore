import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Loader, { EmptyState, ErrorState } from "../components/Loader";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        setError("");
      } catch (nextError) {
        const saved = localStorage.getItem("services");

        if (saved) {
          const parsed = JSON.parse(saved);
          setRecent(parsed.slice(0, 3));
          setServiceCount(parsed.length);
          setForecastState(parsed.length ? "Cached" : "Ready");
          setError("Showing the latest cached dashboard data.");
        } else {
          setError(
            nextError.response?.data?.message ||
              "Unable to load dashboard data right now."
          );
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const cards = [
    { title: "Services", icon: "SC", path: "/services", desc: "Manage cloud services" },
    { title: "Metrics", icon: "MT", path: "/metrics", desc: "System performance data" },
    { title: "Forecast", icon: "FC", path: "/forecast", desc: "Usage prediction" }
  ];

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p style={styles.sub}>Manage and monitor your cloud platform</p>
        </div>

        <div style={styles.topActions}>
          <button
            style={styles.primaryBtn}
            onClick={() => navigate("/services", { state: { openCreate: true } })}
          >
            + Create Service
          </button>

          <div style={{ position: "relative" }}>
            <button style={styles.avatarBtn} onClick={() => setOpen(!open)}>
              {(user?.name || "Cloud Admin").slice(0, 1).toUpperCase()}
            </button>

            {open ? (
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
            ) : null}
          </div>
        </div>
      </div>

      {loading ? <Loader label="Loading dashboard..." /> : null}

      {!loading && error && !recent.length ? (
        <ErrorState title="Dashboard unavailable" message={error} />
      ) : null}

      {!loading && !error && !recent.length ? (
        <EmptyState
          title="Your workspace is ready"
          message="Create your first cloud service to start tracking live metrics and forecasts."
          action={
            <button
              type="button"
              style={styles.primaryBtn}
              onClick={() => navigate("/services", { state: { openCreate: true } })}
            >
              Create service
            </button>
          }
        />
      ) : null}

      {!loading ? (
        <>
          {error && recent.length ? <div style={styles.banner}>{error}</div> : null}

          <div style={styles.stats}>
            <div style={styles.statCard}><span>Active Services</span><h2>{serviceCount}</h2></div>
            <div style={styles.statCard}><span>CPU Usage</span><h2>{cpuUsage}</h2></div>
            <div style={styles.statCard}><span>Forecast</span><h2>{forecastState}</h2></div>
          </div>

          <div style={styles.recentBox}>
            <h3 style={{ marginBottom: 12 }}>
              Recent services {user ? `for ${user.name}` : ""}
            </h3>

            {recent.length === 0 ? (
              <div style={{ color: "#6b7280" }}>No services created yet</div>
            ) : null}

            {recent.map((service) => (
              <div key={service.id} style={styles.recentRow}>
                <strong>{service.name}</strong>
                <span
                  style={{
                    ...styles.recentBadge,
                    background:
                      service.status === "Running"
                        ? "linear-gradient(135deg,#22c55e,#16a34a)"
                        : "#e5e7eb",
                    color: service.status === "Running" ? "white" : "#374151"
                  }}
                >
                  {service.status}
                </span>
              </div>
            ))}
          </div>

          <div style={styles.grid}>
            {cards.map((card) => (
              <div
                key={card.title}
                style={styles.card}
                onClick={() => navigate(card.path)}
              >
                <div style={styles.icon}>{card.icon}</div>
                <h3>{card.title}</h3>
                <p style={{ color: "#6b7280" }}>{card.desc}</p>
                <span style={styles.open}>Open now</span>
              </div>
            ))}
          </div>
        </>
      ) : null}
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
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
    marginBottom: 26
  },
  topActions: {
    display: "flex",
    alignItems: "center",
    gap: 16
  },
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
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(135deg,#1d4ed8,#4f46e5)",
    color: "white",
    fontWeight: 700
  },
  menu: {
    position: "absolute",
    right: 0,
    top: 50,
    background: "white",
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
    minWidth: 150
  },
  menuItem: { padding: "10px 14px", cursor: "pointer" },
  banner: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: 14,
    fontWeight: 600
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: 16,
    marginBottom: 28
  },
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
  icon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 800,
    marginBottom: 10,
    background: "linear-gradient(135deg,#dbeafe,#e0e7ff)",
    color: "#3730a3"
  },
  open: { color: "#4f46e5", fontWeight: 600 }
};
