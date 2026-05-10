import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ActivityPost, ActivityComment } from '../types';
import { mockDB } from '../lib/mockBackend';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Heart, Share2, MessageCircle, Plus, Info, Sun, Moon, 
  Sparkles, Hash, ShieldAlert, Award, AlertCircle, Quote, 
  Users, Briefcase, Send, ChevronDown, Trophy
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';

export const DailyActivities: React.FC = () => {
  const { user, profile, isMember, isAdmin, isModerator } = useAuth();
  const [posts, setPosts] = useState<ActivityPost[]>([]);
  const [comments, setComments] = useState<ActivityComment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  const currentDay = days[now.getDay()];
  const currentHour = now.getHours();
  const isTimeWindow = currentHour >= 6 && currentHour < 18; // 6 AM to 6 PM

  const dayThemes: Record<string, { 
    title: string, 
    color: string, 
    icon: any, 
    rule?: string,
    description: string,
    hashtag?: string
  }> = {
    'Monday': { 
      title: 'Awareness Day', 
      color: 'bg-blue-50 text-blue-600 border-blue-100', 
      icon: <Info size={16} />,
      hashtag: '#AmIAware',
      description: 'Share something about general topics that may help other members in taking care of their mental health or others. Share your knowledge about societal issues.'
    },
    'Tuesday': { 
      title: 'Sharing Day', 
      color: 'bg-purple-50 text-purple-600 border-purple-100', 
      icon: <Share2 size={16} />,
      description: 'Share your life experiences here. This could be a lesson to others.'
    },
    'Wednesday': { 
      title: 'English Day', 
      color: 'bg-green-50 text-green-600 border-green-100', 
      icon: <Sparkles size={16} />,
      rule: '6:00 am to 6:00 pm: English Only. (If non-English, use \'single quotes\')',
      description: 'Everyone must follow the English-only rule. Admins and moderators will roam to see if everyone is cooperating.'
    },
    'Thursday': { 
      title: 'Activity Day', 
      color: 'bg-orange-50 text-orange-600 border-orange-100', 
      icon: <Briefcase size={16} />,
      hashtag: '#ActmiableDay',
      rule: '6:00 am to 6:00 pm: Corporate Typings Day.',
      description: 'Groups of 5-10 members. Think of an activity (not a game) where everyone can participate. Create a group name to receive a certificate!'
    },
    'Friday': { 
      title: 'Tagalog Day', 
      color: 'bg-yellow-50 text-yellow-600 border-yellow-100', 
      icon: <Sun size={16} />,
      rule: '6:00 am to 6:00 pm: Tagalog Only. (Quote non-Tagalog words)',
      description: 'Members are assigned to speak only in Tagalog. If you don\'t know the translation, quote the word.'
    },
    'Saturday': { 
      title: 'Moderators\' Day', 
      color: 'bg-pink-50 text-pink-600 border-pink-100', 
      icon: <Award size={16} />,
      rule: '6:00 am to 6:00 pm: Jejemon Typings Day. (Games 5pm-7pm)',
      description: 'Moderators\' hard work is appreciated and evaluated. They prepare games for members with certificate prizes. Group closed 5pm-7pm for games.'
    },
    'Sunday': { 
      title: 'No Cursing Day', 
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100', 
      icon: <Heart size={16} />,
      rule: '6:00 am to 6:00 pm: Conyo Day. NO CURSING allowed all day.',
      description: 'Refrain from bad words (censored or not). Share gospel words or bible verses (respect all beliefs).'
    },
  };

  const globalHashtags = [
    { tag: '#askmiable', desc: 'Queries, school related stuffs' },
    { tag: '#amigable', desc: 'Searching for friends, hoods, fams, squads' },
    { tag: '#actmiable', desc: 'Solo/group activities needing interaction' },
    { tag: '#AmIAware', desc: 'Monday awareness entries' },
    { tag: '#ActmiableDay', desc: 'Thursday activity groups' }
  ];

  const fetchData = async () => {
    try {
      const [pData, cData] = await Promise.all([
        mockDB.getActivityPosts(),
        mockDB.getActivityComments()
      ]);
      setPosts(pData.filter(p => p.day === currentDay).reverse());
      setComments(cData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentDay]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;

    try {
      await mockDB.addActivityPost({
        day: currentDay,
        topic: dayThemes[currentDay].title,
        content,
        groupName: currentDay === 'Thursday' ? groupName : undefined,
        userId: user!.uid,
        userName: profile?.displayName || user!.email,
        createdAt: new Date().toISOString()
      });
      setContent('');
      setGroupName('');
      setShowForm(false);
      fetchData();
    } catch (e) {
      alert('Failed to post activity');
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!newComment) return;

    try {
      await mockDB.addActivityComment({
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
    <div className="space-y-12 py-10 max-w-6xl mx-auto">
      {/* Daily Theme Banner */}
      <header className="bento-card bg-white p-10 border-none shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
          {dayThemes[currentDay].icon}
        </div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm inline-block mb-4",
                dayThemes[currentDay].color
              )}>
                {currentDay} • {dayThemes[currentDay].title}
              </span>
              <h1 className="text-6xl font-serif font-bold tracking-tight text-bento-text leading-[1.1]">
                Daily Activities
              </h1>
            </div>
            
            {isMember && (
              <button 
                onClick={() => setShowForm(!showForm)}
                className="bento-button-primary py-4 px-10 flex items-center gap-3 text-lg"
              >
                {showForm ? 'Cancel' : <><Plus size={20} /> Join the Theme</>}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-bento-border/50">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-bento-secondary text-[11px] font-bold uppercase tracking-widest">
                <Info size={14} />
                <span>Today's Focus</span>
              </div>
              <p className="text-bento-muted text-lg leading-relaxed italic">
                "{dayThemes[currentDay].description}"
              </p>
              {dayThemes[currentDay].hashtag && (
                <div className="flex items-center gap-2 text-bento-primary font-bold text-xl">
                  <Hash size={18} />
                  <span>{dayThemes[currentDay].hashtag}</span>
                </div>
              )}
            </div>

            {dayThemes[currentDay].rule && (
              <div className={cn(
                "p-6 rounded-3xl border-2 border-dashed animate-pulse",
                isTimeWindow ? "bg-red-50 border-red-200" : "bg-bento-bg border-bento-border"
              )}>
                <div className="flex items-center gap-3 mb-2">
                  <ShieldAlert size={18} className="text-red-500" />
                  <span className="text-xs font-black uppercase tracking-widest text-red-600">Active Regulation</span>
                </div>
                <p className="text-xl font-sans font-bold text-red-800 leading-tight">
                  {dayThemes[currentDay].rule}
                </p>
                <div className="mt-3 flex items-center gap-2 text-[10px] text-red-600/70 font-bold uppercase">
                  <AlertCircle size={12} />
                  <span>Monitored by Admin & Moderators</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Hashtags Reference */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {globalHashtags.map(h => (
          <div key={h.tag} className="bento-card bg-bento-bg p-5 border-none flex items-center gap-4 group hover:bg-white transition-all shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-bento-secondary shadow-sm group-hover:scale-110 transition-transform">
              <Hash size={18} />
            </div>
            <div>
              <h4 className="font-sans font-bold text-xs text-bento-text">{h.tag}</h4>
              <p className="text-[10px] text-bento-muted leading-tight mt-0.5">{h.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bento-card bg-white p-10 border-bento-primary/20 shadow-2xl space-y-8">
              <div className="flex items-center gap-3 text-bento-primary">
                <Sparkles size={24} />
                <h3 className="text-2xl font-serif font-bold">Post your entry</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {currentDay === 'Thursday' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-bento-muted ml-1">Team / Group Name (Min 5, Max 10 members)</label>
                    <input 
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Enter your group name to earn certificates..."
                      className="w-full px-6 py-4 bg-bento-bg rounded-2xl border-none focus:ring-2 focus:ring-bento-primary/20 text-lg font-sans"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-bento-muted ml-1">Content</label>
                  <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={`Compose your ${currentDay} contribution...`}
                    className="w-full p-8 bg-bento-bg rounded-[32px] border-none focus:ring-2 focus:ring-bento-primary/20 min-h-[180px] text-xl font-sans italic"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {dayThemes[currentDay].hashtag && <span className="bento-pill text-xs">{dayThemes[currentDay].hashtag}</span>}
                  <span className="bento-pill text-xs">#DailyActivities</span>
                </div>
                <button type="submit" className="bento-button-secondary py-4 px-12 text-lg">
                  Submit Post
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feed */}
      <div className="space-y-10">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bento-card group p-0 bg-white border-none shadow-md overflow-hidden hover:shadow-2xl transition-all duration-500"
          >
            <div className="p-10 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-bento-bg flex items-center justify-center text-bento-primary shadow-inner">
                    {post.groupName ? <Users size={28} /> : dayThemes[currentDay].icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-serif font-bold text-bento-text flex items-center gap-2">
                      {post.userName}
                      {post.groupName && <span className="text-xs px-3 py-1 bg-orange-100 text-orange-600 rounded-lg">Team: {post.groupName}</span>}
                    </h4>
                    <div className="flex items-center gap-3 text-[10px] text-bento-muted font-bold uppercase tracking-widest mt-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {post.groupName && currentDay === 'Saturday' && (
                  <div className="flex items-center gap-2 text-green-500 bg-green-50 px-4 py-2 rounded-xl border border-green-100 animate-bounce">
                    <Trophy size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Certificate Ready</span>
                  </div>
                )}
              </div>

              <div className="relative">
                <Quote className="absolute -top-4 -left-4 text-bento-border opacity-20" size={48} />
                <p className="text-2xl font-sans text-bento-text leading-relaxed whitespace-pre-wrap px-2">
                  {post.content}
                </p>
              </div>
            </div>

            <div className="bg-bento-bg/30 px-10 py-6 border-t border-bento-border/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <button className="flex items-center gap-2.5 text-bento-muted hover:text-red-500 transition-all group/btn">
                    <Heart size={20} className="group-hover/btn:fill-red-500 group-hover/btn:scale-125 transition-all" />
                    <span className="text-xs font-black uppercase tracking-widest">Love</span>
                  </button>
                  <button 
                    onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                    className="flex items-center gap-2.5 text-bento-muted hover:text-bento-primary transition-all"
                  >
                    <MessageCircle size={20} />
                    <span className="text-xs font-black uppercase tracking-widest">
                      {comments.filter(c => c.postId === post.id).length} Comments
                    </span>
                  </button>
                </div>
                <button className="text-bento-muted hover:text-bento-secondary transition-all">
                  <Share2 size={18} />
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
                    <div className="mt-8 space-y-4 max-h-[400px] overflow-y-auto no-scrollbar pr-2 mb-8">
                      {comments.filter(c => c.postId === post.id).map(comment => (
                        <div key={comment.id} className="bg-white p-5 rounded-2xl border border-bento-border/20 shadow-sm flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-bento-bg flex items-center justify-center text-[10px] font-black text-bento-muted uppercase">
                            {comment.userName.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-black uppercase text-bento-secondary">{comment.userName}</span>
                              <span className="text-[8px] text-bento-muted font-bold">{formatDate(comment.createdAt)}</span>
                            </div>
                            <p className="text-sm text-bento-text leading-relaxed">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4">
                      <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add your voice to this pulse..."
                        className="flex-1 px-6 py-4 bg-white rounded-2xl border border-bento-border/50 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-bento-primary/20"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      />
                      <button 
                        onClick={() => handleAddComment(post.id)}
                        className="w-12 h-12 rounded-2xl bg-bento-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shadow-bento-primary/20"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}

        {posts.length === 0 && !loading && (
          <div className="text-center py-40 bg-white rounded-[40px] border-2 border-dashed border-bento-border">
            <Sparkles size={64} className="mx-auto text-bento-border mb-6 animate-pulse" />
            <h3 className="text-3xl font-serif font-bold text-bento-muted">The Pulse is Quiet</h3>
            <p className="mt-2 text-bento-muted/60 font-sans">Be the first to share something for {dayThemes[currentDay].title}!</p>
          </div>
        )}
      </div>

      {/* Recognition Section for Sunday */}
      {currentDay === 'Sunday' && (
        <section className="bento-card bg-white p-12 border-none shadow-2xl">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-16 h-16 rounded-[24px] bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Trophy size={32} />
            </div>
            <div>
              <h2 className="text-4xl font-serif font-bold text-bento-text">Weekly recognition</h2>
              <p className="text-bento-muted uppercase text-xs font-bold tracking-widest mt-1">Celebrating our loud & interactive members</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="p-6 bg-bento-bg rounded-3xl text-center border-2 border-transparent hover:border-indigo-200 transition-all group">
                <div className="w-12 h-12 rounded-full bg-white mx-auto mb-4 flex items-center justify-center text-indigo-400 font-black shadow-sm group-hover:scale-110 transition-transform">
                  {idx}
                </div>
                <h4 className="font-sans font-bold text-sm text-bento-text">Member Name</h4>
                <p className="text-[10px] text-bento-muted uppercase tracking-widest mt-1">Amiable Member</p>
              </div>
            ))}
          </div>
          
          <div className="mt-10 p-6 bg-indigo-50 rounded-3xl flex items-center gap-4 text-indigo-800">
            <Heart size={20} className="text-indigo-400" />
            <p className="text-sm italic">"Thank you for your hard work and interactive contribution to the group this week. Here is a little token for your amiability!"</p>
          </div>
        </section>
      )}
    </div>
  );
};

