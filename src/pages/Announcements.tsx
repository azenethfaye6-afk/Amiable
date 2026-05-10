import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Announcement } from '../types';
import { mockDB } from '../lib/mockBackend';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, Plus, Clock, User, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';

export const AnnouncementsPage: React.FC = () => {
  const { user, profile, isAdmin, isModerator } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      const data = await mockDB.getAnnouncements();
      setAnnouncements(data.reverse());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      await mockDB.addAnnouncement({
        title,
        content,
        priority,
        authorId: user!.uid,
        authorName: profile?.displayName || user!.email,
        createdAt: new Date().toISOString()
      });
      setTitle('');
      setContent('');
      setShowForm(false);
      fetchAnnouncements();
    } catch (e) {
      alert('Failed to post announcement');
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'bg-red-100 text-red-600 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-600 border-orange-200';
      default: return 'bg-blue-100 text-blue-600 border-blue-200';
    }
  };

  return (
    <div className="space-y-12 py-10 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2 text-bento-secondary">
            <Megaphone size={20} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Official Updates</span>
          </div>
          <h1 className="text-5xl font-serif font-bold tracking-tight text-bento-text">
            Announcements
          </h1>
        </div>

        {(isAdmin || isModerator) && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bento-button-secondary py-3 px-8 flex items-center gap-2"
          >
            {showForm ? 'Cancel' : <><Plus size={18} /> New Broadcast</>}
          </button>
        )}
      </header>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bento-card bg-white p-8 mb-12 shadow-xl border-bento-primary/20">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-bento-muted mb-2 ml-1">Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Worthy of attention..."
                    className="w-full px-5 py-4 bg-bento-bg rounded-2xl font-sans border-none focus:ring-2 focus:ring-bento-primary/20 text-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-bento-muted mb-2 ml-1">Content</label>
                  <textarea 
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Details for the community..."
                    className="w-full px-5 py-4 bg-bento-bg rounded-2xl font-sans border-none focus:ring-2 focus:ring-bento-primary/20"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-bento-muted mb-2 ml-1">Priority</label>
                    <div className="flex bg-bento-bg p-1 rounded-xl">
                      {['low', 'medium', 'high'].map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p as any)}
                          className={cn(
                            "px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                            priority === p ? "bg-white text-bento-primary shadow-sm" : "text-bento-muted"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex-1 text-right pt-6">
                    <button type="submit" className="bento-button-primary py-3 px-10">
                      Post Announcement
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {announcements.map((ann, index) => (
          <motion.div
            key={ann.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bento-card group flex flex-col md:flex-row gap-8 p-10 hover:shadow-2xl transition-all duration-500 bg-white"
          >
            <div className="flex-shrink-0">
              <div className={cn(
                "w-16 h-16 rounded-3xl flex items-center justify-center p-4",
                ann.priority === 'high' ? "bg-red-50 text-red-500" : (ann.priority === 'medium' ? "bg-orange-50 text-orange-500" : "bg-blue-50 text-blue-500")
              )}>
                <Megaphone size={32} />
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-serif font-bold text-bento-text">{ann.title}</h3>
                  <span className={cn("bento-pill text-[8px] font-black uppercase tracking-tighter px-2 py-0.5", getPriorityColor(ann.priority))}>
                    {ann.priority} priority
                  </span>
                </div>
                <div className="flex items-center gap-4 text-bento-muted text-[10px] font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>{formatDate(ann.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-bento-secondary" />
                    <span>{ann.authorName}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-bento-text/80 leading-relaxed text-lg whitespace-pre-wrap">
                {ann.content}
              </p>
            </div>
          </motion.div>
        ))}

        {announcements.length === 0 && !loading && (
          <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-bento-border">
            <AlertTriangle size={48} className="mx-auto text-bento-muted mb-4 opacity-50" />
            <p className="font-sans text-bento-muted text-xl">The airwaves are silent. No announcements yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
