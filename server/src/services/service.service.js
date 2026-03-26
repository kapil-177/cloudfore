import Project from "../models/project.model.js";
import AppError from "../utils/AppError.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getSortOrder(sort) {
  if (sort === "name-asc") {
    return { name: 1, createdAt: -1 };
  }

  if (sort === "name-desc") {
    return { name: -1, createdAt: -1 };
  }

  if (sort === "oldest") {
    return { createdAt: 1 };
  }

  return { createdAt: -1 };
}

export async function listProjectsByUser(userId, options = {}) {
  const page = Math.max(Number(options.page) || 1, 1);
  const limit = Math.min(Math.max(Number(options.limit) || 6, 1), 24);
  const search = String(options.search || "").trim();
  const query = { owner: userId };

  if (options.status) {
    query.status = options.status;
  }

  if (options.type) {
    query.type = options.type;
  }

  if (search) {
    const matcher = new RegExp(escapeRegex(search), "i");
    query.$or = [
      { name: matcher },
      { description: matcher },
      { type: matcher },
      { environment: matcher },
      { region: matcher }
    ];
  }

  const [items, totalItems] = await Promise.all([
    Project.find(query)
      .sort(getSortOrder(options.sort))
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Project.countDocuments(query)
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.max(Math.ceil(totalItems / limit), 1)
    }
  };
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
