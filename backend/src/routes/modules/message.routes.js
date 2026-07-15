import { Router } from "express";

export const messageRouter = Router();

messageRouter.get("/", (_req, res) => {
  res.json({ message: "Return conversations, requests, and unread counts." });
});
