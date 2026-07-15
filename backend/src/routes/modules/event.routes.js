import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { Community } from "../../models/Community.js";
import { Event } from "../../models/Event.js";
import { getCurrentUser } from "../../services/user.service.js";

export const eventRouter = Router();

async function canManageCommunityEvent(userId, communityId) {
  const community = await Community.findById(communityId).lean();

  if (!community) {
    return { community: null, canManage: false };
  }

  const canManage =
    community.adminIds?.some((adminId) => String(adminId) === String(userId)) ?? false;

  return { community, canManage };
}

eventRouter.get("/", requireAuth, async (req, res) => {
  const currentUser = await getCurrentUser(req.user.uid);

  if (!currentUser) {
    return res.status(404).json({ message: "User profile not found." });
  }

  const communityIds = currentUser.joinedCommunities ?? [];
  const events = await Event.find({
    $or: [
      { type: "personal", creatorId: currentUser._id },
      { type: "community", communityId: { $in: communityIds } }
    ],
    startsAt: { $gte: new Date() }
  })
    .populate("communityId", "name")
    .populate("creatorId", "fullName username")
    .sort({ startsAt: 1 })
    .lean();

  res.json({ events });
});

eventRouter.get("/community/:communityId", requireAuth, async (req, res) => {
  const currentUser = await getCurrentUser(req.user.uid);
  const community = await Community.findById(req.params.communityId).lean();

  if (!currentUser || !community) {
    return res.status(404).json({ message: "Community or user not found." });
  }

  const isMember = community.memberIds?.some((memberId) => String(memberId) === String(currentUser._id));

  if (!isMember) {
    return res.status(403).json({ message: "Join the community to view its events." });
  }

  const events = await Event.find({
    type: "community",
    communityId: community._id
  })
    .sort({ startsAt: 1 })
    .lean();

  res.json({ events });
});

eventRouter.post("/", requireAuth, async (req, res) => {
  const currentUser = await getCurrentUser(req.user.uid);
  const { type, title, description, startsAt, communityId, link } = req.body;

  if (!currentUser) {
    return res.status(404).json({ message: "User profile not found." });
  }

  if (!title || !description || !startsAt) {
    return res.status(400).json({ message: "Title, description, and date are required." });
  }

  if (!["community", "personal"].includes(type)) {
    return res.status(400).json({ message: "Choose community or personal event type." });
  }

  if (type === "community") {
    if (!communityId) {
      return res.status(400).json({ message: "Community ID is required for community events." });
    }

    const { community, canManage } = await canManageCommunityEvent(currentUser._id, communityId);

    if (!community) {
      return res.status(404).json({ message: "Community not found." });
    }

    if (!canManage) {
      return res.status(403).json({ message: "Only community admins can create community events." });
    }
  }

  const event = await Event.create({
    type,
    communityId: type === "community" ? communityId : null,
    creatorId: currentUser._id,
    title: title.trim(),
    description: description.trim(),
    startsAt: new Date(startsAt),
    link: link?.trim() || undefined,
    attendeeIds: [currentUser._id]
  });

  const populatedEvent = await Event.findById(event._id)
    .populate("communityId", "name")
    .populate("creatorId", "fullName username")
    .lean();

  res.status(201).json({ event: populatedEvent });
});

eventRouter.patch("/:eventId", requireAuth, async (req, res) => {
  const currentUser = await getCurrentUser(req.user.uid);
  const event = await Event.findById(req.params.eventId);

  if (!currentUser || !event) {
    return res.status(404).json({ message: "Event or user not found." });
  }

  let canManage = String(event.creatorId) === String(currentUser._id);

  if (event.type === "community" && event.communityId) {
    const result = await canManageCommunityEvent(currentUser._id, event.communityId);
    canManage = result.canManage;
  }

  if (!canManage) {
    return res.status(403).json({ message: "You cannot edit this event." });
  }

  for (const field of ["title", "description", "link"]) {
    if (req.body[field] !== undefined) event[field] = String(req.body[field]).trim();
  }

  if (req.body.startsAt) {
    event.startsAt = new Date(req.body.startsAt);
  }

  await event.save();

  const populatedEvent = await Event.findById(event._id)
    .populate("communityId", "name")
    .populate("creatorId", "fullName username")
    .lean();

  res.json({ event: populatedEvent });
});

eventRouter.delete("/:eventId", requireAuth, async (req, res) => {
  const currentUser = await getCurrentUser(req.user.uid);
  const event = await Event.findById(req.params.eventId);

  if (!currentUser || !event) {
    return res.status(404).json({ message: "Event or user not found." });
  }

  let canManage = String(event.creatorId) === String(currentUser._id);

  if (event.type === "community" && event.communityId) {
    const result = await canManageCommunityEvent(currentUser._id, event.communityId);
    canManage = result.canManage;
  }

  if (!canManage) {
    return res.status(403).json({ message: "You cannot delete this event." });
  }

  await event.deleteOne();

  res.json({ message: "Event deleted." });
});
