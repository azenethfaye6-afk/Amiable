import { 
  UserProfile, 
  Event, 
  Photo, 
  Suggestion, 
  Application, 
  Announcement,
  MedicalPost,
  Resource,
  ActivityPost,
  ForbiddenKeyword,
  Notification,
  FriendRequest,
  Friendship,
  TimelinePost,
  Badge,
  UserBadge
} from '../types';

// Storage key
const STORAGE_KEY = 'amiable_stored_data';

// Initial Mock Data
const INITIAL_DATA = {
  users: [] as UserProfile[],
  announcements: [] as Announcement[],
  medicalPosts: [] as MedicalPost[],
  medicalComments: [] as any[],
  resources: [] as Resource[],
  activityPosts: [] as ActivityPost[],
  activityComments: [] as any[],
  forbiddenKeywords: [] as ForbiddenKeyword[],
  birthdays: [] as any[],
  notifications: [] as Notification[],
  friendRequests: [] as FriendRequest[],
  friendships: [] as Friendship[],
  timelinePosts: [] as TimelinePost[],
  timelineComments: [] as any[],
  badges: [] as Badge[],
  userBadges: [] as UserBadge[],
  events: [] as Event[],
  photos: [] as Photo[],
  suggestions: [] as Suggestion[],
  applications: [] as Application[],
  modLogs: [] as any[]
};

// Persistence Helper
const loadData = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return INITIAL_DATA;
    }
  }
  return INITIAL_DATA;
};

