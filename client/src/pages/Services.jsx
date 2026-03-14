import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import {
  createServiceApi,
  deleteServiceApi,
  getServicesApi,
  updateServiceApi
} from "../api/serviceApi";

export default function Services() {
  const location = useLocation();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState("API");
  const [env, setEnv] = useState("Production");
  const [region, setRegion] = useState("Asia South");
  const [autoStart, setAutoStart] = useState(true);

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state?.openCreate) {
      setShowForm(true);
    }
  }, [location.state]);

  useEffect(() => {
    async function loadServices() {
      try {
        const response = await getServicesApi();
        const nextServices = response.data.data || [];
        setServices(nextServices);
        localStorage.setItem("services", JSON.stringify(nextServices));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load services");
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, []);

  async function addService(e) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const response = await createServiceApi({
        name,
        desc,
        type,
        env,
        region,
        autoStart
      });

      const nextServices = [response.data.data, ...services];
      setServices(nextServices);
      localStorage.setItem("services", JSON.stringify(nextServices));
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create service");
      return;
    }

    setName("");
    setDesc("");
    setType("API");
    setEnv("Production");
    setRegion("Asia South");
    setAutoStart(true);
    setShowForm(false);
  }

  async function deleteService(id) {
    try {
      await deleteServiceApi(id);
      const nextServices = services.filter((s) => s.id !== id);
      setServices(nextServices);
      localStorage.setItem("services", JSON.stringify(nextServices));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete service");
    }
  }

  async function toggleStatus(id) {
    const current = services.find((service) => service.id === id);

    if (!current) return;

    const nextStatus = current.status === "Running" ? "Stopped" : "Running";

    try {
      const response = await updateServiceApi(id, { status: nextStatus });
      const nextServices = services.map((service) =>
        service.id === id ? response.data.data : service
      );
      setServices(nextServices);
      localStorage.setItem("services", JSON.stringify(nextServices));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update service");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <h1 style={{ margin: 0 }}>Services</h1>
          <p style={styles.sub}>Create and manage your cloud services</p>
        </div>

        <button style={styles.primaryBtn} onClick={() => setShowForm(true)}>
          + Add service
        </button>
      </div>

      <div style={styles.contentWrap}>
        {error ? <div style={styles.error}>{error}</div> : null}

        {showForm && (
          <form onSubmit={addService} style={styles.createCard}>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>
              Create service
            </h3>

            <div style={styles.grid2}>
              <div style={styles.field}>
                <label style={styles.label}>Service name</label>
                <input
                  style={styles.input}
                  placeholder="e.g. Forecast Engine"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Service type</label>
                <select
                  style={styles.input}
                  value={type}
                  onChange={e => setType(e.target.value)}
                >
                  <option>API</option>
                  <option>Worker</option>
                  <option>Database</option>
                  <option>Scheduler</option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Environment</label>
                <select
                  style={styles.input}
                  value={env}
                  onChange={e => setEnv(e.target.value)}
                >
                  <option>Production</option>
                  <option>Staging</option>
                  <option>Development</option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Region</label>
                <select
                  style={styles.input}
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                >
                  <option>Asia South</option>
                  <option>US East</option>
                  <option>EU West</option>
                </select>
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                style={{ ...styles.input, height: 90, resize: "none" }}
                placeholder="Short description of the service"
                value={desc}
                onChange={e => setDesc(e.target.value)}
              />
            </div>

            <div style={styles.toggleRow}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                Auto start service
              </span>
              <input
                type="checkbox"
                checked={autoStart}
                onChange={e => setAutoStart(e.target.checked)}
              />
            </div>

            <div style={styles.formActions}>
              <button
                type="button"
                style={styles.secondaryBtn}
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>

              <button type="submit" style={styles.primaryBtn}>
                Create service
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div style={styles.emptyState}>Loading services...</div>
        ) : (
        <div style={styles.list}>
          {services.map(s => (
            <div key={s.id} style={styles.serviceCard}>
              <div>
                <strong>{s.name}</strong>
                <div style={styles.desc}>{s.desc || "No description"}</div>
                <div style={styles.meta}>
                  {s.type} · {s.env} · {s.region}
                </div>
              </div>

              <div style={styles.right}>
                <span
                  onClick={() => toggleStatus(s.id)}
                  style={{
                    ...styles.badge,
                    background:
                      s.status === "Running"
                        ? "linear-gradient(135deg,#22c55e,#16a34a)"
                        : "#e5e7eb",
                    color:
                      s.status === "Running" ? "white" : "#374151"
                  }}
                >
                  {s.status}
                </span>

                <button
                  style={styles.deleteBtn}
                  onClick={() => deleteService(s.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
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

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24
  },

  sub: { color: "#6b7280", marginTop: 6 },

  contentWrap: {
    maxWidth: 900,
    display: "flex",
    flexDirection: "column",
    gap: 24
  },

  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginBottom: 18
  },

  primaryBtn: {
    padding: "10px 18px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    color: "white",
    background: "linear-gradient(135deg,#2563eb,#4f46e5)"
  },

  secondaryBtn: {
    padding: "10px 18px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "white",
    cursor: "pointer"
  },

  createCard: {
    width: "100%",
    background: "white",
    padding: 28,
    borderRadius: 18,
    boxShadow: "0 20px 40px rgba(0,0,0,0.08)"
  },

  field: { display: "flex", flexDirection: "column", gap: 6 },

  label: { fontSize: 13, fontWeight: 600, color: "#374151" },

  input: {
    width: "100%",
    boxSizing: "border-box",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: "12px 14px",
    fontSize: 14,
    outline: "none",
    background: "#f9fafb"
  },

  toggleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12
  },

  list: { display: "grid", gap: 16 },
  emptyState: {
    background: "white",
    borderRadius: 16,
    padding: 20,
    color: "#6b7280",
    boxShadow: "0 15px 30px rgba(0,0,0,0.06)"
  },
  error: {
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 12,
    padding: 12,
    fontSize: 14
  },

  serviceCard: {
    background: "white",
    borderRadius: 16,
    padding: 18,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 15px 30px rgba(0,0,0,0.06)"
  },

  desc: { fontSize: 13, color: "#6b7280", marginTop: 2 },

  meta: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4
  },

  right: { display: "flex", alignItems: "center", gap: 10 },

  badge: {
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer"
  },

  deleteBtn: {
    padding: "7px 12px",
    borderRadius: 8,
    border: "none",
    background: "#fee2e2",
    color: "#b91c1c",
    cursor: "pointer",
    fontWeight: 600
  }
};
