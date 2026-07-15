import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roles.js";
import { AdminRequest } from "../../models/AdminRequest.js";
import { Community } from "../../models/Community.js";
import { CommunityRequest } from "../../models/CommunityRequest.js";
import { Post } from "../../models/Post.js";
import { User } from "../../models/User.js";
import { isSuperadminEmail } from "../../config/superadmin.js";

export const superadminRouter = Router();

function createSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

superadminRouter.use(requireAuth, requireRole("superadmin"));

superadminRouter.get("/overview", async (_req, res) => {
  const [adminRequests, requests, communities, users, totalPosts] = await Promise.all([
    AdminRequest.find({})
      .populate("userId", "fullName username email role")
      .sort({ createdAt: -1 })
      .lean(),
    CommunityRequest.find({}).populate("requesterId", "fullName username email").sort({ createdAt: -1 }).lean(),
    Community.find({}).lean(),
    User.find({}, { fullName: 1, username: 1, email: 1, role: 1, status: 1 }).sort({ createdAt: -1 }).lean(),
    Post.countDocuments()
  ]);

  res.json({
    adminRequests,
    requests,
    communities: communities.map((community) => ({
      ...community,
      memberCount: community.memberIds?.length ?? 0
    })),
    users,
    stats: {
      totalUsers: users.length,
      totalCommunities: communities.length,
      totalPosts
    }
  });
});

superadminRouter.patch("/admin-requests/:requestId", async (req, res) => {
  const { action, rejectionReason } = req.body;

  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json({ message: "Action must be approve or reject." });
  }

  const request = await AdminRequest.findById(req.params.requestId);

  if (!request) {
    return res.status(404).json({ message: "Admin request not found." });
  }

  if (request.status !== "pending") {
    return res.status(400).json({ message: "Request has already been reviewed." });
  }

  request.status = action === "approve" ? "approved" : "rejected";
  request.reviewedBy = req.currentUser._id;
  request.reviewedAt = new Date();
  request.rejectionReason = rejectionReason;

  await User.findByIdAndUpdate(request.userId, {
    role: action === "approve" ? "college_admin" : "user",
    college: request.collegeName
  });

  await request.save();

  res.json({ request });
});

superadminRouter.patch("/community-requests/:requestId", async (req, res) => {
  const { action, rejectionReason } = req.body;

  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json({ message: "Action must be approve or reject." });
  }

  const request = await CommunityRequest.findById(req.params.requestId);

  if (!request) {
    return res.status(404).json({ message: "Community request not found." });
  }

  if (request.status !== "pending") {
    return res.status(400).json({ message: "Request has already been reviewed." });
  }

  request.status = action === "approve" ? "approved" : "rejected";
  request.reviewedBy = req.currentUser._id;
  request.reviewedAt = new Date();
  request.rejectionReason = rejectionReason;

  if (action === "approve") {
    const creator = await User.findById(request.requesterId);
    const community = await Community.create({
      name: request.communityName,
      slug: `${createSlug(request.communityName)}-${Date.now()}`,
      description: request.description,
      type: request.type,
      college: request.collegeName,
      createdBy: creator?._id,
      adminIds: creator ? [creator._id] : [],
      memberIds: creator ? [creator._id] : []
    });

    if (creator) {
      if (creator.role !== "superadmin") creator.role = "college_admin";
      creator.joinedCommunities.addToSet(community._id);
      await creator.save();
    }

    request.createdCommunityId = community._id;
  }

  await request.save();
  res.json({ request });
});

superadminRouter.patch("/communities/:communityId/moderation", async (req, res) => {
  const { action } = req.body;

  if (!["hide", "unhide", "freeze", "unfreeze", "delete"].includes(action)) {
    return res.status(400).json({ message: "Invalid community moderation action." });
  }

  const community = await Community.findById(req.params.communityId);

  if (!community) {
    return res.status(404).json({ message: "Community not found." });
  }

  if (action === "delete") {
    await community.deleteOne();
    return res.json({ message: "Community deleted." });
  }

  if (action === "hide") community.isHidden = true;
  if (action === "unhide") community.isHidden = false;
  if (action === "freeze") community.isFrozen = true;
  if (action === "unfreeze") community.isFrozen = false;

  await community.save();

  res.json({ community });
});

superadminRouter.patch("/users/:userId/role", async (req, res) => {
  const { role } = req.body;
  const allowedRoles = ["user", "college_admin_pending", "college_admin"];

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: "Choose a valid non-superadmin role." });
  }

  const user = await User.findById(req.params.userId);

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  if (isSuperadminEmail(user.email) || user.role === "superadmin") {
    return res.status(403).json({ message: "The single superadmin role cannot be edited here." });
  }

  user.role = role;
  await user.save();

  res.json({ user });
});
