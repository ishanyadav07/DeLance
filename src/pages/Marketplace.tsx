import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, ShieldCheck, Clock, DollarSign, ArrowRight, Loader2, Zap } from 'lucide-react';
import { cn } from '@/src/utils';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

import { JobCard } from '../components/marketplace/JobCard';

export const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [firestoreJobs, setFirestoreJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Backend', 'Frontend', 'Design', 'Security Audit', 'Development'];

  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs
        .map(doc => ({
          ...doc.data(),
          id: doc.id,
          status: doc.data().status,
          // Map Firestore fields to JobCard expected fields if necessary
          client: doc.data().clientName || 'Anonymous',
          desc: doc.data().description,
        }))
        .filter(job => job.status !== 'completed');
      setFirestoreJobs(jobsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching jobs:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredJobs = firestoreJobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         job.desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === 'All' || job.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl 2xl:max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
      {/* Editorial Header */}
      <header className="relative mb-16 md:mb-24">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 border-b border-white/10 pb-12">
          <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></div>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary font-bold">Network Active</span>
              <div className="h-[1px] w-12 bg-white/10"></div>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-outline">v2.4.0</span>
            </div>
            <h1 className="font-headline text-6xl md:text-8xl font-black tracking-tighter text-on-surface uppercase leading-[0.85]">
              Market<br />place
            </h1>
            <p className="text-on-surface-variant text-lg md:text-xl font-sans opacity-70 leading-relaxed">
              High-stakes project procurement for the next generation of digital architects.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
            <div className="flex flex-col items-start lg:items-end">
              <span className="font-mono text-[10px] uppercase tracking-widest text-outline mb-1">Total Volume</span>
              <span className="font-headline text-3xl font-bold tracking-tighter">$2.4M+</span>
            </div>
            <div className="w-[1px] h-12 bg-white/10 hidden sm:block"></div>
            <Link 
              to="/post-project" 
              className="group relative px-10 py-5 bg-white text-black font-headline font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all duration-500 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Post Project <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Technical Filter Bar */}
      <div className="sticky top-4 z-40 mb-12">
        <div className="bg-surface-container-low/80 backdrop-blur-xl border border-white/10 rounded-xl p-2 flex flex-col md:flex-row items-stretch md:items-center gap-2 shadow-2xl">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" size={16} />
            <input
              type="text"
              placeholder="Query database..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-transparent rounded-lg py-3 pl-12 pr-4 font-mono text-xs focus:outline-hidden focus:bg-white/10 transition-all placeholder:text-outline/50"
            />
          </div>
          
          <div className="h-8 w-[1px] bg-white/10 hidden md:block mx-2"></div>
          
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar px-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-all whitespace-nowrap border",
                  activeCategory === cat 
                    ? "bg-primary/10 text-primary border-primary/30" 
                    : "text-on-surface-variant hover:bg-white/5 border-transparent"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 text-[10px] font-mono text-outline hover:text-primary transition-colors uppercase tracking-widest"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-surface-container-low rounded-2xl animate-pulse border border-white/5"></div>
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredJobs.map((job, i) => (
                <JobCard key={job.id} job={job} index={i} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-32 text-center border border-dashed border-white/10 rounded-3xl">
            <div className="max-w-xs mx-auto space-y-6">
              <div className="font-mono text-4xl text-outline opacity-20">0 results</div>
              <p className="font-sans text-on-surface-variant text-sm leading-relaxed">
                No matches found for your current query parameters. Refine your search or browse all categories.
              </p>
              <button 
                onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                className="font-mono text-[10px] text-primary font-bold uppercase tracking-[0.2em] hover:underline"
              >
                Reset System Filters
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Meta */}
      <footer className="mt-24 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
        <div className="font-mono text-[9px] uppercase tracking-[0.3em]">
          End of Database Stream
        </div>
        <div className="flex gap-8">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em]">Latency: 14ms</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.3em]">Status: Nominal</span>
        </div>
      </footer>
    </div>
  );
};
