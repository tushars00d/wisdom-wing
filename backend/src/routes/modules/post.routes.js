import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { Post } from "../../models/Post.js";
import { getCurrentUser } from "../../services/user.service.js";
import { applyVote, createReply, getReplies, getUserVote } from "../../services/engagement.service.js";

export const postRouter = Router();

postRouter.get("/:id", requireAuth, async (req, res) => {
  const user = await getCurrentUser(req.user.uid);
  const post = await Post.findById(req.params.id)
    .populate("authorId", "username fullName status")
    .populate("communityId", "name")
    .lean();

  if (!post) {
    return res.status(404).json({ message: "Post not found." });
  }

  const [replies, userVote] = await Promise.all([
    getReplies("post", post._id),
    user ? getUserVote("post", post._id, user._id) : 0
  ]);

  res.json({ post, replies, userVote });
});

postRouter.post("/:id/vote", requireAuth, async (req, res) => {
  const user = await getCurrentUser(req.user.uid);
  const value = Number(req.body.value);

  if (!user) {
    return res.status(404).json({ message: "User profile not found." });
  }

  if (![-1, 0, 1].includes(value)) {
    return res.status(400).json({ message: "Vote value must be -1, 0, or 1." });
  }

  await applyVote({
    targetType: "post",
    targetId: req.params.id,
    userId: user._id,
    value,
    model: Post
  });

  const post = await Post.findById(req.params.id, { score: 1 }).lean();
  res.json({ score: post?.score ?? 0, userVote: value });
});

postRouter.post("/:id/replies", requireAuth, async (req, res) => {
  const user = await getCurrentUser(req.user.uid);
  const { content } = req.body;

  if (!user) {
    return res.status(404).json({ message: "User profile not found." });
  }

  if (!content?.trim()) {
    return res.status(400).json({ message: "Reply content is required." });
  }

  const reply = await createReply({
    targetType: "post",
    targetId: req.params.id,
    userId: user._id,
    content: content.trim(),
    model: Post
  });

  res.status(201).json({ reply });
});
