import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDB } from '../lib/mockBackend';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Heart, MessageCircle, Share2, Image as ImageIcon, Send as SendIcon, Sparkles, Hash, Quote, Users, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { TimelinePost, UserProfile, TimelineComment } from '../types';

export const Timeline: React.FC = () => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<TimelinePost[]>([]);
  const [comments, setComments] = useState<TimelineComment[]>([]);
  const [content, setContent] = useState('');
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<string[]>([]); // Array of friend UIDs

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [allPosts, friendships, allComments] = await Promise.all([
        mockDB.getTimelinePosts(),
        mockDB.getFriendships(),
        mockDB.getTimelineComments()
      ]);

      // Determine who are friends
      const friendIds = friendships.reduce((acc: string[], f) => {
        if (f.user1Id === user?.uid) acc.push(f.user2Id);
        if (f.user2Id === user?.uid) acc.push(f.user1Id);
        return acc;
      }, []);
      
      setFriends(friendIds);
      setComments(allComments);

      // Only show own posts and friends' posts
      const visiblePosts = allPosts.filter(p => 
        p.userId === user?.uid || friendIds.includes(p.userId)
      ).reverse();
      
      setPosts(visiblePosts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await mockDB.addTimelinePost({
        userId: user!.uid,
        userName: profile?.displayName || user!.email,
        userPhoto: profile?.photoURL,
        content,
        likes: [],
        commentsCount: 0,
        createdAt: new Date().toISOString()
      });
      setContent('');
      fetchData();
    } catch (e) {
      alert('Failed to post');
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await mockDB.likeTimelinePost(postId, user!.uid);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleComment = async (postId: string) => {
    const commentContent = newComments[postId];
    if (!commentContent?.trim()) return;

    try {
      await mockDB.addTimelineComment({
        postId,
        userId: user!.uid,
        userName: profile?.displayName || user!.email,
        userPhoto: profile?.photoURL,
        content: commentContent,
        createdAt: new Date().toISOString()
      });
      
      // Update post comment count (simplified for mock)
      const post = posts.find(p => p.id === postId);
      if (post) {
        await mockDB.updateTimelinePosts(postId, { commentsCount: (post.commentsCount || 0) + 1 });
      }

      setNewComments(prev => ({ ...prev, [postId]: '' }));
      fetchData();
    } catch (e) {
      alert('Failed to comment');
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
      <header className="space-y-4">
        <div className="flex items-center gap-3 text-bento-secondary uppercase text-[10px] font-black tracking-widest">
          <Sparkles size={14} /> <span>Your Amiable Circle</span>
        </div>
        <h1 className="text-6xl font-serif font-bold text-bento-text leading-tight">
          Amiable Feed
        </h1>
        <p className="text-xl text-bento-muted font-sans italic max-w-xl">
          Share and interact. Only your friends can see and join the discussion here.
        </p>
      </header>

      {/* Post Box */}
      <div className="bento-card bg-white p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform">
          <Send size={80} />
        </div>
        
        <form onSubmit={handlePost} className="relative z-10 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-inner flex-shrink-0">
              <img 
                src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
                alt="Avatar" 
              />
            </div>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What's on your mind, ${profile?.displayName}?`}
              className="w-full bg-bento-bg rounded-[32px] p-6 text-lg font-sans border-none focus:ring-2 focus:ring-bento-primary/20 min-h-[120px]"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-bento-border/50">
            <div className="flex items-center gap-4">
              <button type="button" className="p-3 bg-bento-bg text-bento-muted rounded-2xl hover:text-bento-primary hover:bg-white transition-all shadow-sm">
                <ImageIcon size={20} />
              </button>
              <button type="button" className="p-3 bg-bento-bg text-bento-muted rounded-2xl hover:text-bento-primary hover:bg-white transition-all shadow-sm">
                <Hash size={20} />
              </button>
            </div>
            <button type="submit" className="bento-button-primary py-3 px-10 flex items-center gap-2 text-lg">
              Post <SendIcon size={18} />
            </button>
          </div>
        </form>
      </div>

      {/* Feed */}
      <div className="space-y-10">
        <AnimatePresence>
          {posts.map((post, index) => {
            const postComments = comments.filter(c => c.postId === post.id);
            const isExpanded = expandedComments[post.id];

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bento-card p-0 bg-white shadow-md overflow-hidden hover:shadow-2xl transition-all duration-500"
              >
                <div className="p-10 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-inner border-2 border-white">
                        <img 
                          src={post.userPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userId}`} 
                          alt="Author" 
                        />
                      </div>
                      <div>
                        <h4 className="text-xl font-serif font-bold text-bento-text">{post.userName}</h4>
                        <p className="text-[10px] text-bento-muted font-black uppercase tracking-widest mt-1">
                          {formatDate(post.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Share2 className="text-bento-muted hover:text-bento-secondary transition-colors cursor-pointer" size={20} />
                  </div>

                  <div className="relative">
                    <Quote className="absolute -top-4 -left-4 text-bento-border opacity-20" size={48} />
                    <p className="text-2xl font-sans text-bento-text leading-relaxed px-2 whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>
                </div>

                <div className="bg-bento-bg/30 px-10 py-6 border-t border-bento-border/30 flex items-center justify-between">
                  <div className="flex items-center gap-10">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className={cn(
                        "flex items-center gap-3 text-sm font-black uppercase tracking-widest transition-all group",
                        post.likes?.includes(user!.uid) ? "text-red-500" : "text-bento-muted hover:text-red-500"
                      )}
                    >
                      <Heart 
                        size={24} 
                        className={cn(
                          "group-hover:scale-125 transition-all text-current",
                          post.likes?.includes(user!.uid) ? "fill-current" : ""
                        )} 
                      />
                      <span>{post.likes?.length || 0}</span>
                    </button>
                    <button 
                      onClick={() => toggleComments(post.id)}
                      className="flex items-center gap-3 text-bento-muted hover:text-bento-primary transition-all text-sm font-black uppercase tracking-widest"
                    >
                      <MessageCircle size={24} />
                      <span>{postComments.length} Discuss</span>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                  <span className="text-[10px] font-black uppercase text-bento-secondary bg-white px-4 py-2 rounded-xl shadow-sm">
                    {post.userId === user?.uid ? "Your Post" : "Amiable Moment"}
                  </span>
                </div>

                {/* Comments Section */}
                {isExpanded && (
                  <div className="bg-white border-t border-bento-border/20 p-8 space-y-6">
                    <div className="space-y-4">
                      {postComments.map(comment => (
                        <div key={comment.id} className="flex gap-4">
                          <img 
                            src={comment.userPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userId}`} 
                            className="w-10 h-10 rounded-xl shadow-sm"
                          />
                          <div className="flex-1 bg-bento-bg rounded-[24px] p-4">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-bold">{comment.userName}</span>
                              <span className="text-[8px] text-bento-muted uppercase">{formatDate(comment.createdAt)}</span>
                            </div>
                            <p className="text-sm font-sans italic">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <div className="flex-1 relative">
                        <input 
                          type="text" 
                          value={newComments[post.id] || ''}
                          onChange={(e) => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                          placeholder="Join the discussion..."
                          className="w-full pl-6 pr-12 py-3 bg-bento-bg rounded-2xl border-none focus:ring-2 focus:ring-bento-primary/20 text-sm italic"
                        />
                        <button 
                          onClick={() => handleComment(post.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-bento-primary text-white rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {posts.length === 0 && !loading && (
          <div className="text-center py-40 bg-white rounded-[40px] border-2 border-dashed border-bento-border shadow-inner">
            <Users size={64} className="mx-auto text-bento-border mb-6 opacity-40" />
            <h3 className="text-3xl font-serif font-bold text-bento-muted">Your feed is waiting</h3>
            <p className="mt-2 text-bento-muted/60 font-sans max-w-sm mx-auto">
              Add some amiables and share your first moment to start your timeline journey!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
