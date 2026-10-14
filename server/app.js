import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import movieRoutes from "./routes/movies.routes.js";

export function createApp(
  frontendOrigin = `http://localhost:${process.env.VITE_FRONTEND_PORT || 5173}`,
) {
  const app = express();
  app.disable("x-powered-by");

  app.use(cors({ origin: frontendOrigin }));
  app.use(express.json());

  app.use("/api/movies", movieRoutes);
  app.get("/api/health", (_req, res) => {
    const isDatabaseReady = mongoose.connection.readyState === 1;
    const status = isDatabaseReady ? "ok" : "unavailable";

    res.status(isDatabaseReady ? 200 : 503).json({
      status,
      database: isDatabaseReady ? "connected" : "disconnected",
    });
  });

  return app;
}