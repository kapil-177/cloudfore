import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { ensureDemoUser } from "./services/auth.service.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDatabase();
  await ensureDemoUser();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
