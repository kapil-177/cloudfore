import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { ensureDemoUser } from "./services/auth.service.js";

const DEFAULT_PORT = Number(process.env.PORT) || 5000;
const MAX_PORT_ATTEMPTS = 10;

function listenOnPort(port) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => resolve({ server, port }));
    server.on("error", reject);
  });
}

async function startListening(startPort) {
  for (let attempt = 0; attempt < MAX_PORT_ATTEMPTS; attempt += 1) {
    const port = startPort + attempt;

    try {
      const result = await listenOnPort(port);

      if (port !== startPort) {
        console.warn(`Port ${startPort} was busy, using ${port} instead`);
      }

      return result;
    } catch (error) {
      if (error.code !== "EADDRINUSE" || attempt === MAX_PORT_ATTEMPTS - 1) {
        throw error;
      }
    }
  }

  throw new Error("No available port found for the server");
}

async function startServer() {
  try {
    await connectDatabase();
    console.log("Database connected");

    await ensureDemoUser();
    console.log("Demo user ensured");

    const { port } = await startListening(DEFAULT_PORT);
    console.log(`Server running on port ${port}`);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

/* Handle unexpected crashes so server doesn't silently die */

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});
