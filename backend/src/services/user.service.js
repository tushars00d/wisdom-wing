import { User } from "../models/User.js";

export function serializeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: String(user._id),
    firebaseUid: user.firebaseUid,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    username: user.username,
    college: user.college,
    status: user.status,
    interests: user.interests ?? [],
    avatarUrl: user.avatarUrl,
    onboardingCompleted: Boolean(user.onboardingCompleted),
    verificationStatus: user.verificationStatus,
    collegeIdVerification: user.collegeIdVerification,
    joinedCommunities: user.joinedCommunities ?? [],
    savedPosts: user.savedPosts ?? [],
    savedQuestions: user.savedQuestions ?? [],
    savedResources: user.savedResources ?? [],
    role: user.role ?? "user",
    roles: [user.role ?? "user"]
  };
}

export async function getCurrentUser(firebaseUid) {
  return User.findOne({ firebaseUid });
}

export async function assertUsernameAvailable(username, currentUserId) {
  const normalizedUsername = username.trim().toLowerCase();
  const existingUser = await User.findOne({ username: normalizedUsername }).lean();

  if (existingUser && String(existingUser._id) !== String(currentUserId)) {
    const error = new Error("Username is already taken.");
    error.statusCode = 409;
    throw error;
  }

  return normalizedUsername;
}
