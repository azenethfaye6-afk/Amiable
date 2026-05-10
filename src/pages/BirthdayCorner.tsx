import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Birthday } from '../types';
import { mockDB } from '../lib/mockBackend';
import { motion } from 'motion/react';
import { Cake, Gift, Calendar, Plus, Heart, PartyPopper, BellRing, Bell } from 'lucide-react';
import { cn } from '../lib/utils';

export const BirthdayCorner: React.FC = () => {
  const { user, profile, isMember, isAdmin, isModerator } = useAuth();
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchBirthdays = async () => {
    try {
      const [bData, nData] = await Promise.all([
        mockDB.getBirthdays(),
        mockDB.getNotifications()
      ]);
      setBirthdays(bData);
      setNotifications(nData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBirthdays();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) return;

    try {
      const newBday = {
        userId: user!.uid,
        userName: profile?.displayName || user!.email,
        birthDate, // expects something like "05-15"
        createdAt: new Date().toISOString()
      };
      
      await mockDB.addBirthday(newBday);

      // If approaching, notify staff
      if (isComingSoon(birthDate)) {
        await mockDB.addNotification({
          userId: 'staff_broadcast', // Special ID for all admins/mods
          title: 'Upcoming Birthday Alert',
          message: `${newBday.userName}'s birthday is coming up on ${newBday.birthDate}!`,
          type: 'birthday',
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }

      setShowForm(false);
      fetchBirthdays();
    } catch (e) {
      alert('Failed to add birthday');
    }
  };

  // Logic to highlight "coming soon" for admin/mods
  const isComingSoon = (dateStr: string) => {
    if (!dateStr) return false;
    const today = new Date();
    const [m, d] = dateStr.split('-').map(Number);
    
    // Create date for this year
    const bdayDate = new Date(today.getFullYear(), m - 1, d);
    
    // If birthday already passed this year, check next year
    if (bdayDate < today) {
      bdayDate.setFullYear(today.getFullYear() + 1);
    }

    const diff = (bdayDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
    
    return diff >= 0 && diff <= 7;
  };

  return (
    <div className="space-y-12 py-10 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2 text-pink-500">
            <Cake size={20} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Celebration Spot</span>
          </div>
          <h1 className="text-5xl font-serif font-bold tracking-tight text-bento-text">
            Birthday Corner
          </h1>
          <p className="mt-4 text-bento-muted max-w-xl">
            A place to share your special day. We love to celebrate our members!
          </p>
        </div>

        {isMember && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bento-button-secondary bg-pink-50 text-pink-600 border-pink-100 hover:bg-pink-100 py-3 px-8 flex items-center gap-2"
          >
            <Plus size={18} /> Add My Day
          </button>
        )}
      </header>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bento-card bg-white p-8 mb-12 shadow-xl border-pink-100"
        >
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-end gap-6">
            <div className="flex-1">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-bento-muted mb-2 ml-1">Select Month & Day</label>
              <input 
                type="date" 
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  const m = String(date.getMonth() + 1).padStart(2, '0');
                  const d = String(date.getDate()).padStart(2, '0');
                  setBirthDate(`${m}-${d}`);
                }}
                className="w-full px-5 py-4 bg-bento-bg rounded-2xl font-sans border-none focus:ring-2 focus:ring-pink-200"
              />
            </div>
            <button type="submit" className="bento-button-primary bg-pink-500 hover:bg-pink-600 py-4 px-10">
              Save My Birthday
            </button>
          </form>
        </motion.div>
      )}

      {(isAdmin || isModerator) && (
        <div className="space-y-6 mb-12">
          {birthdays.some(b => isComingSoon(b.birthDate)) && (
            <div className="bg-orange-50 border border-orange-100 rounded-[32px] p-8 flex items-start gap-6 shadow-sm">
              <div className="bg-white p-4 rounded-2xl text-orange-500 shadow-sm">
                <BellRing size={24} />
              </div>
              <div>
                <h3 className="text-xl font-sans font-bold text-orange-800 mb-2">Upcoming Birthdays Alert</h3>
                <p className="text-orange-700/70 text-sm mb-4">The following members have birthdays in the next 7 days. You might want to prepare an announcement!</p>
                <div className="flex flex-wrap gap-3">
                  {birthdays.filter(b => isComingSoon(b.birthDate)).map(b => (
                    <div key={b.id} className="bg-white px-4 py-2 rounded-xl text-xs font-bold text-bento-text border border-orange-100 flex items-center gap-2">
                      <Gift size={14} className="text-pink-400" />
                      {b.userName} ({b.birthDate})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {notifications.filter(n => n.userId === 'staff_broadcast').length > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-[32px] p-8 space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <Bell size={20} />
                <h3 className="text-lg font-sans font-bold uppercase tracking-widest">Notification Log</h3>
              </div>
              <div className="space-y-3">
                {notifications.filter(n => n.userId === 'staff_broadcast').reverse().slice(0, 5).map(n => (
                  <div key={n.id} className="bg-white/50 p-4 rounded-2xl flex items-center justify-between border border-blue-100/50">
                    <span className="text-sm text-blue-900">{n.message}</span>
                    <span className="text-[10px] text-blue-400 font-bold uppercase">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {birthdays.map((b, index) => (
          <motion.div
            key={b.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bento-card group p-6 bg-white hover:bg-pink-50/30 transition-all duration-500 text-center"
          >
            <div className="w-16 h-16 bg-bento-bg rounded-full mx-auto mb-4 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
              <PartyPopper size={32} />
            </div>
            <h4 className="font-serif font-bold text-lg mb-1">{b.userName}</h4>
            <div className="flex items-center justify-center gap-2 text-bento-muted text-xs font-bold uppercase tracking-widest">
              <Calendar size={12} />
              <span>{b.birthDate}</span>
            </div>
            <button className="mt-4 w-full py-2 rounded-xl border border-pink-100 text-[10px] font-black uppercase tracking-widest text-pink-500 hover:bg-pink-500 hover:text-white transition-all">
              Send Love
            </button>
          </motion.div>
        ))}

        {birthdays.length === 0 && !loading && (
          <div className="col-span-full text-center py-24 bg-white rounded-3xl border border-dashed border-bento-border">
            <p className="font-sans text-bento-muted text-lg">No birthdays added yet. Don't be shy!</p>
          </div>
        )}
      </div>
    </div>
  );
};
