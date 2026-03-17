import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  createServiceApi,
  deleteServiceApi,
  getServicesApi,
  updateServiceApi
} from "../api/serviceApi";
import AppShell from "../components/AppShell";
import Loader, { EmptyState, ErrorState } from "../components/Loader";

function getStatusBadge(status) {
  if (status === "Running") {
    return "success";
  }

  if (status === "Paused") {
    return "warning";
  }

  return "neutral";
}

const initialForm = {
  name: "",
  desc: "",
  type: "API",
  env: "Production",
  region: "Asia South",
  autoStart: true
};

export default function ServicesPage() {
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    if (location.state?.openCreate) {
      setShowForm(true);
    }
  }, [location.state]);

  async function loadServices() {
    try {
      setLoading(true);
      const response = await getServicesApi();
      setServices(response.data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  async function addService(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Service name is required");
      return;
    }

    try {
      setSubmitting(true);
      const response = await createServiceApi(form);
      setServices((current) => [response.data.data, ...current]);
      setForm(initialForm);
      setShowForm(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create service");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteService(id) {
    try {
      await deleteServiceApi(id);
      setServices((current) => current.filter((service) => service.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete service");
    }
  }

  async function toggleStatus(service) {
    const nextStatus = service.status === "Running" ? "Stopped" : "Running";

    try {
      const response = await updateServiceApi(service.id, { status: nextStatus });
      setServices((current) =>
        current.map((item) => (item.id === service.id ? response.data.data : item))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update service");
    }
  }

  const filteredServices = useMemo(() => {
    return [...services]
      .filter((service) => {
        const query = search.trim().toLowerCase();

        if (!query) {
          return true;
        }

        return [service.name, service.desc, service.type, service.env, service.region]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));
      })
      .filter((service) => (statusFilter === "All" ? true : service.status === statusFilter))
      .filter((service) => (typeFilter === "All" ? true : service.type === typeFilter))
      .sort((left, right) => {
        if (sortBy === "name-asc") {
          return left.name.localeCompare(right.name);
        }

        if (sortBy === "name-desc") {
          return right.name.localeCompare(left.name);
        }

        const leftTime = new Date(left.createdAt || 0).getTime();
        const rightTime = new Date(right.createdAt || 0).getTime();
        return sortBy === "oldest" ? leftTime - rightTime : rightTime - leftTime;
      });
  }, [search, services, sortBy, statusFilter, typeFilter]);

  function resetFilters() {
    setSearch("");
    setStatusFilter("All");
    setTypeFilter("All");
    setSortBy("newest");
  }

  return (
    <AppShell
      title="Service control"
      subtitle="Manage your cloud resources with cleaner workflows, filter controls, and forecast-friendly metadata."
      actions={
        <>
          <button type="button" className="secondary-button" onClick={loadServices}>
            Refresh
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => setShowForm((current) => !current)}
          >
            {showForm ? "Close form" : "Add service"}
          </button>
        </>
      }
    >
      <div className="stack">
        {showForm ? (
          <form className="panel stack" onSubmit={addService}>
            <div className="section-header">
              <div>
                <h2>Create a new service</h2>
                <p className="page-subtitle" style={{ margin: "6px 0 0" }}>
                  Capture deployment context so the dashboard can compare services intelligently.
                </p>
              </div>
            </div>

            <div className="form-grid">
              <div className="field">
                <label htmlFor="service-name">Service name</label>
                <input
                  id="service-name"
                  className="text-input"
                  value={form.name}
                  placeholder="Forecast Engine"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </div>

              <div className="field">
                <label htmlFor="service-type">Type</label>
                <select
                  id="service-type"
                  className="select-input"
                  value={form.type}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, type: event.target.value }))
                  }
                >
                  <option>API</option>
                  <option>Worker</option>
                  <option>Database</option>
                  <option>Scheduler</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="service-env">Environment</label>
                <select
                  id="service-env"
                  className="select-input"
                  value={form.env}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, env: event.target.value }))
                  }
                >
                  <option>Production</option>
                  <option>Staging</option>
                  <option>Development</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="service-region">Region</label>
                <select
                  id="service-region"
                  className="select-input"
                  value={form.region}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, region: event.target.value }))
                  }
                >
                  <option>Asia South</option>
                  <option>US East</option>
                  <option>EU West</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="service-desc">Description</label>
              <textarea
                id="service-desc"
                className="textarea-input"
                value={form.desc}
                placeholder="Short description of the service purpose and workload."
                onChange={(event) =>
                  setForm((current) => ({ ...current, desc: event.target.value }))
                }
              />
            </div>

            <div className="recent-list-item" style={{ padding: 0, border: "none", background: "transparent" }}>
              <div>
                <strong>Auto-start on deployment</strong>
                <p className="muted-text" style={{ marginTop: 6 }}>
                  Controls the initial running state when the project is created.
                </p>
              </div>
              <button
                type="button"
                className={`toggle${form.autoStart ? " active" : ""}`}
                onClick={() =>
                  setForm((current) => ({ ...current, autoStart: !current.autoStart }))
                }
                aria-pressed={form.autoStart}
              >
                <span className="toggle-knob" />
              </button>
            </div>

            <div className="button-row">
              <button type="button" className="ghost-button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="primary-button" disabled={submitting}>
                {submitting ? "Creating..." : "Create service"}
              </button>
            </div>
          </form>
        ) : null}

        <section className="panel">
          <div className="section-header">
            <div>
              <h2>Search and filter</h2>
              <p className="page-subtitle" style={{ margin: "6px 0 0" }}>
                Narrow results by name, type, state, or creation order.
              </p>
            </div>
            <button type="button" className="ghost-button" onClick={resetFilters}>
              Reset filters
            </button>
          </div>

          <div className="service-grid">
            <input
              className="text-input"
              placeholder="Search by name, type, environment, or region"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <div className="filter-row">
              <select
                className="select-input"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option>All</option>
                <option>Running</option>
                <option>Stopped</option>
                <option>Paused</option>
              </select>
              <select
                className="select-input"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <option>All</option>
                <option>API</option>
                <option>Worker</option>
                <option>Database</option>
                <option>Scheduler</option>
              </select>
              <select
                className="select-input"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
              </select>
            </div>
          </div>

          <p className="status-text" style={{ marginTop: 14 }}>
            Showing {filteredServices.length} of {services.length} services.
          </p>
        </section>

        {loading ? (
          <Loader label="Loading services..." />
        ) : error ? (
          <ErrorState
            title="Could not load services"
            message={error}
            action={
              <button type="button" className="primary-button" onClick={loadServices}>
                Try again
              </button>
            }
          />
        ) : filteredServices.length === 0 ? (
          <EmptyState
            title={services.length ? "No services match these filters" : "No services yet"}
            message={
              services.length
                ? "Try a broader query or change one of the active filters."
                : "Create your first service to start monitoring usage and predictions."
            }
            action={
              <button
                type="button"
                className="primary-button"
                onClick={() => setShowForm(true)}
              >
                Create service
              </button>
            }
          />
        ) : (
          <section className="stack">
            {filteredServices.map((service) => (
              <article key={service.id} className="service-card">
                <div style={{ flex: 1 }}>
                  <div className="button-row" style={{ justifyContent: "space-between" }}>
                    <div>
                      <strong style={{ fontSize: "1.05rem" }}>{service.name}</strong>
                      <p className="muted-text" style={{ marginTop: 6 }}>
                        {service.desc || "No description provided for this service."}
                      </p>
                    </div>
                    <span className={`badge ${getStatusBadge(service.status)}`}>{service.status}</span>
                  </div>

                  <div className="tag-row" style={{ marginTop: 14 }}>
                    <span className="tag">{service.type}</span>
                    <span className="tag">{service.env}</span>
                    <span className="tag">{service.region}</span>
                    <span className="tag">
                      Auto-start {service.autoStart ? "enabled" : "disabled"}
                    </span>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => toggleStatus(service)}
                  >
                    {service.status === "Running" ? "Stop" : "Start"}
                  </button>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => deleteService(service.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </AppShell>
  );
}
