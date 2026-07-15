import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/roles.js";
import { Community } from "../../models/Community.js";
import { CommunityRequest } from "../../models/CommunityRequest.js";
import { Event } from "../../models/Event.js";
import { Post } from "../../models/Post.js";
import { Resource } from "../../models/Resource.js";
import { runAutoReplyForPost } from "../../services/post-auto-answer.service.js";
import { User } from "../../models/User.js";
import { getCurrentUser } from "../../services/user.service.js";

export const communityRouter = Router();

function createSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function requireMembership(req, res, next) {
  const user = await getCurrentUser(req.user.uid);
  const community = await Community.findById(req.params.id);

  if (!user || !community) {
    return res.status(404).json({ message: "Community or user not found." });
  }

  const isMember = community.memberIds.some((memberId) => String(memberId) === String(user._id));

  if (!isMember) {
    return res.status(403).json({ message: "Join this community before posting." });
  }

  req.currentUser = user;
  req.community = community;
  return next();
}

communityRouter.get("/", requireAuth, async (req, res) => {
  const user = await getCurrentUser(req.user.uid);
  const query = String(req.query.query ?? "").trim();
  const pattern = query ? new RegExp(query, "i") : null;
  const filter = pattern
    ? { $or: [{ name: pattern }, { college: pattern }, { tags: { $in: [pattern] } }] }
    : {};
  const communities = await Community.find({ ...filter, isHidden: { $ne: true } }, {
    name: 1,
    description: 1,
    type: 1,
    college: 1,
    memberIds: 1,
    joinRequests: 1,
    tags: 1
  }).lean();

  res.json({
    communities: communities
      .map((community) => ({
        ...community,
        memberCount: community.memberIds?.length ?? 0,
        isMember: community.memberIds?.some((memberId) => String(memberId) === String(user?._id)) ?? false,
        joinRequestPending:
          community.joinRequests?.some(
            (request) => String(request.userId) === String(user?._id) && request.status === "pending"
          ) ?? false
      }))
      .sort((a, b) => b.memberCount - a.memberCount)
  });
});

communityRouter.post("/", requireAuth, requireRole("superadmin"), async (req, res) => {
  const user = await getCurrentUser(req.user.uid);
  const { name, description, type, college } = req.body;

  if (!user) {
    return res.status(404).json({ message: "User profile not found." });
  }

  if (!name || !type) {
    return res.status(400).json({ message: "Community name and type are required." });
  }

  if (type === "college" && !college) {
    return res.status(400).json({ message: "College communities require a college name." });
  }

  const community = await Community.create({
    name: name.trim(),
    slug: `${createSlug(name)}-${Date.now()}`,
    description,
    type,
    college,
    createdBy: user._id,
    adminIds: [user._id],
    memberIds: type === "open" ? [user._id] : []
  });

  if (type === "open") {
    await User.findByIdAndUpdate(user._id, { $addToSet: { joinedCommunities: community._id } });
  }

  res.status(201).json({ community });
});

communityRouter.get("/:id", requireAuth, async (req, res) => {
  const user = await getCurrentUser(req.user.uid);
  const community = await Community.findById(req.params.id).lean();

  if (!community) {
    return res.status(404).json({ message: "Community not found." });
  }

  if (community.isHidden && user?.role !== "superadmin") {
    return res.status(404).json({ message: "Community not found." });
  }

  const [topPosts, topUnansweredPosts, posts, resources, events] = await Promise.all([
    Post.find({ communityId: community._id }).sort({ score: -1, repliesCount: -1 }).limit(5).lean(),
    Post.find({ communityId: community._id, postType: "question", repliesCount: 0 })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Post.find({ communityId: community._id })
      .populate("authorId", "username fullName status")
      .sort({ createdAt: -1 })
      .lean(),
    Resource.find({ communityId: community._id }).sort({ createdAt: -1 }).lean(),
    Event.find({ type: "community", communityId: community._id }).sort({ startsAt: 1 }).lean()
  ]);

  res.json({
    community: {
      ...community,
      memberCount: community.memberIds?.length ?? 0,
      isMember: community.memberIds?.some((memberId) => String(memberId) === String(user?._id)) ?? false,
      isAdmin:
        community.adminIds?.some((adminId) => String(adminId) === String(user?._id)) ||
        user?.role === "superadmin" ||
        false,
      joinRequestPending:
        community.joinRequests?.some(
          (request) => String(request.userId) === String(user?._id) && request.status === "pending"
        ) ?? false,
      verificationPending:
        community.pendingVerificationUserIds?.some((memberId) => String(memberId) === String(user?._id)) ?? false
    },
    home: {
      topPosts,
      topUnansweredPosts
    },
    posts,
    resources,
    events
  });
});

communityRouter.post("/requests", requireAuth, async (req, res) => {
  const user = await getCurrentUser(req.user.uid);
  const {
    type,
    communityName,
    collegeName,
    description,
    adminName,
    adminEmail,
    adminDesignation,
    proofOfIdUrl,
    creatorName,
    creatorEmail
  } = req.body;

  if (!user) {
    return res.status(404).json({ message: "User profile not found." });
  }

  if (!["college", "open"].includes(type)) {
    return res.status(400).json({ message: "Choose college or open community type." });
  }

  if (!communityName || !description) {
    return res.status(400).json({ message: "Community name and description are required." });
  }

  if (type === "college" && (!collegeName || !adminName || !adminEmail || !adminDesignation || !proofOfIdUrl)) {
    return res.status(400).json({ message: "College community requests require admin details and proof of ID." });
  }

  if (type === "open" && (!creatorName || !creatorEmail)) {
    return res.status(400).json({ message: "Open community requests require creator name and email." });
  }

  const request = await CommunityRequest.create({
    type,
    communityName,
    collegeName,
    description,
    adminName,
    adminEmail,
    adminDesignation,
    proofOfIdUrl,
    creatorName,
    creatorEmail,
    requesterId: user._id
  });

  res.status(201).json({ request });
});