const saveData = (data: any) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const api = {
  // Auth & Profile
  getUser: async (uid: string) => {
    const data = loadData();
    return data.users.find((u: any) => u.uid === uid) || null;
  },
  saveUser: async (user: UserProfile) => {
    const data = loadData();
    const index = data.users.findIndex((u: any) => u.uid === user.uid);
    if (index >= 0) {
      data.users[index] = user;
    } else {
      data.users.push(user);
    }
    saveData(data);
    return user;
  },
  updateProfile: async (userId: string, updates: any) => {
    const data = loadData();
    const index = data.users.findIndex((u: any) => u.uid === userId);
    if (index >= 0) {
      data.users[index] = { ...data.users[index], ...updates };
      saveData(data);
      return data.users[index];
    }
  },

  // Events
  getEvents: async () => {
    const data = loadData();
    return data.events.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  addEvent: async (event: Omit<Event, 'id'>) => {
    const data = loadData();
    const newEvent = { ...event, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    data.events.push(newEvent);
    saveData(data);
    return newEvent as Event;
  },

  // Photos
  getPhotos: async (eventId?: string) => {
    const data = loadData();
    let photos = data.photos;
    if (eventId) photos = photos.filter((p: any) => p.eventId === eventId);
    return photos.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  addPhoto: async (photo: Omit<Photo, 'id'>) => {
    const data = loadData();
    const newPhoto = { ...photo, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    data.photos.push(newPhoto);
    saveData(data);
    return newPhoto as Photo;
  },

  // Suggestions
  getSuggestions: async () => {
    const data = loadData();
    return data.suggestions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  addSuggestion: async (suggestion: Omit<Suggestion, 'id'>) => {
    const data = loadData();
    const newSuggestion = { ...suggestion, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    data.suggestions.push(newSuggestion);
    saveData(data);
    return newSuggestion as Suggestion;
  },

  // Applications
  getApplications: async () => {
    const data = loadData();
    return data.applications.sort((a: any, b: any) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  },
  addApplication: async (app: Omit<Application, 'id'>) => {
    const data = loadData();
    const newApp = { ...app, id: Math.random().toString(36).substr(2, 9), submittedAt: new Date().toISOString() };
    data.applications.push(newApp);
    saveData(data);
    return newApp as Application;
  },
  updateApplication: async (id: string, updates: Partial<Application>) => {
    const data = loadData();
    const index = data.applications.findIndex((a: any) => a.id === id);
    if (index >= 0) {
      data.applications[index] = { ...data.applications[index], ...updates };
      saveData(data);
    }
  },

  // Announcements
  getAnnouncements: async () => {
    const data = loadData();
    return data.announcements.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  addAnnouncement: async (ann: any) => {
    const data = loadData();
    const newAnn = { ...ann, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    data.announcements.push(newAnn);
    saveData(data);
    return newAnn;
  },

  // Medical
  getMedicalPosts: async () => {
    const data = loadData();
    return data.medicalPosts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  addMedicalPost: async (post: any) => {
    const data = loadData();
    const newPost = { ...post, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    data.medicalPosts.push(newPost);
    saveData(data);
    return newPost;
  },
  getMedicalComments: async (postId?: string) => {
    const data = loadData();
    let comments = data.medicalComments;
    if (postId) comments = comments.filter((c: any) => c.postId === postId);
    return comments.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },
  addMedicalComment: async (comment: any) => {
    const data = loadData();
    const newComment = { ...comment, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    data.medicalComments.push(newComment);
    saveData(data);
    return newComment;
  },

  // Resources
  getResources: async () => {
    const data = loadData();
    return data.resources.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  addResource: async (res: any) => {
    const data = loadData();
    const newRes = { ...res, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    data.resources.push(newRes);
    saveData(data);
    return newRes;
  },

  // Daily Activities
  getActivityPosts: async () => {
    const data = loadData();
    return data.activityPosts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  addActivityPost: async (post: any) => {
    const data = loadData();
    const newPost = { ...post, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    data.activityPosts.push(newPost);
    saveData(data);
    return newPost;
  },
  getActivityComments: async (postId?: string) => {
    const data = loadData();
    let comments = data.activityComments;
    if (postId) comments = comments.filter((c: any) => c.postId === postId);
    return comments.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },
  addActivityComment: async (comment: any) => {
    const data = loadData();
    const newComment = { ...comment, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    data.activityComments.push(newComment);
    saveData(data);
    return newComment;
  },

  // Friends
  getFriendRequests: async () => {
    const data = loadData();
    return data.friendRequests;
  },
  addFriendRequest: async (req: any) => {
    const data = loadData();
    const newReq = { ...req, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString(), status: 'pending' };
    data.friendRequests.push(newReq);
    saveData(data);
    return newReq;
  },
  updateFriendRequest: async (id: string, updates: any) => {
    const data = loadData();
    const index = data.friendRequests.findIndex((r: any) => r.id === id);
    if (index >= 0) {
      data.friendRequests[index] = { ...data.friendRequests[index], ...updates };
      saveData(data);
    }
  },
  getFriendships: async () => {
    const data = loadData();
    return data.friendships;
  },
  addFriendship: async (ship: any) => {
    const data = loadData();
    const newShip = { ...ship, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    data.friendships.push(newShip);
    saveData(data);
    return newShip;
  },

  // Timeline
  getTimelinePosts: async () => {
    const data = loadData();
    return data.timelinePosts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  addTimelinePost: async (post: any) => {
    const data = loadData();
    const newPost = { 
      ...post, 
      id: Math.random().toString(36).substr(2, 9), 
      likes: [], 
      commentsCount: 0, 
      createdAt: new Date().toISOString() 
    };
    data.timelinePosts.push(newPost);
    saveData(data);
    return newPost;
  },
  updateTimelinePosts: async (id: string, updates: any) => {
    const data = loadData();
    const index = data.timelinePosts.findIndex((p: any) => p.id === id);
    if (index >= 0) {
      data.timelinePosts[index] = { ...data.timelinePosts[index], ...updates };
      saveData(data);
    }
  },
  likeTimelinePost: async (postId: string, userId: string) => {
    const data = loadData();
    const post = data.timelinePosts.find((p: any) => p.id === postId);
    if (post) {
      if (post.likes.includes(userId)) {
        post.likes = post.likes.filter((id: string) => id !== userId);
      } else {
        post.likes.push(userId);
      }
      saveData(data);
    }
  },
  getTimelineComments: async (postId?: string) => {
    const data = loadData();
    let comments = data.timelineComments;
    if (postId) comments = comments.filter((c: any) => c.postId === postId);
    return comments.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },
  addTimelineComment: async (comment: any) => {
    const data = loadData();
    const newComment = { ...comment, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    data.timelineComments.push(newComment);
    const post = data.timelinePosts.find((p: any) => p.id === comment.postId);
    if (post) post.commentsCount = (post.commentsCount || 0) + 1;
    saveData(data);
    return newComment;
  },

  // Badges
  getBadges: async () => {
    const data = loadData();
    return data.badges;
  },
  addBadge: async (badge: any) => {
    const data = loadData();
    const newBadge = { ...badge, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    data.badges.push(newBadge);
    saveData(data);
    return newBadge;
  },
  getUserBadges: async (userId?: string) => {
    const data = loadData();
    return data.userBadges.filter((b: any) => b.userId === userId);
  },
  addUserBadge: async (badge: any) => {
    const data = loadData();
    const newBadge = { ...badge, id: Math.random().toString(36).substr(2, 9), grantedAt: new Date().toISOString() };
    data.userBadges.push(newBadge);
    saveData(data);
    return newBadge;
  },
  
  // Keywords
  getKeywords: async () => {
    const data = loadData();
    return data.forbiddenKeywords;
  },
  addKeyword: async (word: any) => {
    const data = loadData();
    const newWord = { ...word, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    data.forbiddenKeywords.push(newWord);
    saveData(data);
    return newWord;
  },

  // Birthdays
  getBirthdays: async () => {
    const data = loadData();
    return data.birthdays;
  },
  addBirthday: async (bday: any) => {
    const data = loadData();
    const newBday = { ...bday, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    data.birthdays.push(newBday);
    saveData(data);
    return newBday;
  },

  // Notifications
  getNotifications: async () => {
    const data = loadData();
    return data.notifications;
  },
  addNotification: async (notif: any) => {
    const data = loadData();
    const newNotif = { ...notif, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString(), isRead: false };
    data.notifications.push(newNotif);
    saveData(data);
    return newNotif;
  },

  // Mod Logs
  getModLogs: async () => {
    const data = loadData();
    return data.modLogs;
  },
  moderatorAction: async (targetUid: string, action: 'mute' | 'unmute' | 'ban', reason: string, moderatorId: string) => {
    const data = loadData();
    const user = data.users.find((u: any) => u.uid === targetUid);
    if (user) {
      if (action === 'mute') user.isMuted = true;
      if (action === 'unmute') user.isMuted = false;
      if (action === 'ban') user.isBanned = true;
      
      data.modLogs.push({
        targetUid,
        action,
        reason,
        moderatorId,
        createdAt: new Date().toISOString()
      });
      saveData(data);
    }
  }
};

export const mockDB = api;
