import { Router } from "express";
import { Community } from "../../models/Community.js";
import { Post } from "../../models/Post.js";
import { User } from "../../models/User.js";
import { runQuestionSearch } from "../../services/search.service.js";

export const searchRouter = Router();

searchRouter.get("/", (_req, res) => {
  res.json({ message: "Perform keyword search and semantic search across entities." });
});

searchRouter.get("/questions", async (req, res) => {
  const query = String(req.query.query ?? "");
  const mode = String(req.query.mode ?? "hybrid");
  const results = await runQuestionSearch(query, mode);

  res.json({
    query,
    mode,
    results
  });
});

searchRouter.get("/global", async (req, res) => {
  const query = String(req.query.query ?? "").trim();

  if (!query) {
    return res.json({ results: [] });
  }

  const pattern = new RegExp(query, "i");
  const [posts, communities, users] = await Promise.all([
    Post.find(
      {
        $or: [{ title: pattern }, { content: pattern }, { tags: { $in: [pattern] } }]
      },
      { title: 1, postType: 1, tags: 1, communityId: 1 }
    )
      .limit(8)
      .lean(),
    Community.find(
      {
        $or: [{ name: pattern }, { college: pattern }, { tags: { $in: [pattern] } }]
      },
      { name: 1, type: 1, college: 1 }
    )
      .limit(8)
      .lean(),
    User.find(
      {
        $or: [{ username: pattern }, { fullName: pattern }, { interests: { $in: [pattern] } }]
      },
      { username: 1, fullName: 1, status: 1 }
    )
      .limit(8)
      .lean()
  ]);

  res.json({
    results: [
      ...posts.map((post) => ({
        id: post._id,
        type: "post",
        title: post.title,
        subtitle: post.postType,
        href: `/posts/${post._id}`
      })),
      ...communities.map((community) => ({
        id: community._id,
        type: "community",
        title: community.name,
        subtitle: community.college ?? community.type,
        href: `/community/${community._id}`
      })),
      ...users.map((user) => ({
        id: user._id,
        type: "user",
        title: user.fullName ?? user.username,
        subtitle: user.status,
        href: `/search?q=${encodeURIComponent(query)}`
      }))
    ]
  });
});
