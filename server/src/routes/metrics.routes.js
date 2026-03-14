import express from "express";

import authMiddleware from "../middlewares/auth.middleware.js";
import { getLiveMetrics, getMetricsHistory } from "../controllers/metrics.controller.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/live", getLiveMetrics);
router.get("/history", getMetricsHistory);

export default router;
