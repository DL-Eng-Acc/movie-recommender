import { createApp } from "./app.js";
import { connectDatabase } from "./config/config.js";

export async function startServer({
  databaseConnector = connectDatabase,
  appFactory = createApp,
  port = process.env.BACKEND_PORT || 5000,
  frontendOrigin = `http://localhost:${process.env.VITE_FRONTEND_PORT || 5173}`,
  allowDatabaseUnavailable = process.env.NODE_ENV !== "production",
  logger = console,
} = {}) {
  try {
    await databaseConnector();
  } catch (error) {
    if (!allowDatabaseUnavailable) {
      throw error;
    }

    logger.warn("MongoDB is unavailable; starting in degraded mode:", error.message);
  }

  const app = appFactory(frontendOrigin);
  return app.listen(port, () => logger.log(`Server running on port ${port}`));
}