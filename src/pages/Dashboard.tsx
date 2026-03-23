import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Lock, Rocket, ShieldCheck, CheckCircle, FileText, Gavel, ArrowRight, Loader2, Clock, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/src/utils';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useFirebase } from '../components/FirebaseProvider';
import { GlassCard } from '../components/ui/GlassCard';

export const Dashboard = () => {
  const { user, loading: authLoading, isAdmin } = useFirebase();
  const navigate = useNavigate();
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

    return () => unsubscribeJobs();
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
        <h2 className="text-3xl font-headline font-bold mb-4">Access Denied</h2>
        <p className="text-on-surface-variant mb-8">Please sign in to view your dashboard and manage your projects.</p>
        <Link to="/" className="px-8 py-4 bg-primary text-surface rounded-xl font-bold">
          Go to Home
        </Link>
      </div>
    );
  }

  const totalBudget = myJobs.reduce((acc, job) => acc + (Number(job.budget) || 0), 0);
  const activeJobsCount = myJobs.filter(j => j.status === 'open').length;
  const completedJobsCount = myJobs.filter(j => j.status === 'completed').length;

  const stats = [
    { 
      label: isAdmin ? 'Total Platform Volume' : 'Total Budget in Automated Escrow', 
      value: `${totalBudget.toLocaleString()} ${myJobs[0]?.currency || 'USD'}`, 
      change: `${myJobs.length} total ${isAdmin ? 'platform' : 'personal'} jobs`, 
      icon: Lock, 
      color: 'text-primary' 
    },
    { 
      label: 'Open for Bids', 
      value: activeJobsCount.toString().padStart(2, '0'), 
      change: 'Awaiting freelancer selection', 
      icon: Rocket, 
      color: 'text-secondary' 
    },
    { 
      label: 'Completed Jobs', 
      value: completedJobsCount.toString().padStart(2, '0'), 
      change: '100% success rate', 
      icon: ShieldCheck, 
      color: 'text-tertiary' 
    },
  ];

  const pulse = [
    { time: 'Just now', title: 'Dashboard Connected', desc: 'Your real-time platform dashboard is now active and synced with Firestore.', icon: CheckCircle, color: 'text-tertiary', bg: 'bg-tertiary/20' },
    ...myJobs.slice(0, 2).map(job => ({
      time: job.createdAt?.toDate ? job.createdAt.toDate().toLocaleDateString() : 'Recently',
      title: 'Project Posted',
      desc: `"${job.title}" is now live and accepting bids from the network.`,
      icon: Rocket,
      color: 'text-primary',
      bg: 'bg-primary/20'
    }))
  ];

  return (
    <div className="max-w-7xl 2xl:max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-16 gap-6">
        <div className="space-y-3">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface">
            {isAdmin ? 'Admin Control Center' : `Welcome, ${user?.displayName?.split(' ')[0] || 'Freelancer'}`}
          </h1>
          <p className="text-on-surface-variant text-base md:text-lg max-w-lg font-sans">
            {isAdmin 
              ? `Overseeing ${myJobs.length} platform projects and global volume.`
              : `Managing ${myJobs.length} active projects. Your total secured budget is currently ${totalBudget.toLocaleString()} ${myJobs[0]?.currency || 'USD'}.`
            }
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button className="flex-1 sm:flex-none px-6 py-3 rounded-lg bg-surface-container-high border border-white/5 font-bold text-xs uppercase tracking-widest hover:bg-surface-container-highest transition-all">
            Export Audit Logs
          </button>
          <Link to="/post-project" className="flex-1 sm:flex-none px-6 py-3 rounded-lg bg-linear-to-r from-primary to-primary-container text-surface font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all text-center">
            Post New Job
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.1 }}
            className="h-full"
          >
            <GlassCard className="p-6 rounded-xl relative overflow-hidden group h-full">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon size={80} />
              </div>
              <p className="font-label text-[10px] text-primary uppercase tracking-widest mb-2">{stat.label}</p>
              <h3 className="font-headline text-3xl font-bold mb-1">{stat.value}</h3>
              <p className={cn("font-label text-xs", i === 0 ? "text-tertiary" : "text-on-surface-variant")}>
                {stat.change}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
        {/* Current Projects */}
        <div className="lg:col-span-2 2xl:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-xl font-bold">Current Projects</h2>
            <Link to="/marketplace" className="text-primary text-xs font-bold hover:underline uppercase tracking-widest">View all jobs</Link>
          </div>
          
          <div className="bg-surface-container-low rounded-xl border border-white/5 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface-container/50 border-b border-white/5">
                  <th className="px-5 py-3 font-label text-[9px] uppercase tracking-wider text-outline">Project Name</th>
                  <th className="px-5 py-3 font-label text-[9px] uppercase tracking-wider text-outline">Freelancer / Talent</th>
                  <th className="px-5 py-3 font-label text-[9px] uppercase tracking-wider text-outline">Automated Escrow</th>
                  <th className="px-5 py-3 font-label text-[9px] uppercase tracking-wider text-outline text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {myJobs.length > 0 ? myJobs.map((job, i) => (
                  <tr key={i} onClick={() => navigate(`/project/${job.id}`)} className="hover:bg-white/5 transition-colors cursor-pointer group">
                    <td className="px-5 py-4">
                      <p className="font-headline font-bold text-sm group-hover:text-primary transition-colors">{job.title}</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5 font-sans">{job.category}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-surface-container overflow-hidden flex items-center justify-center text-outline">
                          <User size={12} />
                        </div>
                        <div>
                          <p className="font-medium text-xs font-sans">{job.freelancerName || (job.status === 'open' ? 'Awaiting Bids' : 'Unassigned')}</p>
                          <p className="font-label text-[9px] text-outline">
                            {job.freelancerId ? `ID: ${job.freelancerId.slice(0, 6)}...` : 'Freelancer Network'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-headline font-bold text-sm">{job.budget} {job.currency}</p>
                      <p className="font-label text-[9px] text-tertiary">Secured in Automated Escrow</p>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full font-label text-[9px] uppercase tracking-tighter",
                        job.status === 'open' ? "bg-secondary/10 text-secondary" : 
                        job.status === 'in-progress' ? "bg-primary/10 text-primary" :
                        job.status === 'submitted' ? "bg-tertiary/10 text-tertiary" :
                        job.status === 'completed' ? "bg-success/10 text-success" :
                        "bg-error/10 text-error"
                      )}>
                        {job.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-on-surface-variant italic text-xs">
                      No active projects found. <Link to="/post-project" className="text-primary font-bold hover:underline">Post your first project</Link> to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pulse Feed */}
        <div className="space-y-6">
          <h2 className="font-headline text-xl font-bold">Pulse Feed</h2>
          <div className="relative space-y-6 before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-0.5 before:bg-linear-to-b before:from-primary/30 before:via-white/5 before:to-transparent">
            {pulse.map((item, i) => (
              <div key={i} className="relative flex items-start gap-4 group">
                <div className={cn("flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-surface z-10 transition-transform group-hover:scale-110", item.bg, item.color)}>
                  <item.icon size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-label text-outline mb-1 uppercase tracking-widest">{item.time}</p>
                  <div className="bg-surface-container-low p-3 rounded-lg border border-white/5">
                    <p className="text-xs leading-relaxed font-sans">
                      <span className="font-bold">{item.title}:</span> {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-2 rounded-lg border border-white/10 text-[10px] font-medium text-on-surface-variant hover:bg-white/5 transition-all uppercase tracking-widest">
            View Full History
          </button>
        </div>
      </div>
    </div>
  );
};
