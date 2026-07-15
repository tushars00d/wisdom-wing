import cors from "cors";
import express from "express";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_URL ?? "http://localhost:3000",
      credentials: true
    })
  );
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "wisdom-wing-api" });
  });

  app.use("/api", apiRouter);

  app.use((error, _req, res, _next) => {
    const statusCode = error.statusCode ?? 500;

    res.status(statusCode).json({
      message: error.message ?? "Something went wrong."
    });
  });

  return app;
}
