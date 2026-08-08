/**
 * Forum & Community Types
 * These types match the backend Prisma schema exactly
 * Source: backend/prisma/schema.prisma
 */

// ============================================
// ENUMS
// ============================================

// Forum Category - 6 category types
export enum ForumCategory {
  PEER_SUPPORT = 'PEER_SUPPORT',
  STORYTELLING = 'STORYTELLING',
  QUESTIONS_ANSWERS = 'QUESTIONS_ANSWERS',
  RESOURCES = 'RESOURCES',
  ANNOUNCEMENTS = 'ANNOUNCEMENTS',
  AWARENESS = 'AWARENESS',
}

// Forum Post Status - 4 moderation states
export enum ForumPostStatus {
  PENDING_MODERATION = 'PENDING_MODERATION',
  PUBLISHED = 'PUBLISHED',
  HIDDEN = 'HIDDEN',
  DELETED = 'DELETED',
}

// Missing Person Status - 4 states including PENDING for admin review
export enum MissingPersonStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  FOUND = 'FOUND',
  CLOSED = 'CLOSED',
}

// ============================================
// LABELS & HELPERS
// ============================================

export const FORUM_CATEGORY_LABELS: Record<ForumCategory, string> = {
  [ForumCategory.PEER_SUPPORT]: 'Peer Support',
  [ForumCategory.STORYTELLING]: 'Storytelling',
  [ForumCategory.QUESTIONS_ANSWERS]: 'Questions & Answers',
  [ForumCategory.RESOURCES]: 'Resources',
  [ForumCategory.ANNOUNCEMENTS]: 'Announcements',
  [ForumCategory.AWARENESS]: 'Awareness',
};

export const FORUM_POST_STATUS_LABELS: Record<ForumPostStatus, string> = {
  [ForumPostStatus.PENDING_MODERATION]: 'Pending Moderation',
  [ForumPostStatus.PUBLISHED]: 'Published',
  [ForumPostStatus.HIDDEN]: 'Hidden',
  [ForumPostStatus.DELETED]: 'Deleted',
};

export const MISSING_PERSON_STATUS_LABELS: Record<MissingPersonStatus, string> =
  {
    [MissingPersonStatus.PENDING]: 'Pending Review',
    [MissingPersonStatus.ACTIVE]: 'Active',
    [MissingPersonStatus.FOUND]: 'Found',
    [MissingPersonStatus.CLOSED]: 'Closed',
  };

// Category Descriptions
export const FORUM_CATEGORY_DESCRIPTIONS: Record<ForumCategory, string> = {
  [ForumCategory.PEER_SUPPORT]:
    'Connect with others who understand your journey',
  [ForumCategory.STORYTELLING]: 'Share your story and inspire others',
  [ForumCategory.QUESTIONS_ANSWERS]:
    'Ask questions and get answers from the community',
  [ForumCategory.RESOURCES]: 'Share and discover helpful resources',
  [ForumCategory.ANNOUNCEMENTS]: 'Important updates and announcements',
  [ForumCategory.AWARENESS]: 'Raise awareness about important issues',
};

// Category Icons (for UI)
export const FORUM_CATEGORY_ICONS: Record<ForumCategory, string> = {
  [ForumCategory.PEER_SUPPORT]: '🤝',
  [ForumCategory.STORYTELLING]: '📖',
  [ForumCategory.QUESTIONS_ANSWERS]: '❓',
  [ForumCategory.RESOURCES]: '📚',
  [ForumCategory.ANNOUNCEMENTS]: '📢',
  [ForumCategory.AWARENESS]: '💡',
};

// Category Colors for UI
export const FORUM_CATEGORY_COLORS: Record<
  ForumCategory,
  { bg: string; text: string; border: string }
> = {
  [ForumCategory.PEER_SUPPORT]: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  [ForumCategory.STORYTELLING]: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
  },
  [ForumCategory.QUESTIONS_ANSWERS]: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
  },
  [ForumCategory.RESOURCES]: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    border: 'border-yellow-200',
  },
  [ForumCategory.ANNOUNCEMENTS]: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
  },
  [ForumCategory.AWARENESS]: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    border: 'border-indigo-200',
  },
};

// Status Colors for UI
export const POST_STATUS_COLORS: Record<
  ForumPostStatus,
  { bg: string; text: string; border: string }
> = {
  [ForumPostStatus.PENDING_MODERATION]: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    border: 'border-yellow-200',
  },
  [ForumPostStatus.PUBLISHED]: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
  },
  [ForumPostStatus.HIDDEN]: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-200',
  },
  [ForumPostStatus.DELETED]: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
  },
};

export const MISSING_PERSON_STATUS_COLORS: Record<
  MissingPersonStatus,
  { bg: string; text: string; border: string }
> = {
  [MissingPersonStatus.PENDING]: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-600',
    border: 'border-yellow-200',
  },
  [MissingPersonStatus.ACTIVE]: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
  },
  [MissingPersonStatus.FOUND]: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
  },
  [MissingPersonStatus.CLOSED]: {
    bg: 'bg-gray-50',
    text: 'text-gray-600',
    border: 'border-gray-200',
  },
};

