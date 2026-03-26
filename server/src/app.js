import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import forecastRoutes from "./routes/forecast.routes.js";
import metricsRoutes from "./routes/metrics.routes.js";
import projectRoutes from "./routes/project.routes.js";
import serviceRoutes from "./routes/service.routes.js";
import { openApiSpec } from "./docs/openapi.js";
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

app.get("/api/docs/openapi.json", (req, res) => {
  res.json(openApiSpec);
});

app.get("/api/docs", (req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>CloudFore API Docs</title>
    <style>
      body { font-family: Segoe UI, Arial, sans-serif; margin: 0; background: #f8fafc; color: #0f172a; }
      main { max-width: 880px; margin: 0 auto; padding: 40px 20px; }
      .card { background: white; border-radius: 18px; padding: 24px; box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08); margin-bottom: 20px; }
      code { background: #e2e8f0; padding: 2px 6px; border-radius: 8px; }
      a { color: #0f766e; }
    </style>
  </head>
  <body>
    <main>
      <div class="card">
        <h1>CloudFore API Documentation</h1>
        <p>This project serves an OpenAPI specification you can import into Postman or Swagger tools.</p>
        <p>OpenAPI JSON: <a href="/api/docs/openapi.json">/api/docs/openapi.json</a></p>
      </div>
      <div class="card">
        <h2>Quick endpoints</h2>
        <p><code>POST /api/auth/login</code> authenticates the user and returns a JWT.</p>
        <p><code>GET /api/projects</code> supports search, filtering, sorting, and pagination.</p>
        <p><code>GET /api/metrics/live</code> returns live CPU, memory, and load values.</p>
        <p><code>GET /api/forecast</code> returns forecast values, confidence, and recommendations.</p>
      </div>
    </main>
  </body>
</html>`);
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
