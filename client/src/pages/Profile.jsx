import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <img
          src={user?.avatarUrl || "https://imgs.search.brave.com/uhxR84AKTPc100FWNQT_cGv_u3Bnpbg3RA9HNmMJ6c0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzFiLzU5/LzdkLzFiNTk3ZDZj/MWJhZjMwNmQzZTk0/NWQxMmRmZWZjYzI0/LmpwZw"}
          alt="profile"
          style={styles.avatar}
        />

        <h2 style={{ marginBottom: 4 }}>{user?.name || "Cloud Admin"}</h2>
        <p style={styles.role}>{user?.role || "Cloud Administrator"}</p>

        <div style={styles.infoBox}>
          <div style={styles.row}>
            <span>Email</span>
            <strong>{user?.email || "demo@cloudfore.dev"}</strong>
          </div>

          <div style={styles.row}>
            <span>Project</span>
            <strong>{user?.projectName || "Cloud Resource Forecasting"}</strong>
          </div>

          <div style={styles.row}>
            <span>Access Level</span>
            <strong>{user?.role || "Admin"}</strong>
          </div>
        </div>

        <button
          style={styles.btn}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 12px 25px rgba(79,70,229,.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 8px 18px rgba(79,70,229,.25)";
          }}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "radial-gradient(circle at top right, #dbeafe, #eef2ff, #ffffff)",
    fontFamily: "system-ui"
  },

  card: {
    width: 360,
    padding: 30,
    borderRadius: 20,
    background: "white",
    textAlign: "center",
    boxShadow: "0 25px 50px rgba(0,0,0,0.12)"
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: 12,
    border: "3px solid #6366f1"
  },

  role: {
    marginBottom: 20,
    color: "#6b7280",
    fontSize: 14
  },

  infoBox: {
    background: "#f9fafb",
    borderRadius: 12,
    padding: 14,
    marginBottom: 18
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
    fontSize: 14
  },

  btn: {
    width: "100%",
    border: "none",
    borderRadius: 10,
    padding: "12px 0",
    cursor: "pointer",
    background: "linear-gradient(90deg,#2563eb,#4f46e5)",
    color: "white",
    fontWeight: 600,
    transition: "all .2s ease",
    boxShadow: "0 8px 18px rgba(79,70,229,.25)"
  }
};
