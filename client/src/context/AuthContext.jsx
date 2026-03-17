import { createContext, useContext, useEffect, useState } from "react";

import { getCurrentUserApi, loginApi } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("cloudfore_token"));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("cloudfore_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const darkMode = user?.settings?.darkMode;
    document.documentElement.dataset.theme = darkMode ? "dark" : "light";
  }, [user?.settings?.darkMode]);

  useEffect(() => {
    async function restoreSession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUserApi();
        setUser(response.data.user);
        localStorage.setItem("cloudfore_user", JSON.stringify(response.data.user));
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, [token]);

  async function login(credentials) {
    const response = await loginApi(credentials);
    const nextToken = response.data.token;
    const nextUser = response.data.user;

    localStorage.setItem("cloudfore_token", nextToken);
    localStorage.setItem("cloudfore_user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);

    return response.data;
  }

  function logout() {
    localStorage.removeItem("cloudfore_token");
    localStorage.removeItem("cloudfore_user");
    localStorage.removeItem("services");
    setToken(null);
    setUser(null);
    setLoading(false);
  }

  function updateUser(nextUser) {
    setUser(nextUser);
    localStorage.setItem("cloudfore_user", JSON.stringify(nextUser));
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
