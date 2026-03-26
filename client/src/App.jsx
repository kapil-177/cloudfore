import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import RouteFallback from "./components/RouteFallback";

const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/DashboardPage"));
const Services = lazy(() => import("./pages/ServicesPage"));
const Metrics = lazy(() => import("./pages/MetricsPage"));
const Forecast = lazy(() => import("./pages/ForecastPage"));
const Profile = lazy(() => import("./pages/ProfilePage"));
const Settings = lazy(() => import("./pages/SettingsPage"));

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
        <Route path="/metrics" element={<ProtectedRoute><Metrics /></ProtectedRoute>} />
        <Route path="/forecast" element={<ProtectedRoute><Forecast /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
    </Suspense>
  );
}
