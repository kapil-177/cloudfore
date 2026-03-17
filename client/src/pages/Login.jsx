import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("demo@cloudfore.dev");
  const [password, setPassword] = useState("demo12345");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <section className="auth-hero">
          <div>
            <h1 className="auth-title">Forecast cloud usage before costs spike.</h1>
            <p className="auth-copy">
              CloudFore combines service tracking, live infrastructure metrics,
              and short-term forecasting in one clean control room.
            </p>
          </div>

          <div className="auth-stat-grid">
            <div className="stat-chip">
              <span>Monitoring</span>
              <strong>5s live refresh</strong>
            </div>
            <div className="stat-chip">
              <span>Insights</span>
              <strong>CPU + memory trends</strong>
            </div>
            <div className="stat-chip">
              <span>Planning</span>
              <strong>Forecast recommendations</strong>
            </div>
          </div>
        </section>

        <section className="auth-panel">
          <span className="eyebrow">Secure access</span>
          <h2 style={{ margin: "16px 0 8px", fontFamily: "var(--font-display)", fontSize: "2rem" }}>
            Welcome back
          </h2>
          <p className="page-subtitle" style={{ marginBottom: 24 }}>
            Sign in to review live metrics, manage services, and prepare your deployment demo.
          </p>

          <form className="stack" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className="text-input"
                placeholder="demo@cloudfore.dev"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="text-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? "Signing in..." : "Enter dashboard"}
            </button>
          </form>

          <div className="panel" style={{ marginTop: 20, padding: 18 }}>
            <span className="section-label">Demo credentials</span>
            <strong style={{ display: "block", marginBottom: 6 }}>demo@cloudfore.dev</strong>
            <p className="muted-text" style={{ marginTop: 0 }}>Password: demo12345</p>
          </div>

          {error ? (
            <p style={{ margin: "14px 0 0", color: "var(--danger)", fontWeight: 600 }}>
              {error}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
