import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockDB } from '../lib/mockBackend';
import { motion } from 'motion/react';
import { User, Mail, Calendar, Hash, Edit3, Save, Camera, MessageSquare, Users, Heart, Image as ImageIcon, Award, Sparkles, Shield, Star, Flame, Zap, Trophy, Medal, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { FriendRequest, UserBadge } from '../types';

const ICON_MAP: Record<string, any> = {
  Award, Shield, Sparkles, Star, Heart, Flame, Zap, Trophy, Medal, Info
};

export const ProfileDashboard: React.FC = () => {
  const { user, profile, setProfile, updateEmailAddress } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [birthday, setBirthday] = useState(profile?.birthday || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [userPhotos, setUserPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showMemories, setShowMemories] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setEmail(profile.email || '');
      setBio(profile.bio || '');
      setBirthday(profile.birthday || '');
      setPhotoURL(profile.photoURL || '');
      fetchUserPhotos();
      fetchUserBadges();
    }
    fetchFriendRequests();
  }, [profile]);

  const fetchUserBadges = async () => {
    try {
      const badges = await mockDB.getUserBadges();
      setUserBadges(badges.filter(b => b.userId === profile?.uid));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUserPhotos = async () => {
    try {
      const photos = await mockDB.getPhotos();
      setUserPhotos(photos.filter((p: any) => p.userId === user?.uid));
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoURL(reader.result as string);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const fetchFriendRequests = async () => {
    try {
      const requests = await mockDB.getFriendRequests();
      setFriendRequests(requests.filter(r => r.receiverId === user?.uid && r.status === 'pending'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Handle email update if changed
      if (email !== profile?.email) {
        if (confirm(`Your email address will be updated to ${email}. Continue?`)) {
          await updateEmailAddress(email);
        } else {
          return;
        }
      }

      const updated = await mockDB.updateProfile(user!.uid, {
        displayName,
        bio,
        birthday,
        photoURL
      });
      setProfile(updated);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (e: any) {
      alert('Failed to update profile: ' + (e.message || 'Unknown error'));
    }
  };

  const handleAcceptRequest = async (request: FriendRequest) => {
    try {
      await mockDB.updateFriendRequest(request.id, { status: 'accepted' });
      await mockDB.addFriendship({
        user1Id: request.senderId,
        user2Id: user!.uid,
        createdAt: new Date().toISOString()
      });
      fetchFriendRequests();
    } catch (e) {
      alert('Failed to accept request');
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-12">
      <header className="flex flex-col md:flex-row items-center gap-8 bg-white p-10 rounded-[40px] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
          <User size={120} />
        </div>

        <div className="relative z-10 w-32 h-32 md:w-48 md:h-48 rounded-[48px] overflow-hidden border-4 border-white shadow-2xl bg-bento-bg flex-shrink-0">
          <img 
            src={uploading ? "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJjbm8zZTF4ZzJ4ZzJ4ZzJ4ZzJ4ZzJ4ZzJ4ZzJ4ZzJ4ZzJmJmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7bu3XilJ5BOiSGic/giphy.gif" : (photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`)} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-4 right-4 p-2 bg-bento-primary text-white rounded-xl shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
          >
            <Camera size={16} />
          </button>
        </div>

        <div className="relative z-10 flex-1 text-center md:text-left space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <h1 className="text-5xl font-serif font-bold text-bento-text">
              {profile.displayName}
            </h1>
            <span className="bento-pill bg-bento-primary/10 text-bento-primary text-xs uppercase tracking-widest font-black self-center md:self-auto">
              ID: {profile.uid.slice(0, 8)}
            </span>
          </div>
          
          <p className="text-xl text-bento-muted font-sans italic max-w-2xl">
            {profile.bio || "No bio added yet. Tell us something about yourself!"}
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
            <div className="flex items-center gap-2 text-bento-muted text-sm font-bold uppercase tracking-wider">
              <Mail size={14} /> <span>{user?.email}</span>
            </div>
            {profile.birthday && (
              <div className="flex items-center gap-2 text-bento-muted text-sm font-bold uppercase tracking-wider">
                <Calendar size={14} /> <span>Born {profile.birthday}</span>
              </div>
            )}
          </div>
        </div>

        <div className="relative z-10">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="bento-button-secondary py-3 px-8 flex items-center gap-2"
          >
            {isEditing ? 'Cancel' : <><Edit3 size={18} /> Edit Profile</>}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Edit Form */}
        <div className={cn(
          "lg:col-span-2 space-y-8 transition-all duration-500",
          isEditing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none absolute h-0 overflow-hidden"
        )}>
          <div className="bento-card bg-white p-10 shadow-2xl">
            <h2 className="text-3xl font-serif font-bold mb-8 flex items-center gap-3">
              <Edit3 className="text-bento-primary" /> Update Information
            </h2>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-bento-muted ml-1">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-bento-muted" size={18} />
                    <input 
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-bento-bg rounded-2xl border-none focus:ring-2 focus:ring-bento-primary/20 text-lg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-bento-muted ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-bento-muted" size={18} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-bento-bg rounded-2xl border-none focus:ring-2 focus:ring-bento-primary/20 text-lg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-bento-muted ml-1">Birthday (MM-DD)</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-bento-muted" size={18} />
                    <input 
                      type="text" 
                      value={birthday}
                      placeholder="e.g. 05-20"
                      onChange={(e) => setBirthday(e.target.value)}
                      className="w-full pl-12 pr-6 py-4 bg-bento-bg rounded-2xl border-none focus:ring-2 focus:ring-bento-primary/20 text-lg"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-bento-muted ml-1">Profile Photo</label>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="w-24 h-24 rounded-[32px] overflow-hidden border-2 border-bento-primary shadow-lg flex-shrink-0 bg-white">
                    <img 
                      src={photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 w-full space-y-4">
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bento-button-secondary py-3 px-6 text-xs flex items-center gap-2 flex-1 justify-center whitespace-nowrap"
                        disabled={uploading}
                      >
                        <Camera size={14} /> {uploading ? 'Preparing...' : 'Choose from Device'}
                      </button>
                      {userPhotos.length > 0 && (
                        <button 
                          type="button"
                          onClick={() => setShowMemories(!showMemories)}
                          className={cn(
                            "bento-button-secondary py-3 px-6 text-xs flex items-center gap-2 flex-1 justify-center whitespace-nowrap",
                            showMemories ? "bg-bento-primary text-white" : ""
                          )}
                        >
                          <ImageIcon size={14} /> From Memories
                        </button>
                      )}
                      <button 
                        type="button"
                        onClick={() => setPhotoURL('')} // Reset to default
                        className="p-3 bg-bento-bg text-bento-muted rounded-2xl hover:text-red-500 transition-all shadow-sm"
                        title="Reset to Default"
                      >
                        <Hash size={20} />
                      </button>
                    </div>

                    {showMemories && userPhotos.length > 0 && (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-4 bg-bento-bg rounded-2xl max-h-[150px] overflow-y-auto no-scrollbar border-2 border-bento-primary/10">
                        {userPhotos.map((photo: any) => (
                          <button
                            key={photo.id}
                            type="button"
                            onClick={() => {
                              setPhotoURL(photo.url);
                              setShowMemories(false);
                            }}
                            className="aspect-square rounded-lg overflow-hidden hover:scale-105 active:scale-95 transition-all shadow-sm border-2 border-transparent hover:border-bento-primary"
                          >
                            <img src={photo.url} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="relative">
                      <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-bento-muted" size={16} />
                      <input 
                        type="text" 
                        value={photoURL}
                        placeholder="...or paste an image link"
                        onChange={(e) => setPhotoURL(e.target.value)}
                        className="w-full pl-12 pr-6 py-3 bg-bento-bg rounded-[20px] border-none focus:ring-2 focus:ring-bento-primary/20 text-sm italic"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-bento-muted ml-1">Bio / About You</label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-6 text-bento-muted" size={18} />
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Share something about yourself..."
                    className="w-full pl-12 pr-6 py-4 bg-bento-bg rounded-2xl border-none focus:ring-2 focus:ring-bento-primary/20 min-h-[150px] text-lg italic"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" className="bento-button-primary py-4 px-12 text-lg flex items-center gap-3">
                  <Save size={20} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Friend Requests */}
        <div className="space-y-8">
          <div className="bento-card bg-white p-8 shadow-xl">
            <h3 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
              <Users size={20} className="text-bento-secondary" /> Friend Requests
            </h3>
            {friendRequests.length === 0 ? (
              <p className="text-sm text-bento-muted text-center py-8 bg-bento-bg rounded-2xl border-2 border-dashed border-bento-border italic">
                No pending requests
              </p>
            ) : (
              <div className="space-y-4">
                {friendRequests.map(request => (
                  <div key={request.id} className="p-4 bg-bento-bg rounded-2xl flex items-center justify-between group hover:bg-white transition-all shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-bento-secondary shadow-inner">
                        {request.senderName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold">{request.senderName}</h4>
                        <p className="text-[8px] text-bento-muted uppercase">{new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAcceptRequest(request)}
                      className="p-2 bg-bento-primary text-white rounded-xl shadow-md hover:scale-110 active:scale-95 transition-all"
                    >
                      <User className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bento-card bg-white p-8 shadow-xl">
            <h3 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
              <Award size={20} className="text-yellow-500" /> Achievements
            </h3>
            {userBadges.length === 0 ? (
              <p className="text-xs text-bento-muted italic text-center py-4">No badges earned yet</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {userBadges.map(ub => {
                  const IconComp = ICON_MAP[ub.badgeIcon] || Award;
                  return (
                    <div 
                      key={ub.id} 
                      className={cn("p-2 rounded-xl text-white shadow-md flex items-center justify-center", ub.badgeColor)}
                      title={ub.badgeName}
                    >
                      <IconComp size={16} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bento-card bg-white p-8 shadow-xl">
            <h3 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
              <Heart size={20} className="text-red-400" /> Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-bento-bg rounded-[32px] text-center">
                <span className="block text-3xl font-black text-bento-text">0</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-bento-muted">Friends</span>
              </div>
              <div className="p-6 bg-bento-bg rounded-[32px] text-center">
                <span className="block text-3xl font-black text-bento-text">0</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-bento-muted">Posts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
