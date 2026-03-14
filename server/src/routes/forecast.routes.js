import express from "express";

import authMiddleware from "../middlewares/auth.middleware.js";
import { getForecastOverview } from "../controllers/forecast.controller.js";

const router = express.Router();

router.use(authMiddleware);
router.get("/", getForecastOverview);

export default router;