// ============================================
// INTERFACES
// ============================================

// Forum Post (complete model)
export interface ForumPost {
  id: string;
  authorId: string;
  title: string;
  content: string;
  category: ForumCategory;
  status: ForumPostStatus;
  views: number;
  likes: number;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;

  // Relations (populated when needed)
  author?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  comments?: ForumComment[];
  commentCount?: number; // Computed field
}

// DTO for creating a forum post
export interface CreateForumPostDto {
  title: string; // min 5, max 200 chars
  content: string; // min 20, max 10000 chars
  category: ForumCategory;
  isAnonymous?: boolean; // default: true
}

// DTO for updating a forum post
export interface UpdateForumPostDto {
  title?: string;
  content?: string;
  category?: ForumCategory;
  status?: ForumPostStatus;
}

// Forum Comment
export interface ForumComment {
  id: string;
  postId: string;
  content: string;
  likes: number;
  createdAt: string;
  updatedAt: string;

  // Relations
  post?: ForumPost;
}

// DTO for creating a comment
export interface CreateForumCommentDto {
  postId: string;
  content: string; // min 1, max 2000 chars
}

// Missing Person (complete model)
export interface MissingPerson {
  id: string;
  firstName: string;
  lastName: string;
  age?: number;
  description?: string;
  photoUrl?: string;
  lastSeenLocation: string;
  lastSeenDate: string;
  status: MissingPersonStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  _count?: {
    sightings: number;
  };
}

// DTO for creating a missing person report
export interface CreateMissingPersonDto {
  firstName: string;
  lastName: string;
  age?: number;
  description?: string;
  photoUrl?: string;
  lastSeenLocation: string;
  lastSeenDate: string;
}

// DTO for updating a missing person report
export interface UpdateMissingPersonDto {
  status?: MissingPersonStatus;
  resolvedAt?: string;
  description?: string;
}

// Forum Statistics (for dashboards)
export interface ForumStatistics {
  totalPosts: number;
  totalComments: number;
  totalViews: number;
  totalLikes: number;
  byCategory: {
    peerSupport: number;
    storytelling: number;
    questionsAnswers: number;
    resources: number;
    announcements: number;
    awareness: number;
  };
  byStatus: {
    pendingModeration: number;
    published: number;
    hidden: number;
    deleted: number;
  };
  topPosts: ForumPost[];
  recentPosts: ForumPost[];
}

// Forum Post with Engagement Metrics
export interface ForumPostWithMetrics extends ForumPost {
  engagementRate: number; // (likes + comments) / views
  isHot: boolean; // High engagement in last 24h
  isTrending: boolean; // Rapidly increasing engagement
  timeAgo: string; // "2 hours ago", "3 days ago"
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getAllForumCategories = (): ForumCategory[] => {
  return Object.values(ForumCategory);
};

export const getAllForumPostStatuses = (): ForumPostStatus[] => {
  return Object.values(ForumPostStatus);
};

export const getAllMissingPersonStatuses = (): MissingPersonStatus[] => {
  return Object.values(MissingPersonStatus);
};

// Calculate engagement rate
export const calculateEngagementRate = (post: ForumPost): number => {
  if (post.views === 0) return 0;
  const engagement = post.likes + (post.commentCount || 0);
  return (engagement / post.views) * 100;
};

// Format time ago
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffMonths < 12)
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
};

// Check if post is recent (within last 24 hours)
export const isRecentPost = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  return diffHours <= 24;
};

// Sort posts by engagement
export const sortByEngagement = (posts: ForumPost[]): ForumPost[] => {
  return [...posts].sort((a, b) => {
    const engagementA = a.likes + (a.commentCount || 0);
    const engagementB = b.likes + (b.commentCount || 0);
    return engagementB - engagementA;
  });
};

// Sort posts by recency
export const sortByRecency = (posts: ForumPost[]): ForumPost[] => {
  return [...posts].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

// Filter posts by category
export const filterByCategory = (
  posts: ForumPost[],
  category: ForumCategory
): ForumPost[] => {
  return posts.filter((post) => post.category === category);
};

// Filter published posts only
export const getPublishedPosts = (posts: ForumPost[]): ForumPost[] => {
  return posts.filter((post) => post.status === ForumPostStatus.PUBLISHED);
};

// Get posts pending moderation
export const getPendingPosts = (posts: ForumPost[]): ForumPost[] => {
  return posts.filter(
    (post) => post.status === ForumPostStatus.PENDING_MODERATION
  );
};

// Format missing person age range
export const formatAgeRange = (age?: number): string => {
  if (!age) return 'Unknown age';
  if (age < 13) return 'Child';
  if (age < 18) return 'Teenager';
  if (age < 65) return 'Adult';
  return 'Senior';
};

// Calculate days since last seen
export const daysSinceLastSeen = (lastSeenDate: string): number => {
  const date = new Date(lastSeenDate);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
