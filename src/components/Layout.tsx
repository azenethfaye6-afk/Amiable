import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Image as ImageIcon, MessageSquare, Shield, Users, Briefcase, User, LayoutDashboard, Globe, Lightbulb, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { useSeasonalTheme } from '../hooks/useSeasonalTheme';
import { cn } from '../lib/utils';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isAdmin, isModerator, isMember, logout } = useAuth();
  const { theme, currentTrivia } = useSeasonalTheme();
  const location = useLocation();

  const handleSignOut = () => logout();

  const activeClass = "text-bento-primary border-b-2 border-bento-primary pb-1";
  const inactiveClass = "text-bento-muted hover:text-bento-primary transition-colors";

  return (
    <div className="min-h-screen flex flex-col bg-bento-bg">
      <header className="max-w-7xl mx-auto w-full px-6 py-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <motion.div 
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            className="w-10 h-10 bg-bento-primary rounded-full flex items-center justify-center text-white font-serif font-bold text-2xl"
          >
            A
          </motion.div>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-bento-secondary">amiable</h1>
        </Link>

        {/* Trivia Banner (Desktop) */}
        <div className="hidden xl:flex items-center gap-4 bg-bento-accent/50 px-6 py-2 rounded-full border border-bento-border/50 max-w-sm">
          <Lightbulb size={20} className="text-bento-primary animate-pulse shrink-0" />
          <AnimatePresence mode="wait">
            <motion.p 
              key={currentTrivia}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-[10px] sm:text-xs font-serif italic text-bento-secondary truncate"
            >
              {currentTrivia}
            </motion.p>
          </AnimatePresence>
        </div>

        <nav className="hidden lg:flex items-center gap-8 text-[11px] font-sans font-bold uppercase tracking-widest overflow-x-auto no-scrollbar py-2">
          <Link to="/" className={location.pathname === '/' ? activeClass : inactiveClass + " flex items-center gap-2"}>
            <Home size={14} /> Home
          </Link>

          <Link to="/activities" className={location.pathname === '/activities' ? activeClass : inactiveClass + " flex items-center gap-2"}>
            <Globe size={14} /> Activities
          </Link>
          
          {isMember && (
            <>
              <Link to="/timeline" className={location.pathname === '/timeline' ? activeClass : inactiveClass + " flex items-center gap-2"}>
                <LayoutDashboard size={14} /> Timeline
              </Link>
              <Link to="/members" className={location.pathname === '/members' ? activeClass : inactiveClass + " flex items-center gap-2"}>
                <Users size={14} /> Members
              </Link>
              <Link to="/gallery" className={location.pathname === '/gallery' ? activeClass : inactiveClass + " flex items-center gap-2"}>
                <ImageIcon size={14} /> Memories
              </Link>
            </>
          )}

          {user && (
            <Link to="/profile" className={location.pathname === '/profile' ? activeClass : inactiveClass + " flex items-center gap-2"}>
              <User size={14} /> Me
            </Link>
          )}

          {isModerator && (
            <Link to="/moderator" className={location.pathname === '/moderator' ? activeClass : inactiveClass + " flex items-center gap-2"}>
              <Shield size={14} /> Safety
            </Link>
          )}

          {!isMember && profile?.applicationStatus === 'none' && (
            <Link to="/apply" className={location.pathname === '/apply' ? activeClass : inactiveClass + " flex items-center gap-2"}>
              <Briefcase size={14} /> Join
            </Link>
          )}

          {isModerator && (
            <Link to="/moderator" className={location.pathname === '/moderator' ? activeClass : inactiveClass + " flex items-center gap-2"}>
              <Shield size={14} /> Safety
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" className={location.pathname === '/admin' ? activeClass : inactiveClass + " flex items-center gap-2"}>
              <Users size={14} /> Lords
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex flex-col items-end mr-2">
             <span className="text-[8px] font-black uppercase tracking-[0.2em] text-bento-muted">Current Theme</span>
             <span className="text-[10px] font-bold text-bento-primary flex items-center gap-1">
               <Sparkles size={10} /> {theme.name}
             </span>
          </div>
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <div className="bento-pill py-1 px-3 text-[10px] bg-white border-bento-border text-bento-text">
                  {profile?.role.toUpperCase()}
                </div>
              </div>
              <div 
                className="w-10 h-10 rounded-full bg-bento-border border-2 border-white shadow-sm flex items-center justify-center text-sm font-bold overflow-hidden"
              >
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile?.displayName?.slice(0,2).toUpperCase() || '??'
                )}
              </div>
              <button 
                onClick={handleSignOut}
                className="p-2 text-bento-muted hover:text-bento-secondary transition-colors"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="bento-button-primary py-2 px-6">Sign In</Link>
          )}
        </div>
      </header>

      {isMember && (
        <div className="max-w-7xl mx-auto w-full px-6 mb-8 overflow-x-auto no-scrollbar">
          <nav className="flex items-center gap-6 py-2 border-b border-bento-border/30 text-[10px] font-bold uppercase tracking-widest min-w-max">
            <Link to="/announcements" className={location.pathname === '/announcements' ? "text-bento-primary" : "text-bento-muted hover:text-bento-primary transition-colors"}>
              Announcements
            </Link>
            <Link to="/rules" className={location.pathname === '/rules' ? "text-bento-primary" : "text-bento-muted hover:text-bento-primary transition-colors"}>
              Rules and Regulation
            </Link>
            <Link to="/activities" className={location.pathname === '/activities' ? "text-bento-primary" : "text-bento-muted hover:text-bento-primary transition-colors"}>
              Daily Activities
            </Link>
            <Link to="/birthdays" className={location.pathname === '/birthdays' ? "text-bento-primary" : "text-bento-muted hover:text-bento-primary transition-colors"}>
              Celebrations
            </Link>
            <Link to="/suggestions" className={location.pathname === '/suggestions' ? "text-bento-primary" : "text-bento-muted hover:text-bento-primary transition-colors"}>
              Suggestions
            </Link>
            <Link to="/resources" className={location.pathname === '/resources' ? "text-bento-primary" : "text-bento-muted hover:text-bento-primary transition-colors"}>
              Resources
            </Link>
            <Link to="/medical" className={location.pathname === '/medical' ? "text-bento-primary" : "text-bento-muted hover:text-bento-primary transition-colors"}>
              Medical Box
            </Link>
            <Link to="/badges" className={location.pathname === '/badges' ? "text-bento-primary" : "text-bento-muted hover:text-bento-primary transition-colors"}>
              Honors
            </Link>
            {isAdmin && (
              <Link to="/keywords" className={location.pathname === '/keywords' ? "text-red-500" : "text-bento-muted hover:text-red-500 transition-colors"}>
                Security
              </Link>
            )}
          </nav>
          
          {/* Mobile/Small Screen Trivia */}
          <div className="xl:hidden flex items-center gap-2 mt-4 py-2 px-4 bg-bento-accent/30 rounded-xl border border-bento-border/30">
            <Lightbulb size={14} className="text-bento-primary shrink-0" />
            <AnimatePresence mode="wait">
              <motion.p 
                key={currentTrivia}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-[9px] font-serif italic text-bento-secondary leading-tight"
              >
                {currentTrivia}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 pb-20">
        {children}
      </main>

      <footer className="py-12 border-t border-bento-border/30">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <p className="font-serif italic text-xl text-bento-secondary opacity-60">"Creating and preserving community memories, beautifully."</p>
          <div className="flex justify-center gap-4">
            <span className="w-2 h-2 rounded-full bg-bento-border" />
            <span className="w-2 h-2 rounded-full bg-bento-primary" />
            <span className="w-2 h-2 rounded-full bg-bento-border" />
          </div>
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] font-bold text-bento-muted opacity-60">© 2026 Amiable Community</p>
        </div>
      </footer>
    </div>
  );
};

