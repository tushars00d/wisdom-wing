export type Theme = "light" | "dark";

export type NavItem = {
  label: string;
  href: string;
  badge?: string;
};

export type AppUser = {
  id: string;
  email: string;
  fullName?: string;
  username?: string;
  college?: string;
  status?: string;
  interests: string[];
  avatarUrl?: string;
  onboardingCompleted: boolean;
  role: "user" | "college_admin_pending" | "college_admin" | "superadmin";
  roles?: Array<"user" | "college_admin_pending" | "college_admin" | "superadmin">;
  verificationStatus?: string;
  collegeIdVerification?: {
    status: "not_submitted" | "pending" | "approved" | "rejected";
    documentUrl?: string;
  };
};

export type Community = {
  _id: string;
  name: string;
  description?: string;
  type: "college" | "open";
  college?: string;
  memberCount?: number;
  isMember?: boolean;
  verificationPending?: boolean;
  joinRequestPending?: boolean;
  isAdmin?: boolean;
  isHidden?: boolean;
  isFrozen?: boolean;
  activePosts?: number;
  joinRequests?: Array<{
    userId: {
      _id: string;
      fullName?: string;
      username?: string;
      college?: string;
      status?: string;
    };
    status: "pending" | "approved" | "rejected";
  }>;
};

export type CommunityQuestion = {
  _id: string;
  title: string;
  body: string;
  tags: string[];
  isAnonymous: boolean;
  upvotes: number;
  answersCount: number;
  authorId?: {
    username?: string;
    fullName?: string;
    status?: string;
  };
};

export type CommunityPost = {
  _id: string;
  title: string;
  content: string;
  postType: "question" | "discussion" | "resource";
  resourceUrl?: string;
  tags: string[];
  isAnonymous: boolean;
  isAnnouncement?: boolean;
  isPinned?: boolean;
  score: number;
  repliesCount: number;
  authorId?: {
    username?: string;
    fullName?: string;
    status?: string;
  };
};

export type CommunityResource = {
  _id: string;
  title: string;
  url: string;
  description?: string;
};

export type CommunityEvent = {
  _id: string;
  type?: "community" | "personal";
  title: string;
  description: string;
  startsAt: string;
  link?: string;
  attendeeIds?: string[];
  communityId?: {
    _id: string;
    name: string;
  } | string | null;
  creatorId?: {
    _id?: string;
    fullName?: string;
    username?: string;
  } | string;
};

export type FeedPost = {
  id: string;
  author: string;
  role: string;
  college: string;
  title: string;
  snippet: string;
  tags: string[];
  verified?: boolean;
  votes: number;
  comments: number;
  timestamp: string;
};

export type SuggestedConnection = {
  name: string;
  field: string;
  mutuals: number;
};

export type QuestionAnswer = {
  id: string;
  author: string;
  body: string;
  votes: number;
  best?: boolean;
  isAiGenerated?: boolean;
};

export type SearchResult = {
  id: string;
  type: "question" | "resource" | "user";
  title: string;
  description: string;
  meta: string;
};
