import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, Mail, Lock, Chrome } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await login(email, password, isRegister);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError('Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bento-card p-12 text-center"
      >
        <div className="w-16 h-16 bg-bento-accent rounded-full flex items-center justify-center mx-auto mb-6 text-bento-primary">
          <Star size={32} className="fill-bento-primary" />
        </div>
        <h2 className="text-4xl font-serif font-bold mb-4">
          {isRegister ? 'Join Amiable' : 'Welcome to Amiable'}
        </h2>
        <p className="text-bento-muted mb-10 font-sans text-sm leading-relaxed">
          {isRegister 
            ? 'Create your account to start sharing memories with the community.'
            : 'A private circle for community memories, beautifully framed and preserved.'}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-xs font-sans font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-bento-muted" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full pl-16 pr-6 py-4 rounded-xl border border-bento-border font-sans focus:outline-none focus:ring-2 focus:ring-bento-primary/20 transition-all"
              required
            />
          </div>
          
          <div className="relative">
            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-bento-muted" size={18} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pl-16 pr-6 py-4 rounded-xl border border-bento-border font-sans focus:outline-none focus:ring-2 focus:ring-bento-primary/20 transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-bento-primary text-white border border-bento-border px-6 py-4 rounded-xl font-sans font-bold uppercase text-[10px] tracking-widest hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="h-px bg-bento-border flex-1"></div>
          <span className="text-[10px] font-sans font-bold text-bento-muted uppercase tracking-widest">or</span>
          <div className="h-px bg-bento-border flex-1"></div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-bento-secondary border border-bento-border px-6 py-4 rounded-xl font-sans font-bold uppercase text-[10px] tracking-widest hover:shadow-lg transition-all disabled:opacity-50 mb-6"
        >
          <Chrome size={18} />
          Continue with Google
        </button>

        <button
          onClick={() => setIsRegister(!isRegister)}
          className="text-bento-primary font-sans text-xs font-bold hover:underline"
        >
          {isRegister ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
        </button>

        <div className="mt-12 pt-8 border-t border-bento-border text-center">
          <p className="text-[10px] text-bento-muted font-black uppercase tracking-widest mb-3">Management Access</p>
          <button 
            onClick={() => navigate('/staff-login')}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-bento-border text-[10px] font-black uppercase tracking-widest text-bento-muted hover:border-bento-primary hover:text-bento-primary transition-all shadow-sm hover:shadow-md"
          >
            Staff Portal
          </button>
        </div>

        <p className="mt-8 text-[9px] text-bento-muted font-bold uppercase tracking-[0.2em] leading-relaxed">
          Private Community Access
        </p>
      </motion.div>
    </div>
  );
};


