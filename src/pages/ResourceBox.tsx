import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Resource } from '../types';
import { mockDB } from '../lib/mockBackend';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Plus, ExternalLink, Tag, Search, Filter, FolderOpen, Bookmark } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';

export const ResourceBox: React.FC = () => {
  const { user, profile, isMember } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');

  const categories = ['General', 'Education', 'Tools', 'Templates', 'Entertainment', 'Productivity'];

  const fetchResources = async () => {
    try {
      const data = await mockDB.getResources();
      setResources(data.reverse());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !link) return;

    try {
      await mockDB.addResource({
        title,
        description,
        link,
        category,
        userId: user!.uid,
        userName: profile?.displayName || user!.email,
        createdAt: new Date().toISOString()
      });
      setTitle('');
      setLink('');
      setDescription('');
      setShowForm(false);
      fetchResources();
    } catch (e) {
      alert('Failed to share resource');
    }
  };

  const filteredResources = resources.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 py-10 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2 text-bento-secondary">
            <Briefcase size={20} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Knowledge Hub</span>
          </div>
          <h1 className="text-5xl font-serif font-bold tracking-tight text-bento-text">
            Resource Box
          </h1>
          <p className="mt-4 text-bento-muted max-w-xl">
            A curated library of useful links, tools, and materials shared by our community for everyone to use.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-bento-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white border border-bento-border rounded-2xl font-sans focus:outline-none focus:ring-2 focus:ring-bento-primary/20 w-48 lg:w-64"
            />
          </div>
          
          {isMember && (
            <button 
              onClick={() => setShowForm(!showForm)}
              className="bento-button-primary py-3 px-8 flex items-center gap-2"
            >
              <Plus size={18} /> Share Resource
            </button>
          )}
        </div>
      </header>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bento-card bg-white p-8 mb-12 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-bento-muted mb-2 ml-1">Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Name of the resource"
                    className="w-full px-5 py-4 bg-bento-bg rounded-2xl font-sans border-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-bento-muted mb-2 ml-1">URL / Link</label>
                  <input 
                    type="url" 
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-5 py-4 bg-bento-bg rounded-2xl font-sans border-none"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-bento-muted mb-2 ml-1">Description</label>
                <textarea 
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What makes this resource useful?"
                  className="w-full px-5 py-4 bg-bento-bg rounded-2xl font-sans border-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-bento-muted mb-2 ml-1">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-5 py-3 bg-bento-bg rounded-xl font-sans border-none focus:ring-2 focus:ring-bento-primary/20"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button type="submit" className="bento-button-primary py-4 px-12">
                  Add to Library
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res, index) => (
          <motion.div
            key={res.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bento-card group p-8 bg-white border-none shadow-sm hover:shadow-2xl hover:bg-bento-primary/5 transition-all duration-500"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-bento-bg flex items-center justify-center text-bento-secondary group-hover:bg-white transition-colors shadow-sm">
                <Bookmark size={24} />
              </div>
              <span className="bento-pill bg-bento-bg text-[8px] font-black uppercase tracking-tighter px-3 py-1 border-none group-hover:bg-white">
                {res.category}
              </span>
            </div>

            <h3 className="text-2xl font-serif font-bold text-bento-text mb-2 group-hover:text-bento-primary">
              {res.title}
            </h3>
            <p className="text-bento-muted text-sm line-clamp-3 mb-6 leading-relaxed">
              {res.description || "No description provided."}
            </p>

            <div className="flex items-center justify-between mt-auto pt-6 border-t border-bento-border/30">
              <div className="text-[10px] text-bento-muted flex flex-col">
                <span className="font-bold uppercase tracking-widest text-[8px]">Shared by</span>
                <span className="text-bento-text">{res.userName}</span>
              </div>
              <a 
                href={res.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-bento-secondary text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md"
              >
                <ExternalLink size={18} />
              </a>
            </div>
          </motion.div>
        ))}

        {filteredResources.length === 0 && !loading && (
          <div className="col-span-full text-center py-32 bg-white rounded-[40px] border border-dashed border-bento-border">
            <FolderOpen size={48} className="mx-auto text-bento-muted mb-4 opacity-50" />
            <p className="font-sans text-bento-muted text-xl">No resources found. Time to share some knowledge!</p>
          </div>
        )}
      </div>
    </div>
  );
};
