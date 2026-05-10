export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member',
  APPLICANT = 'applicant'
}

export enum ApplicationStatus {
  NONE = 'none',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  applicationStatus: ApplicationStatus;
  joinedAt?: string;
  birthday?: string;
  bio?: string;
  isMuted?: boolean;
  isBanned?: boolean;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Friendship {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: string;
}

export interface TimelinePost {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  image?: string;
  likes: string[]; // array of uids
  commentsCount: number;
  createdAt: string;
}

export interface TimelineComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
  createdAt: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  badgeName: string;
  badgeIcon: string;
  badgeColor: string;
  grantedBy: string; // Admin uid
  grantedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface Birthday {
  id: string;
  userId: string;
  userName: string;
  birthDate: string; // MM-DD
  isNotified?: boolean;
  createdAt: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  link: string;
  category: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface MedicalPost {
  id: string;
  title: string;
  content: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface MedicalComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface ActivityPost {
  id: string;
  day: string; // e.g., "Monday"
  topic: string;
  content: string;
  userId: string;
  userName: string;
  groupName?: string; // For Thursday
  createdAt: string;
}

export interface ActivityComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface ForbiddenKeyword {
  id: string;
  word: string;
  createdBy: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string; // Recipient
  title: string;
  message: string;
  type: 'info' | 'warning' | 'birthday';
  isRead: boolean;
  createdAt: string;
}

export enum EventStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  PAST = 'past'
}

export interface FrameConfig {
  borderWidth?: string;
  borderColor?: string;
  borderRadius?: string;
  overlayImageUrl?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  themeName: string;
  frameConfig: FrameConfig;
  status: EventStatus;
  createdBy: string;
  createdAt: string;
}

export interface Photo {
  id: string;
  url: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  eventId: string;
  eventTitle: string;
  themeName: string;
  frameConfig: FrameConfig;
  createdAt: string;
}

export interface Suggestion {
  id: string;
  theme: string;
  description: string;
  userId: string;
  userName: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Application {
  id: string;
  userId: string;
  userName: string;
  status: 'pending' | 'approved' | 'rejected';
  answers: Record<string, string>;
  submittedAt: string;
  reviewerId?: string;
  reviewNote?: string;
}

export interface Question {
  id: string;
  text: string;
  order: number;
  active: boolean;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}
