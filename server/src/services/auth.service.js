import bcrypt from "bcryptjs";

import User from "../models/user.model.js";

export async function ensureDemoUser() {
  const email = process.env.DEMO_EMAIL || "demo@cloudfore.dev";
  const password = process.env.DEMO_PASSWORD || "demo12345";
  const name = process.env.DEMO_NAME || "Cloud Admin";

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return existingUser;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return User.create({
    name,
    email,
    password: hashedPassword
  });
}
