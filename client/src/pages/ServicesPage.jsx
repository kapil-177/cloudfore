import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  createServiceApi,
  deleteServiceApi,
  getServicesApi,
  updateServiceApi
} from "../api/serviceApi";
import AppShell from "../components/AppShell";
import Loader, { EmptyState, ErrorState } from "../components/Loader";
import { useToast } from "../context/ToastContext";

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

const defaultPagination = {
  page: 1,
  limit: 6,
  totalItems: 0,
  totalPages: 1
};

export default function ServicesPage() {
  const location = useLocation();
  const { showToast } = useToast();
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
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(defaultPagination);

  useEffect(() => {
    if (location.state?.openCreate) {
      setShowForm(true);
    }
  }, [location.state]);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, statusFilter, typeFilter]);

  const loadServices = useCallback(async (nextPage = page) => {
    try {
      setLoading(true);
      const response = await getServicesApi({
        page: nextPage,
        limit: pagination.limit,
        search: search || undefined,
        status: statusFilter === "All" ? undefined : statusFilter,
        type: typeFilter === "All" ? undefined : typeFilter,
        sort: sortBy
      });
      setServices(response.data.data || []);
      setPagination(response.data.pagination || defaultPagination);
      setPage(response.data.pagination?.page || nextPage);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  }, [page, pagination.limit, search, sortBy, statusFilter, typeFilter]);

  useEffect(() => {
    loadServices(page);
  }, [loadServices, page]);

  async function addService(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Service name is required");
      showToast({
        title: "Service name required",
        description: "Add a name before creating the service.",
        tone: "error"
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await createServiceApi(form);
      setForm(initialForm);
      setShowForm(false);
      setError("");
      showToast({
        title: "Service created",
        description: `${response.data.data.name} was added successfully.`,
        tone: "success"
      });
      await loadServices(1);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create service";
      setError(message);
      showToast({
        title: "Create failed",
        description: message,
        tone: "error"
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteService(id) {
    try {
      await deleteServiceApi(id);
      showToast({
        title: "Service deleted",
        description: "The service has been removed from the workspace.",
        tone: "success"
      });
      const nextPage = services.length === 1 && page > 1 ? page - 1 : page;
      await loadServices(nextPage);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete service";
      setError(message);
      showToast({
        title: "Delete failed",
        description: message,
        tone: "error"
      });
    }
  }

  async function toggleStatus(service) {
    const nextStatus = service.status === "Running" ? "Stopped" : "Running";

    try {
      const response = await updateServiceApi(service.id, { status: nextStatus });
      setServices((current) =>
        current.map((item) => (item.id === service.id ? response.data.data : item))
      );
      showToast({
        title: `Service ${nextStatus === "Running" ? "started" : "stopped"}`,
        description: `${service.name} is now ${nextStatus}.`,
        tone: "success"
      });
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update service";
      setError(message);
      showToast({
        title: "Status update failed",
        description: message,
        tone: "error"
      });
    }
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("All");
    setTypeFilter("All");
    setSortBy("newest");
    setPage(1);
  }

  return (
    <AppShell
      title="Service control"
      subtitle="Manage your cloud resources with cleaner workflows, server-side filtering, and paginated results."
      actions={
        <>
          <button
            type="button"
            className="secondary-button"
            onClick={() => loadServices(page)}
          >
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
            Showing page {pagination.page} of {pagination.totalPages}. {pagination.totalItems} matching services found.
          </p>
        </section>

        {loading ? (
          <Loader label="Loading services..." />
        ) : error ? (
          <ErrorState
            title="Could not load services"
            message={error}
            action={
              <button
                type="button"
                className="primary-button"
                onClick={() => loadServices(page)}
              >
                Try again
              </button>
            }
          />
        ) : services.length === 0 ? (
          <EmptyState
            title={pagination.totalItems ? "No services on this page" : "No services yet"}
            message={
              pagination.totalItems
                ? "Try moving back a page or changing the current filters."
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
            {services.map((service) => (
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

            <div className="panel">
              <div className="section-header" style={{ marginBottom: 0 }}>
                <div>
                  <h3>Pagination</h3>
                  <p className="page-subtitle" style={{ margin: "6px 0 0" }}>
                    Smaller result sets keep the interface fast as the dataset grows.
                  </p>
                </div>
                <div className="button-row">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setPage((current) => Math.max(current - 1, 1))}
                    disabled={pagination.page <= 1}
                  >
                    Previous
                  </button>
                  <span className="tag">
                    Page {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      setPage((current) => Math.min(current + 1, pagination.totalPages))
                    }
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
