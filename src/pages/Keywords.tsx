import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ForbiddenKeyword } from '../types';
import { mockDB } from '../lib/mockBackend';
import { motion } from 'motion/react';
import { ShieldAlert, Plus, Trash2, Search, AlertCircle, Info } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';

export const KeywordManagement: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [keywords, setKeywords] = useState<ForbiddenKeyword[]>([]);
  const [newWord, setNewWord] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchKeywords = async () => {
    try {
      const data = await mockDB.getKeywords();
      setKeywords(data.reverse());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchKeywords();
  }, [isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim()) return;

    try {
      await mockDB.addKeyword({
        word: newWord.trim().toLowerCase(),
        createdBy: user!.uid,
        createdAt: new Date().toISOString()
      });
      setNewWord('');
      fetchKeywords();
    } catch (e) {
      alert('Failed to add keyword');
    }
  };

  if (!isAdmin) return <div className="p-20 text-center font-serif text-3xl">Access Denied</div>;

  return (
    <div className="space-y-12 py-10 max-w-4xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2 text-red-500">
            <ShieldAlert size={20} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">System Security</span>
          </div>
          <h1 className="text-5xl font-serif font-bold tracking-tight text-bento-text">
            Keyword Alerts
          </h1>
          <p className="mt-4 text-bento-muted max-w-xl">
            Post and manage keywords that are not usable in the website. These will trigger alerts for moderators when used in public posts.
          </p>
        </div>
      </header>

      <div className="bg-white border border-bento-border rounded-[40px] p-10 shadow-sm">
        <form onSubmit={handleSubmit} className="flex gap-4 mb-10">
          <div className="relative flex-1">
            <input 
              type="text" 
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="Enter sensitive keyword..."
              className="w-full pl-6 pr-12 py-4 bg-bento-bg rounded-2xl font-sans border-none focus:ring-2 focus:ring-red-200"
            />
          </div>
          <button type="submit" className="bento-button-primary bg-red-500 hover:bg-red-600 py-4 px-10 flex items-center gap-2">
            <Plus size={18} /> Add Word
          </button>
        </form>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-bento-muted px-4">
            <Info size={14} />
            <span>Currently Monitored Keywords</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {keywords.map((kw, index) => (
              <motion.div
                key={kw.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-red-50 text-red-700 px-5 py-3 rounded-2xl flex items-center gap-3 border border-red-100 group hover:bg-red-500 hover:text-white transition-all cursor-default shadow-sm"
              >
                <AlertCircle size={14} />
                <span className="font-bold tracking-tight">{kw.word}</span>
                <span className="text-[8px] opacity-40 italic">{formatDate(kw.createdAt)}</span>
              </motion.div>
            ))}
          </div>

          {keywords.length === 0 && !loading && (
            <div className="text-center py-20 bg-bento-bg rounded-3xl border border-dashed border-bento-border">
              <p className="font-sans text-bento-muted italic">No keywords restricted yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bento-card bg-white p-8">
          <h4 className="font-serif font-bold text-xl mb-4">How it works</h4>
          <p className="text-bento-muted text-sm leading-relaxed mb-6">
            When a member uses any of these words in the Medical Hub, Daily Activities, or Resource Box, 
            the system flags the post for moderator review.
          </p>
          <div className="bg-bento-bg p-4 rounded-2xl flex items-center gap-3 text-red-500">
            <ShieldAlert size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Automatic Flagging Active</span>
          </div>
        </div>
        
        <div className="bento-card bg-white p-8">
          <h4 className="font-serif font-bold text-xl mb-4">Admin Best Practices</h4>
          <p className="text-bento-muted text-sm leading-relaxed">
            Only add truly sensitive or harmful keywords. Over-filtering can hinder community expression. 
            Review this list periodically to keep it relevant.
          </p>
        </div>
      </div>
    </div>
  );
};
