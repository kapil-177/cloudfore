import { useState } from "react";

import { updateSettingsApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [emailNotif, setEmailNotif] = useState(user?.settings?.emailNotifications ?? true);
  const [darkMode, setDarkMode] = useState(user?.settings?.darkMode ?? false);
  const [autoForecast, setAutoForecast] = useState(user?.settings?.autoForecast ?? true);
  const [message, setMessage] = useState("");

  async function saveSettings() {
    try {
      const response = await updateSettingsApi({
        emailNotifications: emailNotif,
        darkMode,
        autoForecast
      });

      updateUser(response.data.user);
      setMessage("Settings saved");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save settings");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Settings</h2>
        <p style={styles.sub}>Manage your preferences</p>

        <div style={styles.row}>
          <span>Email notifications</span>
          <Toggle
            value={emailNotif}
            onChange={() => setEmailNotif(!emailNotif)}
          />
        </div>

        <div style={styles.row}>
          <span>Enable dark mode (UI only)</span>
          <Toggle
            value={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
        </div>

        <div style={styles.row}>
          <span>Auto run forecast every day</span>
          <Toggle
            value={autoForecast}
            onChange={() => setAutoForecast(!autoForecast)}
          />
        </div>

        <button style={styles.btn} onClick={saveSettings}>Save settings</button>
        {message ? <p style={styles.message}>{message}</p> : null}
      </div>
    </div>
  );
}

/* ---------- Toggle ---------- */

function Toggle({ value, onChange }) {
  return (
    <div
      onClick={onChange}
      style={{
        ...styles.switch,
        background: value
          ? "linear-gradient(135deg,#22c55e,#16a34a)" // ON colour
          : "#e5e7eb"                                 // OFF colour
      }}
    >
      <div
        style={{
          ...styles.knob,
          transform: value ? "translateX(22px)" : "translateX(2px)"
        }}
      />
    </div>
  );
}

/* ---------- Styles ---------- */

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle at top right, #dbeafe, #eef2ff, #ffffff)",
    fontFamily: "system-ui"
  },

  card: {
    width: 420,
    background: "white",
    borderRadius: 18,
    padding: 28,
    boxShadow: "0 25px 60px rgba(0,0,0,0.12)"
  },

  title: {
    marginBottom: 4
  },

  sub: {
    color: "#6b7280",
    marginBottom: 22
  },

  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 14
  },

  switch: {
    width: 44,
    height: 24,
    borderRadius: 999,
    cursor: "pointer",
    position: "relative",
    transition: "background 0.25s ease"
  },

  knob: {
    width: 20,
    height: 20,
    background: "white",
    borderRadius: "50%",
    position: "absolute",
    top: 2,
    left: 0,
    transition: "transform 0.25s ease",
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
  },

  btn: {
    marginTop: 22,
    width: "100%",
    padding: "12px 0",
    border: "none",
    borderRadius: 12,
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
    background: "linear-gradient(135deg,#2563eb,#4f46e5)"
  },

  message: {
    marginTop: 12,
    marginBottom: 0,
    fontSize: 13,
    color: "#2563eb"
  }
};