communityRouter.post("/:id/join", requireAuth, async (req, res) => {
  const user = await getCurrentUser(req.user.uid);
  const community = await Community.findById(req.params.id);

  if (!user || !community) {
    return res.status(404).json({ message: "Community or user not found." });
  }

  if (community.type === "college") {
    const existingRequest = community.joinRequests.find(
      (request) => String(request.userId) === String(user._id) && request.status === "pending"
    );

    if (existingRequest) {
      return res.json({ community, status: "pending" });
    }

    community.joinRequests.push({
      userId: user._id,
      status: "pending",
      requestedAt: new Date()
    });
    await community.save();

    return res.json({ community, status: "pending" });
  }

  community.memberIds.addToSet(user._id);
  await community.save();
  await User.findByIdAndUpdate(user._id, { $addToSet: { joinedCommunities: community._id } });

  res.json({ community, status: "joined" });
});

communityRouter.patch("/:id/join-requests/:userId", requireAuth, async (req, res) => {
  const currentUser = await getCurrentUser(req.user.uid);
  const community = await Community.findById(req.params.id);
  const { action } = req.body;

  if (!currentUser || !community) {
    return res.status(404).json({ message: "Community or user not found." });
  }

  const canReview =
    String(community.createdBy) === String(currentUser._id) ||
    community.adminIds?.some((adminId) => String(adminId) === String(currentUser._id)) ||
    currentUser.role === "superadmin";

  if (!canReview) {
    return res.status(403).json({ message: "Only community admins can review join requests." });
  }

  if (!["approve", "reject"].includes(action)) {
    return res.status(400).json({ message: "Action must be approve or reject." });
  }

  const request = community.joinRequests.find(
    (item) => String(item.userId) === String(req.params.userId) && item.status === "pending"
  );

  if (!request) {
    return res.status(404).json({ message: "Pending join request not found." });
  }

  request.status = action === "approve" ? "approved" : "rejected";
  request.reviewedAt = new Date();

  if (action === "approve") {
    community.memberIds.addToSet(req.params.userId);
    await User.findByIdAndUpdate(req.params.userId, { $addToSet: { joinedCommunities: community._id } });
  }

  await community.save();

  res.json({ message: `Join request ${action}d.` });
});

communityRouter.post("/:id/verification-request", requireAuth, async (req, res) => {
  const user = await getCurrentUser(req.user.uid);
  const community = await Community.findById(req.params.id);
  const { documentUrl } = req.body;

  if (!user || !community) {
    return res.status(404).json({ message: "Community or user not found." });
  }

  if (community.type !== "college") {
    return res.status(400).json({ message: "Only college communities require ID verification." });
  }

  user.collegeIdVerification = {
    status: "pending",
    documentUrl,
    submittedAt: new Date()
  };
  community.pendingVerificationUserIds.addToSet(user._id);

  await Promise.all([user.save(), community.save()]);

  res.json({ message: "Verification request submitted." });
});

communityRouter.post("/:id/posts", requireAuth, requireMembership, async (req, res) => {
  const { title, content, postType, tags, isAnonymous, resourceUrl } = req.body;

  if (req.community.isFrozen) {
    return res.status(423).json({ message: "Posting is currently frozen in this community." });
  }

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required." });
  }

  if (!["question", "discussion", "resource"].includes(postType)) {
    return res.status(400).json({ message: "Choose a valid post type." });
  }

  const post = await Post.create({
    title: title.trim(),
    content: content.trim(),
    postType,
    resourceUrl,
    authorId: req.currentUser._id,
    communityId: req.community._id,
    tags: Array.isArray(tags) ? tags.map(String).filter(Boolean) : [],
    isAnonymous: Boolean(isAnonymous)
  });

  if (post.postType === "question") {
    await runAutoReplyForPost(post._id);
  }

  res.status(201).json({ post });
});

communityRouter.post("/:id/resources", requireAuth, requireMembership, async (req, res) => {
  const { title, url, description } = req.body;

  if (req.community.isFrozen) {
    return res.status(423).json({ message: "Posting is currently frozen in this community." });
  }

  if (!title || !url) {
    return res.status(400).json({ message: "Resource title and link are required." });
  }

  const resource = await Resource.create({
    title: title.trim(),
    url: url.trim(),
    description,
    type: "link",
    uploaderId: req.currentUser._id,
    communityId: req.community._id
  });

  res.status(201).json({ resource });
});

communityRouter.post("/:id/events", requireAuth, requireMembership, async (req, res) => {
  const { title, description, startsAt, link } = req.body;

  if (!title || !description || !startsAt) {
    return res.status(400).json({ message: "Event title, description, and date are required." });
  }

  const event = await Event.create({
    type: "community",
    title: title.trim(),
    description: description.trim(),
    startsAt: new Date(startsAt),
    link,
    creatorId: req.currentUser._id,
    communityId: req.community._id
  });

  res.status(201).json({ event });
});

communityRouter.post("/:id/events/:eventId/join", requireAuth, requireMembership, async (req, res) => {
  const event = await Event.findOne({ _id: req.params.eventId, communityId: req.params.id });

  if (!event) {
    return res.status(404).json({ message: "Event not found." });
  }

  event.attendeeIds.addToSet(req.currentUser._id);
  await event.save();

  res.json({ event });
});
