import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, ShieldCheck, Clock, DollarSign, ArrowRight, Loader2 } from 'lucide-react';
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

  const categories = ['All', 'Smart Contracts', 'Frontend', 'ZK-Proofs', 'Security Audit', 'Architecture'];

  const staticJobs = [
    { id: 's1', title: 'Smart Contract Audit', client: 'Aether Protocol', budget: '4.50', currency: 'ETH', category: 'Security Audit', tags: ['Solidity', 'Security', 'EVM'], status: 'Locked Escrow', desc: 'Comprehensive security audit for a new yield optimization protocol on Base.' },
    { id: 's2', title: 'dApp Frontend Architect', client: 'Nexus DAO', budget: '12,500', currency: 'USDC', category: 'Frontend', tags: ['React', 'Tailwind', 'Wagmi'], status: 'Locked Escrow', desc: 'Build a minimal, high-performance dashboard for a ZK-based identity protocol.' },
    { id: 's3', title: 'ZK-Rollup Researcher', client: 'Stark Labs', budget: '8.00', currency: 'ETH', category: 'ZK-Proofs', tags: ['Cryptography', 'Rust', 'L2'], status: 'Negotiable', desc: 'Research and optimize ZK-Rollup proof generation times.' },
  ];

  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        // Map Firestore fields to JobCard expected fields if necessary
        client: doc.data().clientName || 'Anonymous',
        desc: doc.data().description,
      }));
      setFirestoreJobs(jobsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching jobs:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const allJobs = [...firestoreJobs, ...staticJobs];

  const filteredJobs = React.useMemo(() => {
    return allJobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           job.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategory === 'All' || job.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allJobs, searchQuery, activeCategory]);

  return (
    <div className="max-w-7xl 2xl:max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      <header className="mb-6 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-headline font-extrabold tracking-tight mb-6">Protocol Marketplace</h1>
        <div className="relative group max-w-xl">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-outline">
            <Search size={18} />
          </div>
          <input 
            className="w-full bg-surface-container-highest/50 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/30 transition-all" 
            placeholder="Search for projects, audits, frontend..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8 pb-4 border-b border-white/5">
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-2 lg:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border shrink-0",
                activeCategory === cat 
                  ? "bg-primary text-surface border-primary" 
                  : "bg-surface-container-low text-on-surface-variant border-white/5 hover:border-white/20"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="hidden md:block h-4 w-[1px] bg-white/10 mx-2"></div>
        <button 
          onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
          className="text-primary text-xs font-bold hover:text-primary/80 transition-colors shrink-0 py-1.5 pr-2 relative z-10"
        >
          Clear all filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-on-surface-variant font-medium">Loading protocol jobs...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredJobs.map((job, i) => (
              <JobCard key={job.id} job={job} index={i} />
            ))}
          </AnimatePresence>
        )}
        {!loading && filteredJobs.length === 0 && (
          <div className="col-span-full text-center py-20">
            <p className="text-on-surface-variant">No projects found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
