import Project from "../models/project.model.js";
import AppError from "../utils/AppError.js";

export async function listProjectsByUser(userId) {
  return Project.find({ owner: userId }).sort({ createdAt: -1 }).lean();
}

export async function getProjectForUser(projectId, userId) {
  const project = await Project.findOne({ _id: projectId, owner: userId });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  return project;
}

export async function createProjectForUser(payload, userId) {
  return Project.create({
    ...payload,
    owner: userId
  });
}

export async function updateProjectForUser(projectId, userId, payload) {
  const project = await Project.findOneAndUpdate(
    { _id: projectId, owner: userId },
    payload,
    { new: true, runValidators: true }
  );

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  return project;
}

export async function deleteProjectForUser(projectId, userId) {
  const project = await Project.findOneAndDelete({ _id: projectId, owner: userId });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  return project;
}
