import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: "OV" },
  { to: "/services", label: "Services", icon: "SV" },
  { to: "/metrics", label: "Metrics", icon: "MT" },
  { to: "/forecast", label: "Forecast", icon: "FC" },
  { to: "/profile", label: "Profile", icon: "PF" },
  { to: "/settings", label: "Settings", icon: "ST" }
];

function titleFromPath(pathname) {
  const match = navItems.find((item) => pathname.startsWith(item.to));
  return match?.label || "Dashboard";
}

function Avatar({ name, src }) {
  if (src) {
    return <img className="avatar" src={src} alt={`${name} avatar`} />;
  }

  const initials = (name || "Cloud Fore")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="avatar" style={{ display: "grid", placeItems: "center", fontWeight: 800 }}>
      {initials}
    </div>
  );
}

export default function AppShell({
  title,
  subtitle,
  actions,
  children
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, updateUser } = useAuth();

  function toggleTheme() {
    const nextUser = user || {
      name: "Cloud Admin",
      email: "demo@cloudfore.dev",
      settings: {}
    };

    updateUser({
      ...nextUser,
      settings: {
        ...nextUser.settings,
        darkMode: !nextUser.settings?.darkMode
      }
    });
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-brand">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="brand-mark">CF</div>
            <div className="brand-copy">
              <h1>CloudFore</h1>
              <p>Forecast cloud demand</p>
            </div>
          </div>

          <button
            type="button"
            className="icon-button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={user?.settings?.darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {user?.settings?.darkMode ? "LM" : "DM"}
          </button>
        </div>

        <nav className="nav-list" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="panel" style={{ padding: 18 }}>
            <span className="section-label">Workspace health</span>
            <div className="stack" style={{ gap: 10 }}>
              <div className="tag">Forecast engine active</div>
              <div className="tag">MongoDB ready</div>
              <div className="tag">JWT protected routes</div>
            </div>
          </div>

          <div className="user-chip">
            <Avatar name={user?.name || "Cloud Admin"} src={user?.avatarUrl} />
            <div style={{ minWidth: 0 }}>
              <strong style={{ display: "block" }}>{user?.name || "Cloud Admin"}</strong>
              <p className="muted-text">{user?.email || "demo@cloudfore.dev"}</p>
            </div>
          </div>

          <div className="button-row">
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/settings")}
            >
              Preferences
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="app-main">
        <header className="topbar">
          <div>
            <span className="eyebrow">{titleFromPath(location.pathname)}</span>
            <h1 className="page-title">{title}</h1>
            <p className="page-subtitle">{subtitle}</p>
          </div>

          {actions ? <div className="topbar-actions">{actions}</div> : null}
        </header>

        {children}
      </main>
    </div>
  );
}
