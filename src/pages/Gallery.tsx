import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Photo, Event, EventStatus } from '../types';
import { mockDB } from '../lib/mockBackend';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, Camera } from 'lucide-react';
import { cn } from '../lib/utils';

export const Gallery: React.FC = () => {
  const { user, profile, isMember } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isMember) return;

    const fetchEvents = async () => {
      try {
        const fetchedEvents = await mockDB.getEvents();
        setEvents(fetchedEvents);
        if (fetchedEvents.length > 0 && !activeEvent) {
          const current = fetchedEvents.find(e => e.status === EventStatus.ACTIVE) || fetchedEvents[0];
          setActiveEvent(current);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchEvents();
  }, [isMember]);

  useEffect(() => {
    if (!isMember) return;

    const fetchPhotos = async () => {
      try {
        let fetchedPhotos = await mockDB.getPhotos();
        if (activeEvent) {
          fetchedPhotos = fetchedPhotos.filter(p => p.eventId === activeEvent.id);
        }
        setPhotos([...fetchedPhotos].reverse());
      } catch (err) {
        console.error(err);
      }
    };
    fetchPhotos();
  }, [activeEvent, isMember]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !activeEvent) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        await mockDB.addPhoto({
          url: base64String,
          userId: user.uid,
          userName: user.displayName || user.email,
          userPhotoURL: user.photoURL,
          eventId: activeEvent.id,
          eventTitle: activeEvent.title,
          themeName: activeEvent.themeName,
          frameConfig: activeEvent.frameConfig,
          createdAt: new Date().toISOString()
        });
        
        // Refresh local photos state
        let fetchedPhotos = await mockDB.getPhotos();
        if (activeEvent) {
          fetchedPhotos = fetchedPhotos.filter(p => p.eventId === activeEvent.id);
        }
        setPhotos([...fetchedPhotos].reverse());
        
        setShowUploadModal(false);
      };
      reader.readAsDataURL(file);
      
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const PhotoFrame: React.FC<{ photo: Photo; className?: string }> = ({ photo, className }) => {
    const { frameConfig } = photo;
    return (
      <div 
        className={cn(
          "themed-frame bg-white",
          className
        )}
        style={{
          border: `${frameConfig?.borderWidth || '12px'} solid ${frameConfig?.borderColor || '#8B5E34'}`,
          borderRadius: frameConfig?.borderRadius || '24px',
        }}
      >
        <img 
          src={photo.url} 
          alt="Memory" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        {frameConfig?.overlayImageUrl && (
          <img 
            src={frameConfig.overlayImageUrl} 
            className="absolute inset-0 pointer-events-none w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
           <p className="font-serif text-lg font-medium">{photo.userName}</p>
           <p className="font-sans text-[10px] uppercase tracking-widest opacity-70">{photo.eventTitle}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-5xl font-serif font-bold mb-3">Memory Wall</h2>
          <p className="text-bento-muted font-sans italic opacity-60">Preserving the moments that matter to us.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-bento-accent/50 p-1 rounded-xl border border-bento-border overflow-x-auto max-w-[300px] md:max-w-none no-scrollbar">
            <button 
              onClick={() => setActiveEvent(null)}
              className={cn(
                "px-6 py-2 rounded-lg text-[10px] font-sans font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                !activeEvent ? "bg-white shadow-sm text-bento-primary" : "text-bento-muted hover:text-bento-primary"
              )}
            >
              All
            </button>
            {events.map(e => (
              <button 
                key={e.id}
                onClick={() => setActiveEvent(e)}
                className={cn(
                  "px-6 py-2 rounded-lg text-[10px] font-sans font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                  activeEvent?.id === e.id ? "bg-white shadow-sm text-bento-primary" : "text-bento-muted hover:text-bento-primary"
                )}
              >
                {e.title}
              </button>
            ))}
          </div>
          
          {activeEvent && activeEvent.status !== EventStatus.PAST && (
             <button 
               onClick={() => setShowUploadModal(true)}
               className="bento-button-primary flex items-center gap-2"
             >
               <Upload size={14} /> Upload
             </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {photos.length === 0 ? (
            <div className="col-span-full py-40 text-center text-bento-muted/30 font-serif italic text-3xl">
              No memories found for this filter.
            </div>
          ) : (
            photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="cursor-zoom-in"
                onClick={() => setSelectedPhoto(photo)}
              >
                <PhotoFrame photo={photo} className="aspect-[3/4]" />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 sm:p-20">
          <div className="absolute inset-0 bg-bento-secondary/90 backdrop-blur-md" onClick={() => setShowUploadModal(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-bento-bg rounded-[3rem] p-12 max-w-lg w-full text-center border-4 border-bento-primary"
          >
            <button 
              onClick={() => setShowUploadModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-bento-accent rounded-full transition-colors"
            >
              <X size={24} />
            </button>
            
            <Camera size={48} className="mx-auto text-bento-primary mb-6" />
            <h3 className="text-3xl font-serif font-bold mb-2">Share a Memory</h3>
            <p className="text-bento-muted font-sans mb-8 leading-relaxed text-sm">
              Upload a photo for <span className="font-bold text-bento-ink">{activeEvent?.title}</span>. 
              The <span className="italic font-serif">"{activeEvent?.themeName}"</span> frame will be automatically applied.
            </p>
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bento-button-secondary w-full mb-4 flex items-center justify-center gap-3"
            >
              {uploading ? (
                <>Uploading... <Loader2 className="animate-spin" size={18} /></>
              ) : (
                <>Select Image <Upload size={14} /></>
              )}
            </button>
            <p className="text-[9px] uppercase font-sans font-bold tracking-widest text-bento-muted opacity-40">JPG, PNG, GIF up to 5MB</p>
          </motion.div>
        </div>
      )}

      {selectedPhoto && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-bento-ink/95 backdrop-blur-xl" onClick={() => setSelectedPhoto(null)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col sm:flex-row gap-8 bg-bento-bg rounded-[3rem] overflow-hidden p-6 shadow-2xl"
          >
            <div className="flex-1 min-h-0 bg-white rounded-[2rem] overflow-hidden flex items-center justify-center relative">
               <PhotoFrame photo={selectedPhoto} className="max-h-full aspect-auto shadow-none border-none rounded-none" />
            </div>
            
            <div className="w-full sm:w-80 flex flex-col justify-between">
              <div>
                <button 
                  onClick={() => setSelectedPhoto(null)}
                  className="mb-12 p-3 hover:bg-bento-accent rounded-full transition-colors flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-widest text-bento-primary"
                >
                  <X size={16} /> Close Memory
                </button>
                
                <p className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold text-bento-muted mb-2">Event Collection</p>
                <h4 className="text-4xl font-serif font-bold mb-8 leading-tight">{selectedPhoto.eventTitle}</h4>
                
                <p className="text-[9px] uppercase tracking-[0.2em] font-sans font-bold text-bento-muted mb-4">Captured By</p>
                <div className="flex items-center gap-4 p-4 border border-bento-border rounded-2xl">
                  {selectedPhoto.userPhotoURL ? (
                    <img src={selectedPhoto.userPhotoURL} className="w-12 h-12 rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-bento-accent flex items-center justify-center text-sm font-bold">
                      {selectedPhoto.userName.slice(0,2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-serif font-bold text-lg">{selectedPhoto.userName}</p>
                    <p className="text-[10px] text-bento-primary uppercase font-bold tracking-tighter">Verified Member</p>
                  </div>
                </div>
              </div>
              
              <div className="text-[9px] uppercase tracking-[0.2em] text-bento-muted font-bold pt-8">
                {(() => {
                  const d = selectedPhoto.createdAt?.toDate ? selectedPhoto.createdAt.toDate() : new Date(selectedPhoto.createdAt);
                  return `${d.toLocaleDateString()} at ${d.toLocaleTimeString()}`;
                })()}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};


const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={cn("lucide lucide-loader-2", className)}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
