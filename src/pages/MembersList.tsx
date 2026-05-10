import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDB } from '../lib/mockBackend';
import { motion } from 'motion/react';
import { Users, Search, UserPlus, Check, UserMinus, UserCheck, Shield, Award, Clock } from 'lucide-react';
import { UserProfile, FriendRequest, Friendship } from '../types';
import { cn } from '../lib/utils';

export const MembersList: React.FC = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [applications, requests, friends] = await Promise.all([
        mockDB.getApplications(),
        mockDB.getFriendRequests(),
        mockDB.getFriendships()
      ]);

      setFriendRequests(requests);
      setFriendships(friends);

      // Unique members from applications
      const memberIds = [...new Set(applications.map(a => a.userId))];
      const userData = await Promise.all(memberIds.map(id => mockDB.getUser(id)));
      setMembers(userData.filter(u => u && u.uid !== user?.uid)); // Exclude self
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (targetUser: UserProfile) => {
    try {
      await mockDB.addFriendRequest({
        senderId: user!.uid,
        senderName: user!.displayName || user!.email,
        receiverId: targetUser.uid,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      fetchData();
    } catch (e) {
      alert('Failed to send friend request');
    }
  };

  const getFriendStatus = (targetUid: string) => {
    const isFriend = friendships.some(f => 
      (f.user1Id === user?.uid && f.user2Id === targetUid) || 
      (f.user2Id === user?.uid && f.user1Id === targetUid)
    );
    if (isFriend) return 'friend';

    const hasSentRequest = friendRequests.some(r => r.senderId === user?.uid && r.receiverId === targetUid && r.status === 'pending');
    if (hasSentRequest) return 'pending';

    const hasReceivedRequest = friendRequests.some(r => r.receiverId === user?.uid && r.senderId === targetUid && r.status === 'pending');
    if (hasReceivedRequest) return 'received';

    return 'none';
  };

  const filteredMembers = members.filter(m => 
    m.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-bento-secondary uppercase text-[10px] font-black tracking-widest">
            <Users size={14} /> <span>Community Directory</span>
          </div>
          <h1 className="text-5xl font-serif font-bold text-bento-text">
            Discover Amiables
          </h1>
          <p className="text-lg text-bento-muted font-sans italic max-w-xl">
            Find and connect with other members by adding them to your amiable circle.
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-bento-muted" size={20} />
          <input 
            type="text" 
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-white rounded-[32px] border-none shadow-xl focus:ring-2 focus:ring-bento-primary/20 text-lg font-sans"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMembers.map((member, index) => {
          const status = getFriendStatus(member.uid);
          return (
            <motion.div
              key={member.uid}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bento-card group p-0 bg-white shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[24px] bg-bento-bg flex-shrink-0 overflow-hidden shadow-inner border-2 border-white group-hover:scale-110 transition-transform">
                    <img 
                      src={member.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.uid}`} 
                      alt="Avatar" 
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-serif font-bold text-bento-text flex items-center gap-2">
                      {member.displayName}
                      {member.role === 'admin' && <Shield size={14} className="text-red-400" />}
                      {member.role === 'moderator' && <Award size={14} className="text-blue-400" />}
                    </h4>
                    <p className="text-[10px] text-bento-muted font-bold uppercase tracking-widest mt-0.5">
                      {member.role || 'Member'}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-bento-muted font-sans line-clamp-2 italic h-10">
                  {member.bio || "No bio yet."}
                </p>
              </div>

              <div className="px-8 py-6 bg-bento-bg/30 border-t border-bento-border/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-bento-muted">
                  <UserPlus size={14} />
                  <span>Connect</span>
                </div>

                {status === 'none' && (
                  <button 
                    onClick={() => handleAddFriend(member)}
                    className="bento-button-secondary py-2 px-5 text-xs flex items-center gap-2"
                  >
                    Add Amiable
                  </button>
                )}
                {status === 'pending' && (
                  <div className="px-5 py-2 bg-white rounded-xl text-xs font-bold text-bento-muted border border-bento-border/50 flex items-center gap-2">
                    <Clock size={14} /> Pending
                  </div>
                )}
                {status === 'received' && (
                  <div className="px-5 py-2 bg-bento-primary/10 rounded-xl text-xs font-bold text-bento-primary border border-bento-primary/20 flex items-center gap-2 italic">
                    Wants to connect
                  </div>
                )}
                {status === 'friend' && (
                  <div className="px-5 py-2 bg-green-50 rounded-xl text-xs font-bold text-green-600 border border-green-100 flex items-center gap-2">
                    <UserCheck size={14} /> Amiable
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredMembers.length === 0 && !loading && (
        <div className="text-center py-40 bg-white rounded-[40px] border-2 border-dashed border-bento-border">
          <Users size={64} className="mx-auto text-bento-border mb-6 opacity-40" />
          <h3 className="text-3xl font-serif font-bold text-bento-muted">No members found</h3>
          <p className="mt-2 text-bento-muted/60 font-sans">Try searching for another name or help grow our community!</p>
        </div>
      )}
    </div>
  );
};
