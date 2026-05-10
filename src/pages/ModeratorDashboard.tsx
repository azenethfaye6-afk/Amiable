import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserProfile, UserRole } from '../types';
import { mockDB } from '../lib/mockBackend';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, VolumeX, Ban, UserCheck, Search, Activity, Clock, AlertTriangle, Bell, Cake, Gift } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';

export const ModeratorDashboard: React.FC = () => {
  const { user, isModerator } = useAuth();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [allApplications, modLogs, nData] = await Promise.all([
          mockDB.getApplications(),
          mockDB.getModLogs(),
          mockDB.getNotifications()
        ]);
        
        setLogs(modLogs);
        setNotifications(nData.filter(n => n.userId === 'staff_broadcast').reverse());
        
        const memberIds = [...new Set(allApplications.map(a => a.userId))];
        
        const memberProfiles = await Promise.all(
          memberIds.map(id => mockDB.getUser(id))
        );
        
        setMembers(memberProfiles.filter((p): p is UserProfile => p !== null && (p.role === UserRole.MEMBER || p.isBanned)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (isModerator) fetchUsers();
  }, [isModerator]);

  const handleModAction = async (targetUid: string, action: 'mute' | 'unmute' | 'ban') => {
    const reason = prompt(`Enter reason for ${action}:`);
    if (!reason) return;

    try {
      await mockDB.moderatorAction(targetUid, action, reason, user!.uid);
      // Refresh local state
      const [updatedUser, updatedLogs] = await Promise.all([
        mockDB.getUser(targetUid),
        mockDB.getModLogs()
      ]);
      
      if (updatedUser) {
        setMembers(members.map(m => m.uid === targetUid ? updatedUser : m));
      }
      setLogs(updatedLogs);
      alert(`User ${action}ed successfully.`);
    } catch (e) {
      alert('Action failed');
    }
  };

  if (!isModerator) return <div>Access Denied</div>;

  const filteredMembers = members.filter(m => 
    m.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 py-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2 text-bento-primary">
            <Shield size={20} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Safety Center</span>
          </div>
          <h1 className="text-5xl font-sans font-medium tracking-tight text-bento-text">
            Moderator Dashboard
          </h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-bento-muted" size={16} />
          <input 
            type="text" 
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-6 py-3 bg-white border border-bento-border rounded-xl font-sans focus:outline-none focus:ring-2 focus:ring-bento-primary/20 transition-all w-full md:w-64"
          />
        </div>
      </header>
      
      {/* Notifications Bar */}
      {notifications.length > 0 && (
        <section className="bg-orange-50 border border-orange-100 rounded-[32px] p-8 shadow-sm">
          <div className="flex items-center gap-3 text-orange-600 mb-6 font-sans font-bold uppercase tracking-widest text-xs">
            <Bell size={18} />
            <span>Staff Action Required / Notifications</span>
          </div>
          <div className="space-y-4">
            {notifications.slice(0, 3).map(notif => (
              <div key={notif.id} className="flex items-center justify-between bg-white/60 p-4 rounded-2xl border border-orange-100/50 group hover:bg-white transition-all">
                <div className="flex items-center gap-4">
                  {notif.type === 'birthday' ? (
                    <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500">
                      <Cake size={18} />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                      <AlertTriangle size={18} />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-bento-text">{notif.title}</h4>
                    <p className="text-xs text-bento-muted">{notif.message}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-orange-300 uppercase">{formatDate(notif.createdAt)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map(member => (
          <motion.div
            key={member.uid}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bento-card group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <img src={member.photoURL} alt="" className="w-12 h-12 rounded-full border-2 border-bento-border" />
                <div>
                  <h3 className="font-sans font-bold text-lg">{member.displayName}</h3>
                  <p className="text-xs text-bento-muted">{member.email}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {member.isBanned && <span className="bento-pill bg-red-100 text-red-600 border-none px-3 py-1">Banned</span>}
                {member.isMuted && <span className="bento-pill bg-orange-100 text-orange-600 border-none px-3 py-1">Muted</span>}
                {!member.isBanned && !member.isMuted && <span className="bento-pill bg-green-100 text-green-600 border-none px-3 py-1">Active</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {member.isMuted ? (
                <button 
                  onClick={() => handleModAction(member.uid, 'unmute')}
                  className="flex items-center justify-center gap-2 py-3 bg-bento-bg rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-green-50 hover:text-green-600 transition-colors"
                >
                  <UserCheck size={14} /> Unmute
                </button>
              ) : (
                <button 
                  onClick={() => handleModAction(member.uid, 'mute')}
                  disabled={member.isBanned}
                  className="flex items-center justify-center gap-2 py-3 bg-bento-bg rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-orange-50 hover:text-orange-600 transition-colors disabled:opacity-30"
                >
                  <VolumeX size={14} /> Mute
                </button>
              )}
              
              <button 
                onClick={() => handleModAction(member.uid, 'ban')}
                disabled={member.isBanned}
                className="flex items-center justify-center gap-2 py-3 bg-bento-bg rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-30"
              >
                <Ban size={14} /> Ban
              </button>
            </div>
            
            <button 
              onClick={() => setExpandedMember(expandedMember === member.uid ? null : member.uid)}
              className="mt-4 pt-4 w-full border-t border-bento-border/50 flex items-center justify-between text-[10px] text-bento-muted font-bold uppercase hover:text-bento-primary transition-colors"
            >
              <div className="flex items-center gap-2">
                <Activity size={12} />
                <span>Moderation History</span>
              </div>
              <motion.div
                animate={{ rotate: expandedMember === member.uid ? 90 : 0 }}
              >
                <ArrowIcon size={12} />
              </motion.div>
            </button>

            <AnimatePresence>
              {expandedMember === member.uid && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-3">
                    {logs.filter(l => l.targetUid === member.uid).length > 0 ? (
                      logs.filter(l => l.targetUid === member.uid).reverse().map(log => (
                        <div key={log.id} className="p-3 bg-bento-bg rounded-lg border border-bento-border/30">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {log.action === 'ban' && <Ban size={10} className="text-red-500" />}
                              {log.action === 'mute' && <VolumeX size={10} className="text-orange-500" />}
                              {log.action === 'unmute' && <UserCheck size={10} className="text-green-500" />}
                              <span className="text-[9px] font-black uppercase tracking-tighter text-bento-text">
                                {log.action}ed
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-bento-muted">
                              <Clock size={10} />
                              <span className="text-[8px] font-bold uppercase">{formatDate(log.timestamp)}</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-bento-text leading-tight bg-white p-2 rounded mt-2 border border-bento-border/20 italic">
                            "{log.reason}"
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2 text-[9px] text-bento-muted italic py-2">
                        <AlertTriangle size={10} />
                        <span>No moderation history found.</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-bento-border">
          <p className="font-sans text-bento-muted">No members found matching your search.</p>
        </div>
      )}
    </div>
  );
};

const ArrowIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14m-7-7 7 7-7 7" />
  </svg>
);
