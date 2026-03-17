import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Loader from "./Loader";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    return <Loader fullPage label="Restoring your session..." />;
  }

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
