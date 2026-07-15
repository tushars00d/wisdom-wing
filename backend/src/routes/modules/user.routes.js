import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { Community } from "../../models/Community.js";
import { Event } from "../../models/Event.js";
import { Post } from "../../models/Post.js";
import { Question } from "../../models/Question.js";
import { Resource } from "../../models/Resource.js";
import { User } from "../../models/User.js";
import { assertUsernameAvailable, getCurrentUser, serializeUser } from "../../services/user.service.js";

export const userRouter = Router();

userRouter.get("/me", requireAuth, async (req, res) => {
  const user = await getCurrentUser(req.user.uid);

  if (!user) {
    return res.status(404).json({ message: "User profile not found." });
  }

  res.json({ user: serializeUser(user) });
});

userRouter.get("/username-available", requireAuth, async (req, res) => {
  const username = String(req.query.username ?? "").trim().toLowerCase();

  if (!/^[a-z0-9_]{3,24}$/.test(username)) {
    return res.status(400).json({
      available: false,
      message: "Use 3-24 lowercase letters, numbers, or underscores."
    });
  }

  const currentUser = await getCurrentUser(req.user.uid);
  const existingUser = await User.findOne({ username }).lean();

  res.json({
    available: !existingUser || String(existingUser._id) === String(currentUser?._id)
  });
});

userRouter.put("/onboarding", requireAuth, async (req, res, next) => {
  try {
    const currentUser = await getCurrentUser(req.user.uid);

    if (!currentUser) {
      return res.status(404).json({ message: "User profile not found." });
    }

    const { fullName, username, college, status, interests } = req.body;

    if (!fullName || !username || !college || !status) {
      return res.status(400).json({ message: "Full name, username, college, and status are required." });
    }

    const normalizedUsername = await assertUsernameAvailable(username, currentUser._id);
    const cleanedInterests = Array.isArray(interests)
      ? interests.map((interest) => String(interest).trim()).filter(Boolean)
      : [];

    currentUser.fullName = fullName.trim();
    currentUser.firstName = fullName.trim().split(" ")[0] ?? "";
    currentUser.lastName = fullName.trim().split(" ").slice(1).join(" ");
    currentUser.username = normalizedUsername;
    currentUser.college = college.trim();
    currentUser.status = status;
    currentUser.interests = cleanedInterests;
    currentUser.onboardingCompleted = true;

    await currentUser.save();

    res.json({ user: serializeUser(currentUser) });
  } catch (error) {
    next(error);
  }
});

userRouter.patch("/profile", requireAuth, async (req, res, next) => {
  try {
    const currentUser = await getCurrentUser(req.user.uid);

    if (!currentUser) {
      return res.status(404).json({ message: "User profile not found." });
    }

    const { fullName, username, college, status, interests } = req.body;

    if (username && username !== currentUser.username) {
      currentUser.username = await assertUsernameAvailable(username, currentUser._id);
    }

    if (fullName) {
      currentUser.fullName = fullName.trim();
      currentUser.firstName = fullName.trim().split(" ")[0] ?? "";
      currentUser.lastName = fullName.trim().split(" ").slice(1).join(" ");
    }

    if (college) currentUser.college = college.trim();
    if (status) currentUser.status = status;
    if (Array.isArray(interests)) currentUser.interests = interests.map(String).filter(Boolean);

    await currentUser.save();

    res.json({ user: serializeUser(currentUser) });
  } catch (error) {
    next(error);
  }
});

userRouter.get("/dashboard", requireAuth, async (req, res) => {
  const user = await User.findOne({ firebaseUid: req.user.uid })
    .populate("joinedCommunities", "name type college slug")
    .populate("savedPosts", "title postType communityId")
    .populate("savedQuestions", "title")
    .populate("savedResources", "title url")
    .lean();

  if (!user) {
    return res.status(404).json({ message: "User profile not found." });
  }

  const [posts, questions, communities, events] = await Promise.all([
    Post.find({ authorId: user._id }, { title: 1, postType: 1, communityId: 1 })
      .sort({ createdAt: -1 })
      .lean(),
    Question.find({ authorId: user._id }, { title: 1 }).sort({ createdAt: -1 }).lean(),
    Community.find({ memberIds: user._id }, { name: 1, type: 1, college: 1, slug: 1 }).lean(),
    Event.find(
      {
        $or: [
          { type: "personal", creatorId: user._id },
          { type: "community", communityId: { $in: user.joinedCommunities ?? [] } }
        ]
      },
      { title: 1, startsAt: 1, communityId: 1, type: 1 }
    )
      .populate("communityId", "name")
      .sort({ startsAt: 1 })
      .lean()
  ]);

  res.json({
    user: serializeUser(user),
    posts,
    questions,
    saved: {
      posts: user.savedPosts ?? [],
      questions: user.savedQuestions ?? [],
      resources: user.savedResources ?? []
    },
    communities,
    events
  });
});
