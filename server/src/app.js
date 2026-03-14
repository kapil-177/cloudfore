import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import forecastRoutes from "./routes/forecast.routes.js";
import metricsRoutes from "./routes/metrics.routes.js";
import projectRoutes from "./routes/project.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import {
  getCpuUsage,
  getMemoryUsage,
  getSystemLoad
} from "./controllers/metrics.controller.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(",") || "*"
  })
);
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CloudFore API running"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    uptime: process.uptime()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/metrics", metricsRoutes);
app.use("/api/forecast", forecastRoutes);

app.get("/api/system/cpu", getCpuUsage);
app.get("/api/system/memory", getMemoryUsage);
app.get("/api/system/load", getSystemLoad);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
