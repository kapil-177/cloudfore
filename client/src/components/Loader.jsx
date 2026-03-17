export default function Loader({
  label = "Loading...",
  fullPage = false,
  compact = false
}) {
  return (
    <div
      style={{
        ...styles.wrap,
        ...(fullPage ? styles.fullPage : {}),
        ...(compact ? styles.compact : {})
      }}
    >
      <div style={styles.spinner} />
      <p style={styles.label}>{label}</p>
    </div>
  );
}

export function EmptyState({
  title = "Nothing to show",
  message = "There is no data available yet.",
  action
}) {
  return (
    <div style={styles.panel}>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.message}>{message}</p>
      {action || null}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message = "Please try again.",
  action
}) {
  return (
    <div style={{ ...styles.panel, ...styles.errorPanel }}>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.message}>{message}</p>
      {action || null}
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: 120,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    color: "var(--text-soft)"
  },
  fullPage: {
    minHeight: "100vh",
    background: "var(--page-gradient)",
    fontFamily: "var(--font-sans)"
  },
  compact: {
    minHeight: 72
  },
  spinner: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "3px solid var(--border)",
    borderTopColor: "var(--primary)",
    animation: "cloudfore-spin 0.8s linear infinite"
  },
  label: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600
  },
  panel: {
    background: "var(--surface)",
    borderRadius: 18,
    padding: 24,
    boxShadow: "var(--shadow-md)",
    color: "var(--text-soft)",
    border: "1px solid var(--border)"
  },
  errorPanel: {
    background: "var(--danger-soft)",
    border: "1px solid rgba(251, 146, 60, 0.2)"
  },
  title: {
    marginTop: 0,
    marginBottom: 8,
    fontSize: 18
  },
  message: {
    marginTop: 0,
    marginBottom: 0,
    lineHeight: 1.5
  }
};

if (typeof document !== "undefined" && !document.getElementById("cloudfore-loader-styles")) {
  const styleTag = document.createElement("style");
  styleTag.id = "cloudfore-loader-styles";
  styleTag.textContent = "@keyframes cloudfore-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }";
  document.head.appendChild(styleTag);
}
