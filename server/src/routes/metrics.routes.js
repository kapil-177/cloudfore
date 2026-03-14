import { Router } from "express";
import {
  getLiveMetrics,
  getMetricsHistory
} from "../controllers/metrics.controller.js";

const router = Router();

router.get("/live", getLiveMetrics);
router.get("/history", getMetricsHistory);

export default router;
