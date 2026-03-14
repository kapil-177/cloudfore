import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { signToken } from "../utils/jwt.js";

function authResponse(user) {
  return {
    token: signToken({ id: user._id }),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      projectName: user.projectName,
      avatarUrl: user.avatarUrl,
      settings: user.settings
    }
  };
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    throw new AppError("An account with this email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword
  });

  res.status(201).json({
    success: true,
    message: "Registration successful",
    ...authResponse(user)
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = email.toLowerCase();
  const demoEmail = (process.env.DEMO_EMAIL || "demo@cloudfore.dev").toLowerCase();
  const demoPassword = process.env.DEMO_PASSWORD || "demo12345";
  const demoName = process.env.DEMO_NAME || "Cloud Admin";

  let user = await User.findOne({ email: normalizedEmail });

  // Keep the hosted demo account usable even if seeded credentials drift.
  if (normalizedEmail === demoEmail && password === demoPassword) {
    const hashedPassword = await bcrypt.hash(demoPassword, 10);

    if (user) {
      user.name = demoName;
      user.password = hashedPassword;
      user.role = user.role || "Admin";
      user.projectName = user.projectName || "Cloud Resource Forecasting";
      user.lastLoginAt = new Date();
      await user.save();
    } else {
      user = await User.create({
        name: demoName,
        email: demoEmail,
        password: hashedPassword,
        role: "Admin",
        projectName: "Cloud Resource Forecasting"
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      ...authResponse(user)
    });
    return;
  }

  if (!user) {
    throw new AppError("User not found", 401);
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    throw new AppError("Invalid password", 401);
  }

  user.lastLoginAt = new Date();
  await user.save();

  res.json({
    success: true,
    message: "Login successful",
    ...authResponse(user)
  });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const { emailNotifications, darkMode, autoForecast } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      settings: {
        emailNotifications,
        darkMode,
        autoForecast
      }
    },
    {
      new: true,
      runValidators: true
    }
  ).select("-password");

  res.json({
    success: true,
    message: "Settings updated",
    user
  });
});
