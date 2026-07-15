import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { Resource } from "../../models/Resource.js";
import { applyVote, createReply, getReplies, getUserVote } from "../../services/engagement.service.js";
import { getCurrentUser } from "../../services/user.service.js";

export const resourceRouter = Router();

resourceRouter.get("/", requireAuth, async (_req, res) => {
  const resources = await Resource.find({}).sort({ createdAt: -1 }).limit(20).lean();
  res.json({ resources });
});

resourceRouter.get("/:id", requireAuth, async (req, res) => {
  const user = await getCurrentUser(req.user.uid);
  const resource = await Resource.findById(req.params.id).lean();

  if (!resource) {
    return res.status(404).json({ message: "Resource not found." });
  }

  const [replies, userVote] = await Promise.all([
    getReplies("resource", resource._id),
    user ? getUserVote("resource", resource._id, user._id) : 0
  ]);

  res.json({ resource, replies, userVote });
});

resourceRouter.post("/:id/vote", requireAuth, async (req, res) => {
  const user = await getCurrentUser(req.user.uid);
  const value = Number(req.body.value);

  if (!user) {
    return res.status(404).json({ message: "User profile not found." });
  }

  if (![-1, 0, 1].includes(value)) {
    return res.status(400).json({ message: "Vote value must be -1, 0, or 1." });
  }

  await applyVote({
    targetType: "resource",
    targetId: req.params.id,
    userId: user._id,
    value,
    model: Resource
  });

  const resource = await Resource.findById(req.params.id, { score: 1 }).lean();
  res.json({ score: resource?.score ?? 0, userVote: value });
});

resourceRouter.post("/:id/replies", requireAuth, async (req, res) => {
  const user = await getCurrentUser(req.user.uid);
  const { content } = req.body;

  if (!user) {
    return res.status(404).json({ message: "User profile not found." });
  }

  if (!content?.trim()) {
    return res.status(400).json({ message: "Reply content is required." });
  }

  const reply = await createReply({
    targetType: "resource",
    targetId: req.params.id,
    userId: user._id,
    content: content.trim(),
    model: Resource
  });

  res.status(201).json({ reply });
});
