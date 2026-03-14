import { validationResult } from "express-validator";

import AppError from "../utils/AppError.js";

export default function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return next(new AppError("Validation failed", 400, errors.array()));
}
