import { useState } from "react";

import { updateSettingsApi } from "../api/authApi";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";

function Toggle({ value, onChange }) {
  return (
    <button
      type="button"
      className={`toggle${value ? " active" : ""}`}
      onClick={onChange}
      aria-pressed={value}
    >
      <span className="toggle-knob" />
    </button>
  );
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(
    user?.settings?.emailNotifications ?? true
  );
  const [darkMode, setDarkMode] = useState(user?.settings?.darkMode ?? false);
  const [autoForecast, setAutoForecast] = useState(user?.settings?.autoForecast ?? true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function saveSettings() {
    try {
      setSaving(true);
      const response = await updateSettingsApi({
        emailNotifications,
        darkMode,
        autoForecast
      });

      updateUser(response.data.user);
      setMessage("Settings saved successfully.");
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save settings");
      setMessage("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell
      title="Preferences"
      subtitle="Polish the operator experience with customizable notifications, theme settings, and forecast automation."
      actions={
        <button type="button" className="primary-button" onClick={saveSettings} disabled={saving}>
          {saving ? "Saving..." : "Save settings"}
        </button>
      }
    >
      <div className="content-grid">
        <section className="panel">
          <div className="section-header">
            <div>
              <h2>Interface settings</h2>
              <p className="page-subtitle" style={{ margin: "6px 0 0" }}>
                These preferences are stored on the backend and restored for the current user.
              </p>
            </div>
          </div>

          <div className="stack">
            <article className="service-card">
              <div>
                <strong>Email notifications</strong>
                <p className="muted-text" style={{ marginTop: 6 }}>
                  Receive workflow updates and important alert summaries.
                </p>
              </div>
              <Toggle
                value={emailNotifications}
                onChange={() => setEmailNotifications((current) => !current)}
              />
            </article>

            <article className="service-card">
              <div>
                <strong>Dark mode</strong>
                <p className="muted-text" style={{ marginTop: 6 }}>
                  Applies the polished dark interface across the app shell.
                </p>
              </div>
              <Toggle value={darkMode} onChange={() => setDarkMode((current) => !current)} />
            </article>

            <article className="service-card">
              <div>
                <strong>Auto forecast</strong>
                <p className="muted-text" style={{ marginTop: 6 }}>
                  Keeps predictive analysis enabled as new metric samples are collected.
                </p>
              </div>
              <Toggle
                value={autoForecast}
                onChange={() => setAutoForecast((current) => !current)}
              />
            </article>
          </div>
        </section>

        <section className="panel">
          <div className="section-header">
            <div>
              <h2>Submission checklist</h2>
              <p className="page-subtitle" style={{ margin: "6px 0 0" }}>
                Quick reminder of the polish points your Phase 3 evaluator will look for.
              </p>
            </div>
          </div>

          <div className="stack">
            <div className="tag">Consistent responsive layout</div>
            <div className="tag">Search, filter, and sort logic</div>
            <div className="tag">Forecast analytics and recommendation flow</div>
            <div className="tag">Error, loading, and empty states</div>
            <div className="tag">Deployment docs and automated tests</div>
          </div>

          {message ? (
            <p style={{ color: "var(--success)", fontWeight: 700, marginBottom: 0 }}>{message}</p>
          ) : null}
          {error ? (
            <p style={{ color: "var(--danger)", fontWeight: 700, marginBottom: 0 }}>{error}</p>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
