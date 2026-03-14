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

  async function handleSubmit(e) {
    e.preventDefault();
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
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          ☁️
        </div>

        <h2 style={styles.title}>Cloud Resource Forecasting</h2>
        <p style={styles.sub}>Predict. Plan. Optimize.</p>

        <form onSubmit={handleSubmit}>
          <input
            style={styles.input}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            style={styles.button}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "translateY(-2px)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
            disabled={submitting}
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>
        <p style={styles.hint}>Demo: demo@cloudfore.dev / demo12345</p>
        {error ? <p style={styles.error}>{error}</p> : null}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle at top left, #c7f0ff, #e9e7ff, #ffe6fa)",
    fontFamily: "system-ui"
  },

  card: {
    width: 360,
    padding: "36px 32px",
    borderRadius: 20,
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 30px 60px rgba(0,0,0,0.12)",
    textAlign: "center"
  },

  iconWrap: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: 700,
    color: "#4f46e5"
  },

  title: {
    marginBottom: 6
  },

  sub: {
    marginBottom: 24,
    color: "#6b7280",
    fontSize: 14
  },

input: {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  marginBottom: 14,
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  outline: "none",
  fontSize: 14,
  display: "block"
},

  button: {
    width: "100%",
    padding: "12px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(90deg,#0ea5e9,#6366f1)",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all .2s ease",
    boxShadow: "0 10px 20px rgba(99,102,241,0.35)"
  },

  hint: {
    marginTop: 16,
    marginBottom: 0,
    color: "#6b7280",
    fontSize: 13
  },

  error: {
    marginTop: 12,
    marginBottom: 0,
    color: "#dc2626",
    fontSize: 13
  }
};
