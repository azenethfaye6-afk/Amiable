import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDB } from '../lib/mockBackend';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Shield, UserPlus, Trash2, Plus, Search, Check, Info, Sparkles, Star, Heart, Flame, Zap, Trophy, Medal } from 'lucide-react';
import { cn } from '../lib/utils';
import { Badge, UserBadge, UserProfile } from '../types';

const ICON_MAP: Record<string, any> = {
  Award, Shield, Sparkles, Star, Heart, Flame, Zap, Trophy, Medal, Info
};

const COLOR_MAP: Record<string, string> = {
  'bg-blue-500': 'Blue',
  'bg-red-500': 'Red',
  'bg-green-500': 'Green',
  'bg-yellow-500': 'Yellow',
  'bg-purple-500': 'Purple',
  'bg-pink-500': 'Pink',
  'bg-indigo-500': 'Indigo',
  'bg-orange-500': 'Orange'
};

export const BadgeCenter: React.FC = () => {
  const { user, isModerator, isAdmin } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Admin form state
  const [showAddBadge, setShowAddBadge] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('Award');
  const [newColor, setNewColor] = useState('bg-blue-500');

  // Assign form state
  const [selectedBadge, setSelectedBadge] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [allBadges, allUserBadges, applications] = await Promise.all([
        mockDB.getBadges(),
        mockDB.getUserBadges(),
        mockDB.getApplications()
      ]);

      setBadges(allBadges);
      setUserBadges(allUserBadges);

      // Get unique members from applications
      const memberIds = [...new Set(applications.map(a => a.userId))];
      const memberData = await Promise.all(memberIds.map(id => mockDB.getUser(id)));
      setMembers(memberData.filter(u => u) as UserProfile[]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mockDB.addBadge({
        name: newName,
        description: newDesc,
        icon: newIcon,
        color: newColor,
        createdAt: new Date().toISOString()
      });
      setNewName('');
      setNewDesc('');
      setShowAddBadge(false);
      fetchData();
    } catch (e) {
      alert('Failed to add badge');
    }
  };

  const handleAssignBadge = async () => {
    if (!selectedBadge || !selectedUser) return;
    
    const badge = badges.find(b => b.id === selectedBadge);
    const member = members.find(m => m.uid === selectedUser);
    
    if (!badge || !member) return;

    // Check if user already has this badge
    const alreadyHas = userBadges.some(ub => ub.userId === selectedUser && ub.badgeId === selectedBadge);
    if (alreadyHas) {
      alert('User already has this badge');
      return;
    }

    try {
      await mockDB.addUserBadge({
        userId: selectedUser,
        badgeId: selectedBadge,
        badgeName: badge.name,
        badgeIcon: badge.icon,
        badgeColor: badge.color,
        grantedBy: user!.uid,
        grantedAt: new Date().toISOString()
      });
      setSelectedUser('');
      fetchData();
    } catch (e) {
      alert('Failed to assign badge');
    }
  };

  const filteredMembers = members.filter(m => 
    m.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canManage = isAdmin || isModerator;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 space-y-12">
      <header className="space-y-4">
        <div className="flex items-center gap-3 text-bento-secondary uppercase text-[10px] font-black tracking-widest">
          <Award size={14} /> <span>Amiability Rewards</span>
        </div>
        <h1 className="text-6xl font-serif font-bold text-bento-text">
          Badge Center
        </h1>
        <p className="text-xl text-bento-muted font-sans italic max-w-2xl">
          Celebrating the spirit of our community. Badges reflect your contributions, milestones, and amiable nature.
        </p>
      </header>

      {/* Your Badges Section (Only if user has some) */}
      <section className="space-y-8">
        <h2 className="text-3xl font-serif font-bold flex items-center gap-3">
          <Star className="text-yellow-400" /> Your Achievements
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {userBadges.filter(ub => ub.userId === user?.uid).map((ub, idx) => {
            const IconComp = ICON_MAP[ub.badgeIcon] || Award;
            return (
              <motion.div 
                key={ub.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bento-card group flex flex-col items-center p-6 text-center bg-white shadow-lg hover:shadow-2xl transition-all"
              >
                <div className={cn(
                  "w-16 h-16 rounded-[24px] flex items-center justify-center text-white mb-4 shadow-xl transition-transform group-hover:rotate-12",
                  ub.badgeColor
                )}>
                  <IconComp size={32} />
                </div>
                <h3 className="font-serif font-black text-sm text-bento-text">{ub.badgeName}</h3>
                <p className="text-[8px] text-bento-muted uppercase mt-1 tracking-tighter">
                  Granted {new Date(ub.grantedAt).toLocaleDateString()}
                </p>
              </motion.div>
            );
          })}
          {userBadges.filter(ub => ub.userId === user?.uid).length === 0 && (
            <div className="col-span-full py-12 bg-bento-bg/30 rounded-[40px] border-2 border-dashed border-bento-border text-center">
              <p className="text-bento-muted italic">No badges earned yet. Stay active in the community!</p>
            </div>
          )}
        </div>
      </section>

      {/* Admin Management Section */}
      {canManage && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Create Badge */}
          <div className="bento-card bg-white p-10 shadow-2xl space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-serif font-bold flex items-center gap-2">
                <Plus className="text-bento-primary" /> Create New Badge
              </h3>
            </div>
            
            <form onSubmit={handleAddBadge} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-bento-muted ml-1">Badge Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Amiability Expert"
                  className="w-full px-6 py-4 bg-bento-bg rounded-2xl border-none focus:ring-2 focus:ring-bento-primary/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-bento-muted ml-1">Description</label>
                <textarea 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What is this badge for?"
                  className="w-full px-6 py-4 bg-bento-bg rounded-2xl border-none focus:ring-2 focus:ring-bento-primary/20 min-h-[100px]"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-bento-muted ml-1">Icon</label>
                  <select 
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    className="w-full px-6 py-4 bg-bento-bg rounded-2xl border-none focus:ring-2 focus:ring-bento-primary/20"
                  >
                    {Object.keys(ICON_MAP).map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-bento-muted ml-1">Color</label>
                  <select 
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-full px-6 py-4 bg-bento-bg rounded-2xl border-none focus:ring-2 focus:ring-bento-primary/20"
                  >
                    {Object.entries(COLOR_MAP).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-6">
                <div className={cn(
                  "w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-xl",
                  newColor
                )}>
                  {React.createElement(ICON_MAP[newIcon] || Award, { size: 32 })}
                </div>
                <p className="text-xs text-bento-muted font-sans italic">Preview of the badge appearance</p>
              </div>

              <button type="submit" className="bento-button-primary w-full py-4 text-center">
                Initialize Badge
              </button>
            </form>
          </div>

          {/* Assign Badge */}
          <div className="bento-card bg-white p-10 shadow-2xl space-y-8">
            <h3 className="text-2xl font-serif font-bold flex items-center gap-2">
              <UserPlus className="text-bento-secondary" /> Grant Badge
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-bento-muted ml-1">Select Badge</label>
                <div className="grid grid-cols-4 gap-2">
                  {badges.map(badge => (
                    <button
                      key={badge.id}
                      onClick={() => setSelectedBadge(badge.id)}
                      className={cn(
                        "p-4 rounded-2xl flex flex-col items-center gap-1 transition-all border-2",
                        selectedBadge === badge.id ? "bg-bento-bg border-bento-primary" : "bg-transparent border-transparent grayscale opacity-50"
                      )}
                    >
                      <div className={cn("size-8 rounded-lg flex items-center justify-center text-white", badge.color)}>
                        {React.createElement(ICON_MAP[badge.icon] || Award, { size: 16 })}
                      </div>
                      <span className="text-[8px] font-black uppercase truncate w-full text-center">{badge.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-bento-muted ml-1">Search Member</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-bento-muted" size={18} />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Name or Email"
                    className="w-full pl-12 pr-6 py-4 bg-bento-bg rounded-2xl border-none focus:ring-2 focus:ring-bento-primary/20"
                  />
                </div>
                <div className="max-h-[200px] overflow-y-auto no-scrollbar space-y-2 mt-4 p-2 bg-bento-bg/30 rounded-2xl border border-bento-border/50">
                  {filteredMembers.map(member => (
                    <button
                      key={member.uid}
                      onClick={() => setSelectedUser(member.uid)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                        selectedUser === member.uid ? "bg-white shadow-md border-bento-primary border" : "hover:bg-white"
                      )}
                    >
                      <img src={member.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.uid}`} className="w-8 h-8 rounded-lg" />
                      <div className="text-left">
                        <p className="text-xs font-bold">{member.displayName}</p>
                        <p className="text-[8px] text-bento-muted uppercase">{member.role}</p>
                      </div>
                      {selectedUser === member.uid && <Check className="ml-auto text-green-500" size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleAssignBadge}
                disabled={!selectedBadge || !selectedUser}
                className="bento-button-secondary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Assign Badge <Award size={18} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Community Badges Feed */}
      <section className="space-y-8">
        <h2 className="text-3xl font-serif font-bold">Community Recognitions</h2>
        <div className="space-y-4">
          {[...userBadges].reverse().slice(0, 10).map((ub, idx) => {
            const member = members.find(m => m.uid === ub.userId);
            const IconComp = ICON_MAP[ub.badgeIcon] || Award;
            return (
              <motion.div 
                key={ub.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-6 p-6 bg-white rounded-[32px] shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className={cn("size-12 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0", ub.badgeColor)}>
                  <IconComp size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-sans italic text-bento-text">
                    <span className="font-serif font-bold text-bento-primary not-italic">{ub.badgeName}</span> was awarded to <span className="font-bold not-italic">{member?.displayName || 'A Member'}</span>!
                  </p>
                  <p className="text-[10px] text-bento-muted font-black uppercase tracking-widest mt-1">
                    Recognized on {new Date(ub.grantedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="hidden sm:block">
                   <div className="size-10 rounded-xl overflow-hidden border-2 border-white shadow-sm">
                      <img src={member?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ub.userId}`} className="size-full object-cover" />
                   </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
