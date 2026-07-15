import { Community } from "../models/Community.js";
import { Post } from "../models/Post.js";

function getInterestRegexes(interests = []) {
  return interests.map((interest) => new RegExp(`^${interest}$`, "i"));
}

export async function getPersonalizedFeed(user) {
  const joinedCommunityIds = user.joinedCommunities ?? [];
  const interestRegexes = getInterestRegexes(user.interests);

  const membershipPosts = await Post.find({ communityId: { $in: joinedCommunityIds } })
    .populate("authorId", "username fullName status")
    .populate("communityId", "name")
    .sort({ createdAt: -1 })
    .limit(25)
    .lean();

  const interestPosts = interestRegexes.length
    ? await Post.find({ tags: { $in: interestRegexes } })
        .populate("authorId", "username fullName status")
        .populate("communityId", "name")
        .sort({ score: -1, createdAt: -1 })
        .limit(25)
        .lean()
    : [];

  const trendingPosts = await Post.find({})
    .populate("authorId", "username fullName status")
    .populate("communityId", "name")
    .sort({ score: -1, repliesCount: -1, createdAt: -1 })
    .limit(25)
    .lean();

  const merged = new Map();

  for (const post of [...membershipPosts, ...interestPosts, ...trendingPosts]) {
    const relevance =
      (joinedCommunityIds.some((id) => String(id) === String(post.communityId?._id ?? post.communityId)) ? 30 : 0) +
      (post.tags?.some((tag) => user.interests?.some((interest) => interest.toLowerCase() === tag.toLowerCase())) ? 20 : 0) +
      (post.score ?? 0) * 2 +
      (post.repliesCount ?? 0);

    merged.set(String(post._id), {
      ...post,
      relevance
    });
  }

  return Array.from(merged.values())
    .sort((a, b) => b.relevance - a.relevance || new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 30);
}

export async function getTopUnansweredPosts(user) {
  const joinedCommunityIds = user.joinedCommunities ?? [];
  const interestRegexes = getInterestRegexes(user.interests);
  const filters = [{ communityId: { $in: joinedCommunityIds } }];

  if (interestRegexes.length) {
    filters.push({ tags: { $in: interestRegexes } });
  }

  const query = {
    postType: "question",
    repliesCount: 0,
    ...(filters.length ? { $or: filters } : {})
  };

  const relevant = await Post.find(query)
    .populate("communityId", "name")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  if (relevant.length) {
    return relevant;
  }

  return Post.find({ postType: "question", repliesCount: 0 })
    .populate("communityId", "name")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
}

export async function getTopCommunities() {
  const communities = await Community.find({}, { name: 1, description: 1, type: 1, college: 1, memberIds: 1, tags: 1 })
    .lean();

  return communities
    .map((community) => ({
      ...community,
      memberCount: community.memberIds?.length ?? 0
    }))
    .sort((a, b) => b.memberCount - a.memberCount)
    .slice(0, 10);
}
