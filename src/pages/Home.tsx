import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Event, Photo, ApplicationStatus } from '../types';
import { mockDB } from '../lib/mockBackend';
import { motion } from 'motion/react';
import { Calendar, Image as ImageIcon, ArrowRight, Star, Plus, Shield } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export const Home: React.FC = () => {
  const { user, profile, isMember, isAdmin } = useAuth();
  const [latestEvent, setLatestEvent] = useState<Event | null>(null);
  const [recentPhotos, setRecentPhotos] = useState<Photo[]>([]);
  const [appsCount, setAppsCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evts, phs, apps] = await Promise.all([
          mockDB.getEvents(),
          mockDB.getPhotos(),
          mockDB.getApplications()
        ]);
        
        if (evts.length > 0) {
          setLatestEvent(evts[evts.length - 1]);
        }
        
        if (isMember) {
          setRecentPhotos(phs.slice(-1));
        }

        if (isAdmin) {
          const pendingApps = apps.filter(a => a.status === 'pending');
          setAppsCount(pendingApps.length);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [isMember, isAdmin]);

  if (!user || (!isMember && profile?.applicationStatus === ApplicationStatus.NONE)) {
    return (
      <div className="space-y-12 py-10">
        <section className="bento-card bg-bento-secondary text-white p-12 md:p-24 overflow-hidden relative">
          <div className="relative z-10 max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-serif leading-[0.9] mb-8"
            >
              Captured <br />
              <span className="italic font-light opacity-60">with Kindness.</span>
            </motion.h2>
            <p className="text-lg font-sans opacity-70 mb-10 max-w-lg leading-relaxed">
              Amiable is a private circle for community memories. We use themed frames to celebrate every moment together.
            </p>
            <button 
              onClick={() => navigate(user ? '/apply' : '/login')}
              className="bg-white text-bento-secondary px-10 py-5 rounded-xl font-sans font-bold uppercase text-xs tracking-[0.2em] transition-all hover:shadow-xl"
            >
              {user ? 'Complete Application' : 'Request to Join'}
            </button>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
            <div className="w-[200%] h-[200%] border-[60px] border-white rounded-full -mt-[50%]" />
          </div>
        </section>

        {latestEvent && (
          <section className="bento-card grid md:grid-cols-2 gap-12 items-center">
             <div className="space-y-6">
                <div className="bento-pill inline-block">Starting Soon</div>
                <h3 className="text-5xl font-serif font-bold">{latestEvent.title}</h3>
                <p className="text-lg opacity-60 leading-relaxed font-serif italic text-bento-muted">{latestEvent.description}</p>
                <div className="pt-6 flex gap-12 text-[10px] font-bold uppercase tracking-[0.2em] text-bento-muted">
                  <div>
                    <p className="mb-1 opacity-40">Date</p>
                    <p className="text-bento-secondary">{formatDate(latestEvent.date)}</p>
                  </div>
                  <div>
                    <p className="mb-1 opacity-40">Theme</p>
                    <p className="text-bento-secondary">{latestEvent.themeName}</p>
                  </div>
                </div>
             </div>
             <div className="themed-frame aspect-video">
                <img src={`https://picsum.photos/seed/${latestEvent.id}/800/600`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
             </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 auto-rows-[160px]">
      {/* Featured Memory / Current Event */}
      <div className="col-span-12 lg:col-span-8 row-span-4 bento-card flex flex-col">
        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-bento-primary mb-1">Current Collection</p>
            <h2 className="text-4xl font-serif font-bold">{latestEvent?.title || 'Our Memories'}</h2>
          </div>
          <span className="text-xs italic text-bento-muted font-serif">
            {latestEvent ? formatDate(latestEvent.date) : 'Collective Archive'}
          </span>
        </div>
        
        <div className="flex-grow themed-frame">
          <div className="w-full h-full bg-bento-accent flex items-center justify-center overflow-hidden">
            {recentPhotos[0] ? (
              <img 
                src={recentPhotos[0].url} 
                alt="Latest Memory" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-center opacity-40">
                <ImageIcon size={64} className="mx-auto mb-2 text-bento-primary/40" />
                <p className="text-sm italic font-serif">Awaiting the first memory of this theme...</p>
              </div>
            )}
          </div>
          <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-1 text-[10px] font-bold rounded shadow-sm uppercase tracking-tighter">
            {latestEvent?.themeName || 'Standard'} FRAME APPLIED
          </div>
        </div>
      </div>

      {/* Admin Alert Card */}
      <div className="col-span-12 md:col-span-6 lg:col-span-4 row-span-2 bento-card bg-bento-secondary text-white flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="animate-pulse w-2 h-2 bg-orange-400 rounded-full"></span>
            <p className="text-[10px] uppercase font-bold tracking-widest text-orange-200">Admin Alert</p>
          </div>
          <h3 className="text-2xl font-serif leading-tight">
            {latestEvent?.status === 'upcoming' ? `Upcoming: ${latestEvent.title}` : 'No New Announcements'}
          </h3>
          <p className="text-xs text-orange-100/70 line-clamp-2">
            {latestEvent ? latestEvent.description : 'Stay tuned for our next community gathering announcement.'}
          </p>
        </div>
        <button 
          onClick={() => navigate('/gallery')}
          className="w-full bg-white text-bento-secondary py-3 rounded-xl text-xs font-bold uppercase tracking-tighter mt-4"
        >
          View Event Details
        </button>
      </div>

      {/* Membership / Management Card */}
      <div className="col-span-12 md:col-span-6 lg:col-span-4 row-span-2 bento-card bg-bento-accent flex flex-col">
        <h3 className="text-sm font-bold text-bento-primary uppercase mb-4 tracking-tighter">Community Flow</h3>
        {isAdmin ? (
          <div className="flex-grow space-y-3">
             <p className="text-xs text-bento-secondary mb-2">Review pending membership requests.</p>
             <div className="bg-white/50 p-3 rounded-xl border border-bento-border flex justify-between items-center transition-all hover:bg-white">
                <span className="text-[11px] font-medium font-sans">
                  {appsCount} Applications Pending
                </span>
                <button 
                  onClick={() => navigate('/admin')}
                  className="text-[11px] font-bold text-bento-primary hover:underline"
                >
                  Review
                </button>
             </div>
             <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest pt-2">Admin View</p>
          </div>
        ) : (
          <div className="flex-grow flex flex-col justify-center text-center space-y-2">
            <Star size={32} className="mx-auto text-bento-primary/50" />
            <p className="text-xs font-medium text-bento-secondary">You are a recognized Member</p>
            <p className="text-[10px] opacity-60 font-sans italic">Contribution Level: Friendly</p>
          </div>
        )}
      </div>

      {/* Suggest Theme Card */}
      <div className="col-span-12 md:col-span-6 lg:col-span-4 row-span-2 bento-card flex flex-col">
        <h3 className="text-sm font-bold text-bento-primary mb-3 uppercase tracking-tighter">Theme Lab</h3>
        <p className="text-xs text-bento-muted mb-4 italic">Next event selection is being brainstormed.</p>
        <div className="flex-grow flex items-center justify-center border-2 border-dashed border-bento-border rounded-2xl group cursor-pointer hover:bg-bento-bg transition-colors" onClick={() => navigate('/suggestions')}>
           <div className="text-center group-hover:scale-110 transition-transform">
              <Plus size={24} className="mx-auto text-bento-primary mb-1" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-bento-primary">Suggest a Theme</span>
           </div>
        </div>
      </div>

      {/* Journey Stats */}
      <div className="col-span-12 md:col-span-6 lg:col-span-4 row-span-2 bento-card flex justify-around items-center">
        <div className="text-center">
          <span className="block text-4xl font-serif text-bento-secondary font-bold">24</span>
          <span className="text-[10px] font-bold text-bento-muted uppercase tracking-[0.2em]">Events</span>
        </div>
        <div className="h-10 w-[1px] bg-bento-border"></div>
        <div className="text-center">
          <span className="block text-4xl font-serif text-bento-secondary font-bold">412</span>
          <span className="text-[10px] font-bold text-bento-muted uppercase tracking-[0.2em]">Photos</span>
        </div>
        <div className="h-10 w-[1px] bg-bento-border"></div>
        <div className="text-center">
          <span className="block text-4xl font-serif text-bento-secondary font-bold">12k</span>
          <span className="text-[10px] font-bold text-bento-muted uppercase tracking-[0.2em]">Views</span>
        </div>
      </div>

      {/* Member Vault Card */}
      <div className="col-span-12 md:col-span-12 lg:col-span-4 row-span-2 bento-card bg-bento-muted text-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold uppercase tracking-tighter">Member Vault</h3>
          <Shield size={16} className="opacity-60" />
        </div>
        <ul className="text-xs space-y-3 opacity-90 font-sans">
          <li className="flex items-center gap-3 cursor-pointer hover:translate-x-1 transition-transform">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            Previous Event Frames
          </li>
          <li className="flex items-center gap-3 cursor-pointer hover:translate-x-1 transition-transform">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            Appetizer Recipes (PDF)
          </li>
          <li className="flex items-center gap-3 cursor-pointer hover:translate-x-1 transition-transform">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            Community Guidelines
          </li>
        </ul>
      </div>
    </div>
  );
};

