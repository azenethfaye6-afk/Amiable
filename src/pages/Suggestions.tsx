import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Suggestion } from '../types';
import { mockDB } from '../lib/mockBackend';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Plus, Clock } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';

export const Suggestions: React.FC = () => {
  const { user, isMember } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [theme, setTheme] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!isMember) return;
    const fetchSuggestions = async () => {
      try {
        const fetchedSuggestions = await mockDB.getSuggestions();
        setSuggestions([...fetchedSuggestions].reverse());
      } catch (err) {
        console.error(err);
      }
    };
    fetchSuggestions();
  }, [isMember]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !theme.trim()) return;

    setSubmitting(true);
    try {
      await mockDB.addSuggestion({
        theme: theme.trim(),
        description: description.trim(),
        userId: user.uid,
        userName: user.displayName || user.email,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      const fetchedSuggestions = await mockDB.getSuggestions();
      setSuggestions([...fetchedSuggestions].reverse());
      setTheme('');
      setDescription('');
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-10">
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-5xl font-serif font-bold mb-3 text-bento-secondary">Theme Lab</h2>
          <p className="text-bento-muted font-sans italic opacity-60">What should our next community event look like?</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bento-button-primary flex items-center gap-2"
        >
          {showForm ? 'Cancel' : <><Plus size={14} /> Suggest Theme</>}
        </button>
      </header>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bento-card border-2 border-bento-primary space-y-8 bg-white">
              <h3 className="text-xl font-serif font-bold">Concept Detail</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-bento-muted px-1">Proposed Theme</label>
                  <input 
                    type="text" 
                    required
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="e.g., Midnight Garden, Pastel Skies..."
                    className="bento-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-bento-muted px-1">Vision/Details</label>
                  <textarea 
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the mood, colors, and potential frame styles..."
                    className="bento-input min-h-[120px] resize-none"
                  />
                </div>
              </div>
              <button 
                disabled={submitting}
                className="bento-button-secondary w-full flex items-center justify-center gap-3"
              >
                {submitting ? 'Sharing Vision...' : 'Submit Suggestion'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4">
        {suggestions.length === 0 ? (
          <div className="py-20 text-center opacity-30 font-serif italic text-2xl">
            No suggestions yet. Be the first to inspire our next theme!
          </div>
        ) : (
          suggestions.map((s, i) => (
            <motion.div 
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bento-card flex flex-col md:flex-row gap-6 items-start hover:bg-white hover:shadow-lg transition-all border-none bg-bento-accent/20"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-bento-primary shadow-sm">
                <MessageSquare size={20} />
              </div>
              <div className="flex-1 space-y-3 w-full">
                <div className="flex items-center justify-between">
                  <h4 className="text-2xl font-serif font-bold">{s.theme}</h4>
                  <div className={cn(
                    "bento-pill text-[9px] px-3",
                    s.status === 'pending' ? "bg-amber-100 text-amber-700" : 
                    s.status === 'accepted' ? "bg-green-100 text-green-700" : "bg-bento-border text-bento-muted"
                  )}>
                    {s.status}
                  </div>
                </div>
                <p className="text-bento-muted font-serif italic italic leading-relaxed text-sm">"{s.description}"</p>
                <div className="pt-4 flex flex-wrap items-center gap-6 text-[9px] font-bold uppercase tracking-[0.2em] text-bento-muted opacity-60">
                  <span className="flex items-center gap-1.5"><Clock size={12} /> {formatDate(s.createdAt)}</span>
                  <span>Suggested by {s.userName}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

