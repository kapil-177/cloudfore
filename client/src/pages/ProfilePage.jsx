import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";

function ProfileAvatar({ name, src }) {
  if (src) {
    return (
      <img
        className="avatar"
        style={{ width: 88, height: 88, borderRadius: 24 }}
        src={src}
        alt="Profile avatar"
      />
    );
  }

  const initials = (name || "Cloud Admin")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="avatar"
      style={{
        width: 88,
        height: 88,
        borderRadius: 24,
        display: "grid",
        placeItems: "center",
        fontWeight: 800
      }}
    >
      {initials}
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <AppShell
      title="Profile"
      subtitle="Present the project owner details and the operational context behind your cloud forecasting dashboard."
    >
      <div className="content-grid">
        <section className="panel">
          <div className="section-header">
            <div>
              <h2>Operator identity</h2>
              <p className="page-subtitle" style={{ margin: "6px 0 0" }}>
                Useful for your viva when explaining who uses the platform and what access they have.
              </p>
            </div>
          </div>

          <div className="recent-list-item" style={{ alignItems: "center" }}>
            <ProfileAvatar name={user?.name || "Cloud Admin"} src={user?.avatarUrl} />
            <div>
              <h3 style={{ margin: 0 }}>{user?.name || "Cloud Admin"}</h3>
              <p className="page-subtitle" style={{ margin: "6px 0 0" }}>
                {user?.role || "Administrator"} responsible for monitoring and forecasting usage.
              </p>
            </div>
          </div>

          <div className="stack" style={{ marginTop: 18 }}>
            <article className="service-card">
              <div>
                <strong>Email</strong>
                <p className="muted-text" style={{ marginTop: 6 }}>{user?.email || "demo@cloudfore.dev"}</p>
              </div>
              <span className="badge neutral">Primary login</span>
            </article>
            <article className="service-card">
              <div>
                <strong>Project focus</strong>
                <p className="muted-text" style={{ marginTop: 6 }}>
                  {user?.projectName || "Cloud Resource Forecasting"}
                </p>
              </div>
              <span className="badge success">Active</span>
            </article>
            <article className="service-card">
              <div>
                <strong>Access level</strong>
                <p className="muted-text" style={{ marginTop: 6 }}>
                  Full CRUD access for services, metrics, forecasts, and settings.
                </p>
              </div>
              <span className="badge neutral">{user?.role || "Admin"}</span>
            </article>
          </div>
        </section>

        <section className="panel">
          <div className="section-header">
            <div>
              <h2>Viva-ready summary</h2>
              <p className="page-subtitle" style={{ margin: "6px 0 0" }}>
                Simple talking points you can use while presenting the user flow.
              </p>
            </div>
          </div>

          <div className="stack">
            <div className="tag">Login is JWT-based and session-aware.</div>
            <div className="tag">User settings can toggle dark mode and forecast preferences.</div>
            <div className="tag">Profile data is restored from the protected `/auth/me` endpoint.</div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
