import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockDB } from '../lib/mockBackend';
import { ShieldCheck, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export const StaffLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email);
      // The login call above updates the global state. 
      // Since state update might be async, we'll check the profile from the mockDB directly or wait.
      // But actually, AuthContext updates profile. 
      // For simplicity in this mock, we'll just check the email locally first or check after a tiny delay.
      const staffProfile = await mockDB.getUser('user_' + btoa(email).substring(0, 8));
      
      if (staffProfile && (staffProfile.role === 'admin' || staffProfile.role === 'moderator')) {
        navigate('/');
      } else {
        // Not a staff member
        await logout();
        alert('Access denied: Unauthorized account. This portal is for Staff members only.');
      }
    } catch (e: any) {
      alert(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-warm-bg relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-bento-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-bento-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl shadow-black/5 p-10 border border-warm-200 relative z-10"
      >
        <button 
          onClick={() => navigate('/login')}
          className="group flex items-center gap-2 text-bento-muted hover:text-bento-primary transition-colors text-sm font-medium mb-8"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Member Login
        </button>

        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-bento-primary rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl shadow-bento-primary/20 rotate-3">
            <ShieldCheck className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-black text-bento-bg mb-2 tracking-tight">Staff Portal</h1>
          <p className="text-bento-muted font-medium text-center">Admin & Moderator Access Only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-bento-muted ml-1">Work Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-bento-muted group-focus-within:text-bento-primary transition-colors" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="staff@amiable.com"
                className="w-full pl-12 pr-6 py-4 bg-warm-50 rounded-2xl border-2 border-transparent focus:border-bento-primary/20 focus:bg-white focus:ring-0 transition-all text-lg placeholder:text-warm-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-bento-muted ml-1">Access Passcode</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-bento-muted group-focus-within:text-bento-primary transition-colors" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-12 pr-6 py-4 bg-warm-50 rounded-2xl border-2 border-transparent focus:border-bento-primary/20 focus:bg-white focus:ring-0 transition-all text-lg placeholder:text-warm-300"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-bento-bg text-white rounded-2xl font-black text-lg shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <ShieldCheck size={24} />
                Secure Login
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-warm-100 flex flex-col items-center gap-4 text-center">
          <p className="text-xs text-bento-muted leading-relaxed">
            Unauthorized access is strictly prohibited.<br />
            IP address and activity are logged for security purposes.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
