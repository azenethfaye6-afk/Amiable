import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Question, UserRole, ApplicationStatus } from '../types';
import { mockDB } from '../lib/mockBackend';
import { motion } from 'motion/react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MembershipApplication: React.FC = () => {
  const { user, profile } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Mock static questions for now
        const defaultQuestions: Question[] = [
          { id: 'q1', text: "Why do you want to join the Amiable community?", order: 1, active: true },
          { id: 'q2', text: "What kind of events do you enjoy the most?", order: 2, active: true },
          { id: 'q3', text: "Share a memory that is important to you.", order: 3, active: true }
        ];
        setQuestions(defaultQuestions);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      mockDB.addApplication({
        userId: user.uid,
        userName: user.displayName || user.email,
        status: 'pending',
        answers: answers,
        submittedAt: new Date().toISOString()
      });

      const updatedProfile = {
        ...profile!,
        applicationStatus: ApplicationStatus.PENDING
      };
      mockDB.saveUser(updatedProfile);
      
      // Force reload or window location for simplicity in mock
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-warm-olive" size={40} />
        <p className="font-sans text-warm-ink/60">Loading application form...</p>
      </div>
    );
  }

  if (profile?.applicationStatus === ApplicationStatus.PENDING) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bento-card py-20 space-y-8">
          <div className="w-20 h-20 bg-bento-accent/10 text-bento-primary rounded-full flex items-center justify-center mx-auto animate-pulse">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-4xl font-serif font-bold">In Review</h2>
          <p className="text-lg text-bento-muted font-sans leading-relaxed max-w-sm mx-auto">
            Your request is being evaluated by our moderators. You will be notified once a decision is made.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="bento-pill px-8"
          >
            Return Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-12">
      <header className="text-center space-y-4">
        <h2 className="text-6xl font-serif font-bold tracking-tight text-bento-secondary">Access Request</h2>
        <p className="text-bento-muted font-sans italic opacity-60">Join our private circle of memories. Answer with kindness.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {questions.length === 0 ? (
          <div className="bento-card p-12 text-center italic opacity-60 font-serif text-xl border-dashed">
            The application criteria are currently being finalized by the staff. Please check back later.
          </div>
        ) : (
          <div className="bento-card bg-white border-2 border-bento-primary p-10 md:p-16 space-y-12">
            <div className="space-y-12">
              {questions.map((q, i) => (
                <motion.div 
                  key={q.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-4"
                >
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-bento-muted px-2">
                    {q.text}
                  </label>
                  <textarea
                    required
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    className="bento-input min-h-[140px] resize-none text-lg font-serif italic text-bento-secondary"
                    placeholder="Your thoughtful response..."
                  />
                </motion.div>
              ))}
            </div>

            <div className="pt-8 border-t border-bento-border flex flex-col items-center gap-6">
              <p className="text-[10px] text-bento-muted font-bold uppercase tracking-[0.2em] text-center max-w-md opacity-60">
                Submitting this application acknowledges you've read our community trust guidelines.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="bento-button-primary px-16 py-5 text-sm uppercase tracking-[0.3em] w-full sm:w-auto"
              >
                {submitting ? 'Finalizing Request...' : 'Submit Application'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

