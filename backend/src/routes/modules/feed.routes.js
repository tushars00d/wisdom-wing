import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { getPersonalizedFeed, getTopUnansweredPosts } from "../../services/feed.service.js";
import { getCurrentUser } from "../../services/user.service.js";

export const feedRouter = Router();

feedRouter.get("/home", requireAuth, async (req, res) => {
  const user = await getCurrentUser(req.user.uid);

  if (!user) {
    return res.status(404).json({ message: "User profile not found." });
  }

  const [posts, topUnansweredPosts] = await Promise.all([
    getPersonalizedFeed(user),
    getTopUnansweredPosts(user)
  ]);

  res.json({ posts, topUnansweredPosts });
});
