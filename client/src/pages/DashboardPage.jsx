import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getForecastApi } from "../api/forecastApi";
import { getLiveMetricsApi } from "../api/metricsApi";
import { getServicesApi } from "../api/serviceApi";
import AppShell from "../components/AppShell";
import Loader, { ErrorState } from "../components/Loader";
import { useAuth } from "../context/AuthContext";

const featureCards = [
  {
    title: "Service operations",
    description: "Search, filter, sort, and manage cloud services with quick status changes.",
    kicker: "Control",
    path: "/services"
  },
  {
    title: "System metrics",
    description: "Track CPU, memory, and live refresh health with export support.",
    kicker: "Observe",
    path: "/metrics"
  },
  {
    title: "Forecast console",
    description: "Review predictive usage trends, confidence levels, and scaling recommendations.",
    kicker: "Predict",
    path: "/forecast"
  }
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState([]);
  const [stats, setStats] = useState({
    serviceCount: 0,
    runningCount: 0,
    cpuUsage: "--",
    memoryForecast: "--",
    confidence: "--"
  });

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [servicesResponse, metricsResponse, forecastResponse] = await Promise.all([
        getServicesApi(),
        getLiveMetricsApi(),
        getForecastApi()
      ]);

      const services = servicesResponse.data.data || [];
      const liveMetrics = metricsResponse.data.data || {};
      const forecast = forecastResponse.data.data || {};

      setRecent(services.slice(0, 4));
      setStats({
        serviceCount: services.length,
        runningCount: services.filter((service) => service.status === "Running").length,
        cpuUsage:
          typeof liveMetrics.cpuUsage === "number" ? `${liveMetrics.cpuUsage}%` : "--",
        memoryForecast:
          typeof forecast.memoryForecast === "number" ? `${forecast.memoryForecast}%` : "--",
        confidence:
          typeof forecast.confidence === "number" ? `${forecast.confidence}%` : "--"
      });
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Dashboard data could not be loaded");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <AppShell
      title="Operations cockpit"
      subtitle="Watch infrastructure health, recent services, and forecast confidence from one place."
      actions={
        <>
          <button type="button" className="secondary-button" onClick={loadDashboard}>
            Refresh
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate("/services", { state: { openCreate: true } })}
          >
            Create service
          </button>
        </>
      }
    >
      {loading ? (
        <Loader label="Loading dashboard..." />
      ) : error ? (
        <ErrorState
          title="Dashboard unavailable"
          message={error}
          action={
            <button type="button" className="primary-button" onClick={loadDashboard}>
              Try again
            </button>
          }
        />
      ) : (
        <div className="stack">
          <section className="hero-card dashboard-hero">
            <div className="dashboard-hero-copy">
              <span className="section-label">Live command center</span>
              <h2 className="hero-title" style={{ margin: "0 0 12px", fontSize: "clamp(2.2rem, 5vw, 4rem)" }}>
                {user?.name || "Cloud Admin"}, your cloud operations look steady.
              </h2>
              <p className="hero-copy" style={{ maxWidth: "58ch" }}>
                Monitor service activity, detect resource pressure early, and move straight
                into forecast-driven planning from a single overview page.
              </p>
              <div className="tag-row" style={{ marginTop: 22 }}>
                <span className="tag">{stats.runningCount} services running</span>
                <span className="tag">CPU at {stats.cpuUsage}</span>
                <span className="tag">Forecast confidence {stats.confidence}</span>
              </div>
              <div className="button-row" style={{ marginTop: 20 }}>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => navigate("/services", { state: { openCreate: true } })}
                >
                  Add new service
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => navigate("/forecast")}
                >
                  Open forecast
                </button>
              </div>
            </div>

            <div className="dashboard-signal-grid">
              <article className="signal-card">
                <span className="section-label">System pulse</span>
                <strong className="signal-value">{stats.cpuUsage}</strong>
                <p className="signal-copy">Live CPU usage reported by the backend metrics endpoint.</p>
              </article>
              <article className="signal-card">
                <span className="section-label">Memory outlook</span>
                <strong className="signal-value">{stats.memoryForecast}</strong>
                <p className="signal-copy">Short-term forecast generated from recent usage samples.</p>
              </article>
              <article className="signal-card signal-card-accent">
                <span className="section-label">Evaluation pitch</span>
                <div className="stack" style={{ gap: 10 }}>
                  <div className="tag">JWT auth</div>
                  <div className="tag">MongoDB persistence</div>
                  <div className="tag">Live metrics and forecasting</div>
                </div>
              </article>
            </div>
          </section>

          <section className="stats-grid">
            <article className="stat-card">
              <span>Total services</span>
              <strong>{stats.serviceCount}</strong>
              <p className="muted-text">Cloud services currently tracked in the workspace.</p>
            </article>
            <article className="stat-card">
              <span>Live CPU</span>
              <strong>{stats.cpuUsage}</strong>
              <p className="muted-text">Current usage sampled from the backend metrics endpoint.</p>
            </article>
            <article className="stat-card">
              <span>Forecast confidence</span>
              <strong>{stats.confidence}</strong>
              <p className="muted-text">Confidence improves as the system collects more samples.</p>
            </article>
          </section>

          <section className="content-grid">
            <div className="panel">
              <div className="section-header">
                <div>
                  <h2>Recent services</h2>
                  <p className="page-subtitle" style={{ margin: "6px 0 0" }}>
                    Latest resources created for {user?.name || "your workspace"}.
                  </p>
                </div>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => navigate("/services")}
                >
                  View all
                </button>
              </div>

              {recent.length ? (
                <div className="recent-list">
                  {recent.map((service) => (
                    <div key={service.id} className="recent-list-item">
                      <div>
                        <strong>{service.name}</strong>
                        <p className="muted-text" style={{ marginTop: 6 }}>
                          {service.type} in {service.env} at {service.region}
                        </p>
                      </div>
                      <div className="button-row" style={{ justifyContent: "space-between" }}>
                        <span
                          className={`badge ${
                            service.status === "Running"
                              ? "success"
                              : service.status === "Paused"
                              ? "warning"
                              : "neutral"
                          }`}
                        >
                          {service.status}
                        </span>
                        <span className="muted-text">Updated workflow ready</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-inline">No services yet. Create one to populate the dashboard.</p>
              )}
            </div>

            <div className="panel">
              <div className="section-header">
                <div>
                  <h2>Phase 3 highlights</h2>
                  <p className="page-subtitle" style={{ margin: "6px 0 0" }}>
                    Features you can confidently explain in your viva.
                  </p>
                </div>
              </div>

              <div className="stack">
                {featureCards.map((card) => (
                  <button
                    key={card.title}
                    type="button"
                    className="service-card feature-link"
                    style={{ textAlign: "left", cursor: "pointer" }}
                    onClick={() => navigate(card.path)}
                  >
                    <div>
                      <span className="section-label" style={{ marginBottom: 10 }}>
                        {card.kicker}
                      </span>
                      <strong>{card.title}</strong>
                      <p className="muted-text" style={{ marginTop: 6 }}>
                        {card.description}
                      </p>
                    </div>
                    <span className="badge neutral">Explore</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
