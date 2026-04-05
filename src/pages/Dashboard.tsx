import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Lock, Rocket, ShieldCheck, CheckCircle, FileText, Gavel, ArrowRight, Loader2, Clock, User, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/src/utils';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useFirebase } from '../components/FirebaseProvider';
import { useWeb3 } from '../components/Web3Provider';
import { GlassCard } from '../components/ui/GlassCard';
import { getUserTransactions, subscribeToUserTransactions, Transaction } from '../services/transactionService';

export const Dashboard = () => {
  const { user, loading: authLoading, isAdmin, profileData } = useFirebase();
  const { balance, usdcBalance } = useWeb3();
  const navigate = useNavigate();
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [myBids, setMyBids] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'client' | 'freelancer'>('client');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const calculateCompletion = () => {
    if (!profileData) return 0;
    const fields = [
      profileData.displayName,
      profileData.bio,
      profileData.title,
      profileData.location,
      profileData.skills?.length > 0,
      profileData.website || profileData.github || profileData.linkedin,
      profileData.hourlyRate > 0,
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const completion = calculateCompletion();

  useEffect(() => {
    if (!user) return;

    // Fetch jobs: if admin, fetch all; otherwise, fetch only user's jobs
    const jobsCollection = collection(db, 'jobs');
    const jobsQuery = isAdmin 
      ? query(jobsCollection, orderBy('createdAt', 'desc'), limit(50))
      : query(jobsCollection, where('clientId', '==', user.uid), orderBy('createdAt', 'desc'));
    
    const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
      setMyJobs(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching jobs:", error);
      setLoading(false);
    });

    // Fetch active projects for freelancer
    const freelancerJobsQuery = query(jobsCollection, where('freelancerId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubscribeFreelancerJobs = onSnapshot(freelancerJobsQuery, (snapshot) => {
      const freelancerJobs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      // We'll use this to show "Working On" projects
      if (freelancerJobs.length > 0) {
        // If user has freelancer jobs, maybe default to freelancer tab if they have no client jobs?
        // For now, just keep it simple.
      }
    });

    // Subscribe to transactions
    const unsubscribeTransactions = subscribeToUserTransactions(user.uid, (txs) => {
      setTransactions(txs);
    });

    return () => {
      unsubscribeJobs();
      unsubscribeFreelancerJobs();
      unsubscribeTransactions();
    };
  }, [user, isAdmin]);

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-headline font-bold mb-4 uppercase tracking-tighter">Access Denied</h2>
        <p className="text-on-surface-variant mb-8 font-sans">Please sign in to view your dashboard and manage your projects.</p>
        <Link to="/" className="px-10 py-5 bg-primary text-surface rounded-xl font-bold uppercase tracking-widest text-xs">
          Go to Home
        </Link>
      </div>
    );
  }

  const totalBudget = myJobs.reduce((acc, job) => acc + (Number(job.budget) || 0), 0);
  const activeJobsCount = myJobs.filter(j => j.status === 'open').length;
  const inProgressCount = myJobs.filter(j => j.status === 'in-progress').length;

  const stats = [
    { 
      label: 'Wallet Balance', 
      value: `${usdcBalance ? parseFloat(usdcBalance).toFixed(2) : '0.00'} USDC`, 
      change: 'Available in MetaMask', 
      icon: ShieldCheck, 
      color: 'text-success' 
    },
    { 
      label: isAdmin ? 'Platform Volume' : 'Total Escrow', 
      value: `${totalBudget.toLocaleString()} ${myJobs[0]?.currency || 'USD'}`, 
      change: `${myJobs.length} total projects`, 
      icon: Lock, 
      color: 'text-primary' 
    },
    { 
      label: 'Active Work', 
      value: inProgressCount.toString().padStart(2, '0'), 
      change: 'In development', 
      icon: Zap, 
      color: 'text-tertiary' 
    },
  ];

  return (
    <div className="max-w-7xl 2xl:max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-16 gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
            <span className="font-mono text-[10px] text-primary font-bold uppercase tracking-widest">System Online</span>
          </div>
          <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-on-surface uppercase leading-[0.9]">
            {isAdmin ? 'Admin' : 'Dashboard'}
          </h1>
          <p className="text-on-surface-variant text-base md:text-lg max-w-xl font-sans opacity-80">
            {isAdmin 
              ? `Overseeing ${myJobs.length} platform projects and global volume.`
              : `Welcome back, ${user?.displayName?.split(' ')[0]}. You have ${myJobs.length} projects under management.`
            }
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link to="/post-project" className="flex-1 sm:flex-none px-8 py-4 bg-primary text-surface rounded-xl font-label font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 active:scale-95 transition-all text-center">
            Post New Job
          </Link>
        </div>
      </header>

      {completion < 100 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <GlassCard className="p-6 bg-primary/5 border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <User size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="font-headline font-bold text-lg">Complete your professional profile</h3>
                <p className="text-xs text-on-surface-variant">Your profile is {completion}% complete. A full profile increases your visibility to potential clients by 3x.</p>
              </div>
            </div>
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="flex-1 md:w-48 h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${completion}%` }}></div>
              </div>
              <Link to="/profile" className="px-6 py-3 bg-primary text-surface rounded-lg font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">
                Complete Now
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="p-8 rounded-2xl relative overflow-hidden group border-white/5 hover:border-primary/20 transition-all">
              <div className="absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                <stat.icon size={120} />
              </div>
              <p className="font-label text-[10px] text-primary uppercase tracking-[0.2em] font-bold mb-4">{stat.label}</p>
              <h3 className="font-headline text-4xl font-black tracking-tighter mb-2">{stat.value}</h3>
              <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                {stat.change}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Current Projects */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="font-headline text-2xl font-bold uppercase tracking-tight">Active Projects</h2>
            <Link to="/marketplace" className="text-primary text-[10px] font-bold hover:underline uppercase tracking-widest">Marketplace <ArrowRight size={12} className="inline ml-1" /></Link>
          </div>
          
          <div className="space-y-4">
            {myJobs.length > 0 ? myJobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard 
                  onClick={() => navigate(`/project/${job.id}`)} 
                  className="p-6 hover:bg-white/5 transition-all cursor-pointer group border-white/5 hover:border-primary/30"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[8px] text-primary font-bold uppercase tracking-[0.2em] bg-primary/10 px-2 py-0.5 rounded-full">
                          {job.category}
                        </span>
                        <span className={cn(
                          "font-mono text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-full",
                          job.status === 'open' ? "bg-secondary/10 text-secondary" : "bg-tertiary/10 text-tertiary"
                        )}>
                          {job.status}
                        </span>
                      </div>
                      <h3 className="font-headline text-lg font-bold group-hover:text-primary transition-colors">{job.title}</h3>
                      <p className="text-xs text-on-surface-variant font-sans line-clamp-1">{job.description}</p>
                    </div>
                    <div className="flex items-center gap-6 sm:text-right">
                      <div className="space-y-0.5">
                        <p className="font-headline font-black text-xl tracking-tighter">{job.budget} <span className="text-[10px] font-mono text-on-surface-variant uppercase">{job.currency}</span></p>
                        <p className="font-mono text-[8px] text-outline uppercase tracking-widest">Escrow Locked</p>
                      </div>
                      <ArrowRight size={16} className="text-outline group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )) : (
              <div className="bg-surface-container-low py-16 rounded-2xl border border-dashed border-white/10 text-center">
                <p className="text-on-surface-variant font-sans text-sm mb-6">No active projects found in your portfolio.</p>
                <Link to="/post-project" className="px-8 py-4 bg-primary/10 text-primary border border-primary/20 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-primary/20 transition-all">
                  Post Your First Project
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Pulse Feed & Transaction History */}
        <div className="lg:col-span-4 space-y-12">
          <div className="space-y-8">
            <h2 className="font-headline text-2xl font-bold uppercase tracking-tight border-b border-white/5 pb-4">Pulse</h2>
            <div className="space-y-6">
              {myJobs.slice(0, 3).map((job, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-1 h-12 bg-linear-to-b from-primary to-transparent rounded-full opacity-30 group-hover:opacity-100 transition-opacity"></div>
                  <div className="space-y-1">
                    <p className="font-mono text-[8px] text-outline uppercase tracking-widest">
                      {job.createdAt?.toDate ? job.createdAt.toDate().toLocaleDateString() : 'Recent'}
                    </p>
                    <p className="text-xs font-sans leading-relaxed">
                      <span className="font-bold text-primary uppercase text-[10px] tracking-widest mr-1">Posted:</span>
                      {job.title} is live and synced.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="font-headline text-2xl font-bold uppercase tracking-tight border-b border-white/5 pb-4">Transaction History</h2>
            <div className="space-y-4">
              {transactions.length > 0 ? transactions.slice(0, 5).map((tx, i) => (
                <div key={tx.id || i} className="p-4 bg-surface-container-low/30 border border-white/5 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-outline uppercase tracking-widest">
                        {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleDateString() : 'Pending'}
                      </p>
                      <p className="text-xs font-bold uppercase tracking-tight">
                        {tx.type.replace('_', ' ')}
                      </p>
                    </div>
                    <p className={cn(
                      "font-mono text-sm font-bold",
                      tx.fromId === user.uid ? "text-error" : "text-success"
                    )}>
                      {tx.fromId === user.uid ? '-' : '+'}{tx.amount} <span className="text-[10px]">{tx.currency}</span>
                    </p>
                  </div>
                  <p className="text-[10px] text-on-surface-variant font-sans truncate opacity-60">
                    Job ID: {tx.jobId}
                  </p>
                </div>
              )) : (
                <div className="py-8 text-center border border-dashed border-white/10 rounded-xl">
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">No transactions found</p>
                </div>
              )}
              <button className="w-full py-4 rounded-xl border border-white/5 text-[10px] font-bold text-on-surface-variant hover:bg-white/5 transition-all uppercase tracking-widest">
                Audit Full History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
