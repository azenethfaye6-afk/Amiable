import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Event, Application, Suggestion, Question, 
  UserRole, ApplicationStatus, EventStatus 
} from '../types';
import { mockDB } from '../lib/mockBackend';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Users, Calendar, MessageSquare, ClipboardCheck, X, Trash2 } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';

export const AdminDashboard: React.FC = () => {
  const { profile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'events' | 'applications' | 'suggestions' | 'questions'>('events');
  
  const [events, setEvents] = useState<Event[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    themeName: '',
    status: EventStatus.UPCOMING
  });

  useEffect(() => {
    if (!isAdmin) return;
    refreshData();
  }, [isAdmin, activeTab]);

  const refreshData = async () => {
    try {
      const [evts, apps, sugs] = await Promise.all([
        mockDB.getEvents(),
        mockDB.getApplications(),
        mockDB.getSuggestions()
      ]);
      
      setEvents([...evts].reverse());
      setApplications(apps.filter(a => a.status === 'pending'));
      setSuggestions([...sugs].reverse());
      // Mock questions
      setQuestions([
        { id: 'q1', text: "Why do you want to join the Amiable community?", order: 1, active: true },
        { id: 'q2', text: "What kind of events do you enjoy the most?", order: 2, active: true },
        { id: 'q3', text: "Share a memory that is important to you.", order: 3, active: true }
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mockDB.addEvent({
        ...newEvent,
        frameConfig: {
          borderWidth: '20px',
          borderColor: '#5A5A40',
          borderRadius: '40px'
        },
        createdBy: profile?.uid || 'admin',
        createdAt: new Date().toISOString()
      });
      setShowEventForm(false);
      setNewEvent({ title: '', description: '', date: '', themeName: '', status: EventStatus.UPCOMING });
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveApp = async (app: Application) => {
    try {
      await mockDB.updateApplication(app.id, { status: 'approved' });
      const userProfile = await mockDB.getUser(app.userId);
      if (userProfile) {
        await mockDB.saveUser({
          ...userProfile,
          role: UserRole.MEMBER,
          applicationStatus: ApplicationStatus.APPROVED
        });
      }
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectApp = async (app: Application) => {
    try {
      await mockDB.updateApplication(app.id, { status: 'rejected' });
      const userProfile = await mockDB.getUser(app.userId);
      if (userProfile) {
        await mockDB.saveUser({
          ...userProfile,
          applicationStatus: ApplicationStatus.REJECTED
        });
      }
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-12 py-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-serif font-bold mb-3 tracking-tight">Admin Terminal</h2>
          <p className="text-bento-muted font-sans italic opacity-60">High-level management for Amiable community.</p>
        </div>
        
        <div className="flex bg-bento-accent/50 p-1 rounded-xl border border-bento-border overflow-x-auto no-scrollbar">
          {[
            { id: 'events', label: 'Events', icon: Calendar },
            { id: 'applications', label: 'Applicants', icon: ClipboardCheck },
            { id: 'suggestions', label: 'Themes', icon: MessageSquare },
            { id: 'questions', label: 'Forms', icon: Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-6 py-2 rounded-lg text-[10px] font-sans font-bold uppercase tracking-widest flex items-center gap-2 transition-all",
                activeTab === tab.id ? "bg-white shadow-sm text-bento-primary" : "text-bento-muted hover:text-bento-primary"
              )}
            >
              <tab.icon size={14} /> {tab.label}
              {tab.id === 'applications' && applications.length > 0 && (
                <span className="bg-bento-primary text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">
                  {applications.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === 'events' && (
            <motion.div 
              key="events"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex justify-end">
                <button 
                  onClick={() => setShowEventForm(true)}
                  className="bento-button-primary flex items-center gap-2"
                >
                  <Plus size={14} /> Initialize Collection
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => (
                  <div key={event.id} className="bento-card bg-white flex flex-col group border-none hover:shadow-xl transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <div className="bento-pill text-[9px] px-3">{event.status}</div>
                      <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{formatDate(event.date)}</span>
                    </div>
                    <h4 className="text-2xl font-serif font-bold mb-2 group-hover:text-bento-primary transition-colors">{event.title}</h4>
                    <p className="text-sm text-bento-muted italic font-serif leading-relaxed line-clamp-2 mb-6">"{event.description}"</p>
                    <div className="mt-auto pt-6 border-t border-bento-border flex justify-between items-center text-[10px] uppercase font-bold tracking-[0.1em]">
                      <span className="text-bento-primary">Frame: {event.themeName}</span>
                      <button className="p-2 hover:bg-red-50 rounded-full transition-colors text-red-300 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'applications' && (
            <motion.div 
              key="applications"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {applications.length === 0 ? (
                <div className="text-center py-40 opacity-20 font-serif italic text-3xl">No pending requests in the queue.</div>
              ) : (
                applications.map(app => (
                  <div key={app.id} className="bento-card bg-white border-none space-y-8 group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-bento-border pb-6">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-bento-accent rounded-full flex items-center justify-center font-bold text-bento-primary text-xl shadow-inner group-hover:scale-105 transition-transform">
                          {app.userName.slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-3xl font-serif font-bold">{app.userName}</h4>
                          <p className="text-[10px] opacity-40 font-sans uppercase font-bold tracking-[0.2em] mt-1">Application ID: {app.id.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleRejectApp(app)}
                          className="px-8 py-3 bg-red-50 text-red-500 rounded-xl font-sans text-xs font-bold uppercase tracking-widest hover:bg-red-100 transition-all shadow-sm"
                        >
                          Deny entry
                        </button>
                        <button 
                          onClick={() => handleApproveApp(app)}
                          className="bento-button-primary px-10 py-3"
                        >
                          Authorize Access
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-10">
                      {Object.entries(app.answers).map(([qid, answer]) => (
                        <div key={qid} className="space-y-3">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-bento-muted px-1">
                            {questions.find(q => q.id === qid)?.text || "General Question"}
                          </p>
                          <p className="text-lg font-serif italic text-bento-secondary leading-relaxed p-6 bg-bento-bg/50 rounded-[2rem] border border-bento-border/40">
                            "{answer}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'questions' && (
            <motion.div 
               key="questions"
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
               className="max-w-3xl mx-auto space-y-8"
            >
               <section className="bento-card border-2 border-bento-primary bg-white flex flex-col gap-6">
                  <h3 className="text-xl font-serif font-bold">New Entry Criterion</h3>
                  <div className="flex flex-col sm:flex-row gap-4">
                     <input type="text" className="bento-input flex-1" placeholder="Enter inquiry text..." id="q-input" />
                     <button 
                       onClick={() => {
                         const input = document.getElementById('q-input') as HTMLInputElement;
                         if (input?.value) {
                           // For non-persisted mock, just refresh local state or add to a mock list
                           alert("Question added (Mock)");
                           input.value = '';
                           refreshData();
                         }
                       }} 
                       className="bento-button-primary px-10"
                     >
                       Add
                     </button>
                  </div>
               </section>
               <div className="space-y-4">
                 {questions.map(q => (
                   <div key={q.id} className="bento-card bg-white flex items-center justify-between group border-none hover:translate-x-1 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-10 h-10 bg-bento-bg rounded-xl flex items-center justify-center text-xs font-bold font-sans text-bento-muted">
                          {q.order}
                        </div>
                        <p className={cn("text-xl font-serif italic", !q.active && "opacity-20 line-through")}>"{q.text}"</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => { alert("Toggled (Mock)"); refreshData(); }}
                          className={cn(
                            "bento-pill px-4 text-[9px]",
                            q.active ? "bg-green-100 text-green-700" : "bg-bento-border text-bento-muted"
                          )}
                        >
                          {q.active ? "Live" : "Halted"}
                        </button>
                        <button 
                          onClick={() => { alert("Deleted (Mock)"); refreshData(); }}
                          className="p-3 text-red-200 hover:text-red-500 hover:bg-red-50 rounded-full transition-all group-hover:scale-110"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                   </div>
                 ))}
               </div>
            </motion.div>
          )}
          
          {activeTab === 'suggestions' && (
            <motion.div 
               key="suggestions"
               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
               className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {suggestions.map(s => (
                 <div key={s.id} className="bento-card bg-white group border-none transition-all hover:shadow-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <h4 className="text-3xl font-serif font-bold tracking-tight">{s.theme}</h4>
                        <div className="bento-pill text-[10px] px-3">{s.votes.length} Votes</div>
                      </div>
                      <p className="text-sm text-bento-muted font-serif italic mb-10 leading-relaxed">"{s.description}"</p>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t border-bento-border">
                       <span className="text-[9px] font-bold uppercase tracking-widest opacity-30">Concept by {s.userName}</span>
                       <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              alert("Rejected (Mock)");
                              refreshData();
                            }}
                            className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button 
                            onClick={() => {
                              alert("Accepted (Mock)");
                              refreshData();
                            }}
                            className="bento-pill bg-bento-primary text-white border-none py-2 px-6"
                          >
                            Deploy
                          </button>
                       </div>
                    </div>
                 </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showEventForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-20">
          <div className="absolute inset-0 bg-bento-secondary/95 backdrop-blur-md" onClick={() => setShowEventForm(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-bento-bg rounded-[4rem] p-16 max-w-2xl w-full border-4 border-bento-primary shadow-2xl"
          >
             <button 
               onClick={() => setShowEventForm(false)}
               className="absolute top-10 right-10 p-3 hover:bg-bento-accent rounded-full transition-colors"
             >
               <X size={24} />
             </button>
             
             <h3 className="text-4xl font-serif font-bold mb-10 text-center">Collection Initialization</h3>
             <form onSubmit={handleCreateEvent} className="space-y-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-bento-muted px-2">Official Title</label>
                    <input 
                      type="text" required value={newEvent.title}
                      onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                      className="bento-input"
                      placeholder="e.g. Summer Equinox 2026"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-bento-muted px-2">Vision Narrative</label>
                    <textarea 
                      required value={newEvent.description}
                      onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                      className="bento-input min-h-[100px] resize-none"
                      placeholder="What is the story of this collection?"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-bento-muted px-2">Capture Date</label>
                    <input 
                      type="date" required value={newEvent.date}
                      onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                      className="bento-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-bento-muted px-2">Assigned Frame</label>
                    <input 
                      type="text" required value={newEvent.themeName}
                      onChange={e => setNewEvent({...newEvent, themeName: e.target.value})}
                      className="bento-input"
                      placeholder="Theme Style"
                    />
                  </div>
                </div>
                
                <button type="submit" className="bento-button-primary w-full py-5 text-sm uppercase tracking-[0.3em]">
                  Authorize & Announce Collection
                </button>
             </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

