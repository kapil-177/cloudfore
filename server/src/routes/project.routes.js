import express from "express";
import { body, param } from "express-validator";

import authMiddleware from "../middlewares/auth.middleware.js";
import validateRequest from "../middlewares/validate.middleware.js";
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  getProjectStats,
  updateProject
} from "../controllers/project.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getProjects);
router.get("/stats/summary", getProjectStats);
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Valid project id is required")],
  validateRequest,
  getProjectById
);
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("desc").optional().isString(),
    body("description").optional().isString(),
    body("status").optional().isIn(["Running", "Stopped", "Paused"]),
    body("type").optional().isString(),
    body("env").optional().isString(),
    body("environment").optional().isString(),
    body("region").optional().isString(),
    body("autoStart").optional().isBoolean()
  ],
  validateRequest,
  createProject
);
router.put(
  "/:id",
  [
    param("id").isMongoId().withMessage("Valid project id is required"),
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("status").optional().isIn(["Running", "Stopped", "Paused"]),
    body("autoStart").optional().isBoolean()
  ],
  validateRequest,
  updateProject
);
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Valid project id is required")],
  validateRequest,
  deleteProject
);

export default router;
