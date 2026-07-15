import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roles.js";
import { Community } from "../../models/Community.js";
import { Event } from "../../models/Event.js";
import { Post } from "../../models/Post.js";
import { User } from "../../models/User.js";

export const adminRouter = Router();

function canManageCommunity(user, community) {
  return community.adminIds?.some((adminId) => String(adminId) === String(user._id));
}

function createSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

adminRouter.get("/overview", requireAuth, requireRole("college_admin"), async (req, res) => {
  const communities = await Community.find({ adminIds: req.currentUser._id })
    .populate("joinRequests.userId", "fullName username college status")
    .lean();

  const communityIds = communities.map((community) => community._id);
  const [posts, events] = await Promise.all([
    Post.find({ communityId: { $in: communityIds } })
      .populate("authorId", "username fullName status")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
    Event.find({ communityId: { $in: communityIds } }).sort({ startsAt: 1 }).lean()
  ]);

  res.json({
    communities: communities.map((community) => ({
      ...community,
      memberCount: community.memberIds?.length ?? 0,
      activePosts: posts.filter((post) => String(post.communityId) === String(community._id)).length
    })),
    posts,
    events
  });
});

adminRouter.post("/communities", requireAuth, requireRole("college_admin"), async (req, res) => {
  const { name, description, college, tags } = req.body;

  if (!name || !college) {
    return res.status(400).json({ message: "Community name and college are required." });
  }

  const community = await Community.create({
    name: name.trim(),
    slug: `${createSlug(name)}-${Date.now()}`,
    description,
    type: "college",
    college: college.trim(),
    tags: Array.isArray(tags) ? tags.map(String).filter(Boolean) : [],
    createdBy: req.currentUser._id,
    adminIds: [req.currentUser._id],
    memberIds: [req.currentUser._id]
  });

  await User.findByIdAndUpdate(req.currentUser._id, { $addToSet: { joinedCommunities: community._id } });

  res.status(201).json({ community });
});

adminRouter.patch("/communities/:communityId", requireAuth, requireRole("college_admin"), async (req, res) => {
  const community = await Community.findById(req.params.communityId);

  if (!community) {
    return res.status(404).json({ message: "Community not found." });
  }

  if (!canManageCommunity(req.currentUser, community)) {
    return res.status(403).json({ message: "You cannot manage this community." });
  }

  for (const field of ["name", "description", "college"]) {
    if (req.body[field] !== undefined) community[field] = String(req.body[field]).trim();
  }

  if (Array.isArray(req.body.tags)) {
    community.tags = req.body.tags.map(String).filter(Boolean);
  }

  await community.save();

  res.json({ community });
});

adminRouter.patch("/communities/:communityId/join-requests/:userId", requireAuth, requireRole("college_admin"), async (req, res) => {
  const { action } = req.body;
  const community = await Community.findById(req.params.communityId);

  if (!community) {
    return res.status(404).json({ message: "Community not found." });
  }

  if (!canManageCommunity(req.currentUser, community)) {
    return res.status(403).json({ message: "You cannot manage this community." });
  }

  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json({ message: "Action must be approve or reject." });
  }

  const joinRequest = community.joinRequests.find(
    (request) => String(request.userId) === String(req.params.userId) && request.status === "pending"
  );

  if (!joinRequest) {
    return res.status(404).json({ message: "Pending join request not found." });
  }

  joinRequest.status = action === "approve" ? "approved" : "rejected";
  joinRequest.reviewedAt = new Date();

  if (action === "approve") {
    community.memberIds.addToSet(req.params.userId);
    await User.findByIdAndUpdate(req.params.userId, { $addToSet: { joinedCommunities: community._id } });
  }

  await community.save();

  res.json({ message: `Join request ${action}d.` });
});

adminRouter.delete("/posts/:postId", requireAuth, requireRole("college_admin"), async (req, res) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    return res.status(404).json({ message: "Post not found." });
  }

  const community = await Community.findById(post.communityId);

  if (!community || !canManageCommunity(req.currentUser, community)) {
    return res.status(403).json({ message: "You cannot moderate this post." });
  }

  await post.deleteOne();
  res.json({ message: "Post deleted." });
});

adminRouter.post("/communities/:communityId/posts/announcements", requireAuth, requireRole("college_admin"), async (req, res) => {
  const community = await Community.findById(req.params.communityId);
  const { title, content, isPinned = true } = req.body;

  if (!community) {
    return res.status(404).json({ message: "Community not found." });
  }

  if (!canManageCommunity(req.currentUser, community)) {
    return res.status(403).json({ message: "You cannot manage this community." });
  }

  if (!title || !content) {
    return res.status(400).json({ message: "Announcement title and content are required." });
  }

  const post = await Post.create({
    communityId: community._id,
    authorId: req.currentUser._id,
    postType: "discussion",
    title: title.trim(),
    content: content.trim(),
    isAnnouncement: true,
    isPinned: Boolean(isPinned)
  });

  res.status(201).json({ post });
});

adminRouter.patch("/posts/:postId/pin", requireAuth, requireRole("college_admin"), async (req, res) => {
  const post = await Post.findById(req.params.postId);

  if (!post) {
    return res.status(404).json({ message: "Post not found." });
  }

  const community = await Community.findById(post.communityId);

  if (!community || !canManageCommunity(req.currentUser, community)) {
    return res.status(403).json({ message: "You cannot manage this post." });
  }

  post.isPinned = Boolean(req.body.isPinned);
  await post.save();

  res.json({ post });
});

adminRouter.post("/communities/:communityId/events", requireAuth, requireRole("college_admin"), async (req, res) => {
  const community = await Community.findById(req.params.communityId);
  const { title, description, startsAt, link } = req.body;

  if (!community) {
    return res.status(404).json({ message: "Community not found." });
  }

  if (!canManageCommunity(req.currentUser, community)) {
    return res.status(403).json({ message: "You cannot manage this community." });
  }

  const event = await Event.create({
    type: "community",
    communityId: community._id,
    creatorId: req.currentUser._id,
    title,
    description,
    startsAt: new Date(startsAt),
    link
  });

  res.status(201).json({ event });
});

adminRouter.patch("/events/:eventId", requireAuth, requireRole("college_admin"), async (req, res) => {
  const event = await Event.findById(req.params.eventId);

  if (!event) {
    return res.status(404).json({ message: "Event not found." });
  }

  const community = await Community.findById(event.communityId);

  if (!community || !canManageCommunity(req.currentUser, community)) {
    return res.status(403).json({ message: "You cannot edit this event." });
  }

  for (const field of ["title", "description", "link"]) {
    if (req.body[field] !== undefined) event[field] = req.body[field];
  }

  if (req.body.startsAt) event.startsAt = new Date(req.body.startsAt);

  await event.save();
  res.json({ event });
});

adminRouter.delete("/events/:eventId", requireAuth, requireRole("college_admin"), async (req, res) => {
  const event = await Event.findById(req.params.eventId);

  if (!event) {
    return res.status(404).json({ message: "Event not found." });
  }

  const community = await Community.findById(event.communityId);

  if (!community || !canManageCommunity(req.currentUser, community)) {
    return res.status(403).json({ message: "You cannot delete this event." });
  }

  await event.deleteOne();
  res.json({ message: "Event deleted." });
});
