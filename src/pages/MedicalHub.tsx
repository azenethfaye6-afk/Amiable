import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MedicalPost, MedicalComment } from '../types';
import { mockDB } from '../lib/mockBackend';
import { motion, AnimatePresence } from 'motion/react';
import { HeartPulse, Plus, MessageCircle, Clock, User, Heart, Send, AlertCircle, ChevronDown } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';

export const MedicalHub: React.FC = () => {
  const { user, profile, isMember } = useAuth();
  const [posts, setPosts] = useState<MedicalPost[]>([]);
  const [comments, setComments] = useState<MedicalComment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [newComment, setNewComment] = useState('');

  const fetchData = async () => {
    try {
      const [pData, cData] = await Promise.all([
        mockDB.getMedicalPosts(),
        mockDB.getMedicalComments()
      ]);
      setPosts(pData.reverse());
      setComments(cData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      await mockDB.addMedicalPost({
        title,
        content,
        userId: user!.uid,
        userName: profile?.displayName || user!.email,
        createdAt: new Date().toISOString()
      });
      setTitle('');
      setContent('');
      setShowForm(false);
      fetchData();
    } catch (e) {
      alert('Failed to post');
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!newComment) return;

    try {
      await mockDB.addMedicalComment({
        postId,
        content: newComment,
        userId: user!.uid,
        userName: profile?.displayName || user!.email,
        createdAt: new Date().toISOString()
      });
      setNewComment('');
      fetchData();
    } catch (e) {
      alert('Failed to comment');
    }
  };

  return (
    <div className="space-y-12 py-10 max-w-4xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2 text-red-500">
            <HeartPulse size={20} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Medical Box</span>
          </div>
          <h1 className="text-5xl font-serif font-bold tracking-tight text-bento-text">
            Medical Box
          </h1>
          <p className="mt-4 text-bento-muted max-w-xl">
            A safe, non-judgmental space to discuss health concerns, share wellness journeys, and support one another.
          </p>
        </div>

        {isMember && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bento-button-secondary bg-red-50 text-red-600 border-red-100 py-3 px-8 flex items-center gap-2"
          >
            <Plus size={18} /> Seek Support
          </button>
        )}
      </header>

      <div className="bg-red-50 border border-red-100 rounded-[32px] p-6 flex items-start gap-4 shadow-sm mb-12">
        <AlertCircle size={24} className="text-red-500 flex-shrink-0 mt-1" />
        <p className="text-[11px] text-red-800 leading-relaxed italic">
          <strong>Disclaimer:</strong> This is a community support group, not a clinical medical service. 
          The advice shared here is based on personal experience. Always consult with a qualified medical 
          professional for serious health issues or emergencies.
        </p>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bento-card bg-white p-8 mb-12 shadow-xl border-red-100">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-bento-muted mb-2 ml-1">Subject</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Short summary of what's on your mind..."
                    className="w-full px-5 py-4 bg-bento-bg rounded-2xl font-sans border-none focus:ring-2 focus:ring-red-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-bento-muted mb-2 ml-1">Your Story / Question</label>
                  <textarea 
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tell us what's bothering you..."
                    className="w-full px-5 py-4 bg-bento-bg rounded-2xl font-sans border-none focus:ring-2 focus:ring-red-200"
                  />
                </div>
                <div className="text-right">
                  <button type="submit" className="bento-button-primary bg-red-500 hover:bg-red-600 py-3 px-10">
                    Post to Medical Box
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bento-card p-10 bg-white shadow-sm hover:shadow-xl transition-all duration-500"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
                  <Heart size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-bento-text">{post.title}</h3>
                  <div className="flex items-center gap-3 text-[10px] text-bento-muted font-bold uppercase tracking-widest mt-1">
                    <span className="text-bento-secondary">{post.userName}</span>
                    <span className="opacity-30">•</span>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-bento-text/90 leading-relaxed text-lg mb-10 whitespace-pre-wrap px-1">
              {post.content}
            </p>

            <div className="mt-8 pt-8 border-t border-bento-border/40">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 text-bento-secondary">
                  <MessageCircle size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">
                    {comments.filter(c => c.postId === post.id).length} Suggestions
                  </span>
                </div>
                <button 
                  onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                  className="text-bento-muted hover:text-bento-primary transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                >
                  {expandedPost === post.id ? 'Close Discussion' : 'Join Discussion'}
                  <ChevronDown size={14} className={cn("transition-transform duration-300", expandedPost === post.id && "rotate-180")} />
                </button>
              </div>

              <AnimatePresence>
                {expandedPost === post.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 mb-8">
                      {comments.filter(c => c.postId === post.id).map(comment => (
                        <div key={comment.id} className="bg-bento-bg p-5 rounded-2xl border border-bento-border/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-tighter text-bento-secondary">{comment.userName}</span>
                            <span className="text-[9px] text-bento-muted font-bold uppercase">{formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="text-sm text-bento-text leading-relaxed">{comment.content}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4">
                      <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Offer some advice or support..."
                        className="flex-1 px-5 py-3 bg-bento-bg rounded-xl border-none text-sm font-sans"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      />
                      <button 
                        onClick={() => handleAddComment(post.id)}
                        className="w-12 h-12 rounded-xl bg-bento-primary text-white flex items-center justify-center hover:scale-105 transition-transform"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}

        {posts.length === 0 && !loading && (
          <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-bento-border">
            <HeartPulse size={48} className="mx-auto text-bento-muted mb-4 opacity-30" />
            <p className="font-sans text-bento-muted text-xl">The Medical Box is quiet. Feel free to seek support.</p>
          </div>
        )}
      </div>
    </div>
  );
};
