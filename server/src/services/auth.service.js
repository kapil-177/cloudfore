import bcrypt from "bcryptjs";

import User from "../models/user.model.js";

export async function ensureDemoUser() {
  const email = process.env.DEMO_EMAIL || "demo@cloudfore.dev";
  const password = process.env.DEMO_PASSWORD || "demo12345";
  const name = process.env.DEMO_NAME || "Cloud Admin";
  const normalizedEmail = email.toLowerCase();
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    existingUser.name = name;
    existingUser.email = normalizedEmail;
    existingUser.password = hashedPassword;
    existingUser.role = existingUser.role || "Admin";
    existingUser.projectName = existingUser.projectName || "Cloud Resource Forecasting";

    await existingUser.save();
    return existingUser;
  }

  return User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword
  });
}
