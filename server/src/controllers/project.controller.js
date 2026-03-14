import Project from "../models/project.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createProjectForUser,
  deleteProjectForUser,
  getProjectForUser,
  listProjectsByUser,
  updateProjectForUser
} from "../services/service.service.js";
import { captureMetricSample } from "../services/metrics.service.js";
import { generateForecast } from "../services/forecast.service.js";

function normalizeProject(project) {
  return {
    id: project._id,
    name: project.name,
    desc: project.description,
    description: project.description,
    status: project.status,
    type: project.type,
    env: project.environment,
    environment: project.environment,
    region: project.region,
    autoStart: project.autoStart,
    currentUsage: project.currentUsage,
    forecastSummary: project.forecastSummary,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  };
}

export const getProjects = asyncHandler(async (req, res) => {
  const projects = await listProjectsByUser(req.user._id);

  res.json({
    success: true,
    count: projects.length,
    data: projects.map(normalizeProject)
  });
});

export const getProjectById = asyncHandler(async (req, res) => {
  const project = await getProjectForUser(req.params.id, req.user._id);

  res.json({
    success: true,
    data: normalizeProject(project)
  });
});

export const createProject = asyncHandler(async (req, res) => {
  const payload = {
    name: req.body.name,
    description: req.body.desc ?? req.body.description ?? "",
    status: req.body.status || (req.body.autoStart === false ? "Stopped" : "Running"),
    type: req.body.type || "API",
    environment: req.body.env ?? req.body.environment ?? "Production",
    region: req.body.region || "Asia South",
    autoStart: req.body.autoStart ?? true
  };

  const project = await createProjectForUser(payload, req.user._id);
  await captureMetricSample(project._id);
  const forecast = await generateForecast(project._id);
  const updatedProject = await Project.findById(project._id).lean();

  res.status(201).json({
    success: true,
    message: "Project created successfully",
    data: normalizeProject(updatedProject),
    forecast: forecast.summary
  });
});

export const updateProject = asyncHandler(async (req, res) => {
  const payload = {
    ...(req.body.name !== undefined ? { name: req.body.name } : {}),
    ...(req.body.desc !== undefined || req.body.description !== undefined
      ? { description: req.body.desc ?? req.body.description }
      : {}),
    ...(req.body.status !== undefined ? { status: req.body.status } : {}),
    ...(req.body.type !== undefined ? { type: req.body.type } : {}),
    ...(req.body.env !== undefined || req.body.environment !== undefined
      ? { environment: req.body.env ?? req.body.environment }
      : {}),
    ...(req.body.region !== undefined ? { region: req.body.region } : {}),
    ...(req.body.autoStart !== undefined ? { autoStart: req.body.autoStart } : {})
  };

  const project = await updateProjectForUser(req.params.id, req.user._id, payload);
  await captureMetricSample(project._id);
  await generateForecast(project._id);

  res.json({
    success: true,
    message: "Project updated successfully",
    data: normalizeProject(project)
  });
});

export const deleteProject = asyncHandler(async (req, res) => {
  await deleteProjectForUser(req.params.id, req.user._id);

  res.json({
    success: true,
    message: "Project deleted successfully"
  });
});

export const getProjectStats = asyncHandler(async (req, res) => {
  const projects = await listProjectsByUser(req.user._id);
  const activeProjects = projects.filter((project) => project.status === "Running").length;

  res.json({
    success: true,
    data: {
      totalProjects: projects.length,
      activeProjects,
      stoppedProjects: projects.length - activeProjects
    }
  });
});
