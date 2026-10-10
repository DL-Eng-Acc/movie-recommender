import express from "express";
import cors from "cors";
import movieRoutes from "./routes/movies.routes.js";

export function createApp(
  frontendOrigin = `http://localhost:${process.env.VITE_FRONTEND_PORT || 5173}`,
) {
  const app = express();
  app.disable("x-powered-by");

  app.use(cors({ origin: frontendOrigin }));
  app.use(express.json());

  app.use("/api/movies", movieRoutes);
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  return app;
}