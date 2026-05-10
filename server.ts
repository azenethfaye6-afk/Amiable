import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple file-based DB
const DB_PATH = path.join(process.cwd(), 'database.json');

function getDB() {
  const defaultDB = {
    users: {},
    events: [],
    photos: [],
    suggestions: [],
    applications: [],
    modLogs: [],
    announcements: [],
    medicalPosts: [],
    medicalComments: [],
    resources: [],
    activityPosts: [],
    forbiddenKeywords: [],
    birthdays: []
  };

  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultDB, null, 2));
    return defaultDB;
  }
  
  const currentDB = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  return { ...defaultDB, ...currentDB };
}

function saveDB(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/users/:uid', (req, res) => {
    const db = getDB();
    res.json(db.users[req.params.uid] || null);
  });

  app.post('/api/users', (req, res) => {
    const db = getDB();
    const user = req.body;
    db.users[user.uid] = user;
    saveDB(db);
    res.json(user);
  });

  app.get('/api/events', (req, res) => {
    res.json(getDB().events);
  });

  app.post('/api/events', (req, res) => {
    const db = getDB();
    const event = { ...req.body, id: Math.random().toString(36).substr(2, 9) };
    db.events.push(event);
    saveDB(db);
    res.json(event);
  });

  app.get('/api/applications', (req, res) => {
    res.json(getDB().applications);
  });

  app.post('/api/applications', (req, res) => {
    const db = getDB();
    const appData = { ...req.body, id: Math.random().toString(36).substr(2, 9) };
    db.applications.push(appData);
    saveDB(db);
    res.json(appData);
  });

  app.patch('/api/applications/:id', (req, res) => {
    const db = getDB();
    db.applications = db.applications.map((a: any) => 
      a.id === req.params.id ? { ...a, ...req.body } : a
    );
    saveDB(db);
    res.json({ success: true });
  });

  app.get('/api/suggestions', (req, res) => {
    res.json(getDB().suggestions);
  });

  app.post('/api/suggestions', (req, res) => {
    const db = getDB();
    const suggestion = { ...req.body, id: Math.random().toString(36).substr(2, 9) };
    db.suggestions.push(suggestion);
    saveDB(db);
    res.json(suggestion);
  });

  // Generic helpers for new collections
  const collections = [
    'announcements', 'medicalPosts', 'medicalComments', 
    'resources', 'activityPosts', 'activityComments', 'forbiddenKeywords', 'birthdays', 'notifications',
    'friendRequests', 'friendships', 'timelinePosts', 'timelineComments', 'badges', 'userBadges'
  ];

  collections.forEach(col => {
    app.get(`/api/${col}`, (req, res) => {
      res.json(getDB()[col] || []);
    });
    app.post(`/api/${col}`, (req, res) => {
      const db = getDB();
      const item = { ...req.body, id: Math.random().toString(36).substr(2, 9) };
      db[col] = db[col] || [];
      db[col].push(item);
      saveDB(db);
      res.json(item);
    });
    app.put(`/api/${col}/:id`, (req, res) => {
      const db = getDB();
      const index = (db[col] || []).findIndex((i: any) => i.id === req.params.id);
      if (index > -1) {
        db[col][index] = { ...db[col][index], ...req.body };
        saveDB(db);
        res.json(db[col][index]);
      } else {
        res.status(404).send('Not found');
      }
    });
  });

  // Profile update route
  app.post('/api/profile/update', (req, res) => {
    const { userId, updates } = req.body;
    const db = getDB();
    if (db.users[userId]) {
      db.users[userId] = { ...db.users[userId], ...updates };
      saveDB(db);
      res.json(db.users[userId]);
    } else {
      res.status(404).send('User not found');
    }
  });

  // Specific for liking a timeline post
  app.post('/api/timelinePosts/:id/like', (req, res) => {
    const { userId } = req.body;
    const db = getDB();
    const post = db.timelinePosts.find((p: any) => p.id === req.params.id);
    if (post) {
      if (!post.likes) post.likes = [];
      if (post.likes.includes(userId)) {
        post.likes = post.likes.filter((id: string) => id !== userId);
      } else {
        post.likes.push(userId);
      }
      saveDB(db);
      res.json(post);
    } else {
      res.status(404).send('Post not found');
    }
  });

  // Moderation API
  app.post('/api/mod/action', (req, res) => {
    const { targetUid, action, reason, moderatorId } = req.body;
    const db = getDB();
    
    if (db.users[targetUid]) {
      if (action === 'mute') {
        db.users[targetUid].isMuted = true;
      } else if (action === 'ban') {
        db.users[targetUid].isBanned = true;
      } else if (action === 'unmute') {
        db.users[targetUid].isMuted = false;
      }
      
      db.modLogs.push({
        id: Math.random().toString(36).substr(2, 9),
        targetUid,
        action,
        reason,
        moderatorId,
        timestamp: new Date().toISOString()
      });
      
      saveDB(db);
      res.json({ success: true, user: db.users[targetUid] });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  app.get('/api/mod/logs', (req, res) => {
    res.json(getDB().modLogs);
  });

  app.get('/api/photos', (req, res) => {
    res.json(getDB().photos);
  });

  app.post('/api/photos', (req, res) => {
    const db = getDB();
    const photo = { ...req.body, id: Math.random().toString(36).substr(2, 9) };
    db.photos.push(photo);
    saveDB(db);
    res.json(photo);
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
