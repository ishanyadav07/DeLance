import React from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Lock, Rocket, ShieldCheck, CheckCircle, FileText, Gavel, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/src/utils';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientText } from '../components/ui/GradientText';

export const Dashboard = () => {
  const navigate = useNavigate();
  const stats = [
    { label: 'Total Budget Locked', value: '$142,500', change: '+12.5% this month', icon: Lock, color: 'text-primary' },
    { label: 'Active Jobs', value: '04', change: '2 pending milestone approval', icon: Rocket, color: 'text-secondary' },
    { label: 'Completed Jobs', value: '18', change: '98% success rate on chain', icon: ShieldCheck, color: 'text-tertiary' },
  ];

  const deployments = [
    { name: 'Cross-Chain Dex Audit', milestone: 'Milestone 2 of 4', architect: 'Alex R.', wallet: '0x71C...4f92', budget: '45,000 USDC', status: 'Locked' },
    { name: 'Yield Aggregator UI', milestone: 'Milestone 1 of 2', architect: 'Sarah Chen', wallet: '0x3A2...b1e2', budget: '12,500 USDC', status: 'Locked' },
    { name: 'NFT Royalty Contract', milestone: 'Pending Selection', architect: 'Unassigned', wallet: '', budget: '8,000 USDC', status: 'Draft' },
  ];

  const pulse = [
    { time: '2 hours ago', title: 'Milestone #1 Approved', desc: 'Yield Aggregator UI. Escrow released 6,250 USDC to Sarah Chen.', icon: CheckCircle, color: 'text-tertiary', bg: 'bg-tertiary/20' },
    { time: '5 hours ago', title: 'New Work Submitted', desc: 'Alex R. uploaded audit report for Cross-Chain Dex.', icon: FileText, color: 'text-secondary', bg: 'bg-secondary/20' },
    { time: 'Yesterday', title: 'Contract Signed', desc: '"L2 Governance Framework" successfully locked in escrow.', icon: Gavel, color: 'text-primary', bg: 'bg-primary/20' },
  ];

  return (
    <div className="max-w-7xl 2xl:max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-16 gap-6">
        <div className="space-y-2">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter">Architect Dashboard</h1>
          <p className="text-on-surface-variant text-base md:text-lg max-w-lg">
            Managing 4 active smart-contract deployments across 2 networks. Your total secured liquidity is currently $142,500 USDC.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <button className="flex-1 sm:flex-none px-8 py-4 rounded-xl bg-surface-container-high border border-white/5 font-bold text-sm hover:bg-surface-container-highest transition-all">
            Export Audit Logs
          </button>
          <Link to="/post-project" className="flex-1 sm:flex-none px-8 py-4 rounded-xl bg-linear-to-r from-primary to-primary-container text-surface font-bold text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all text-center">
            Post New Job
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-16">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.1 }}
            className="h-full"
          >
            <GlassCard className="p-6 sm:p-8 rounded-2xl relative overflow-hidden group h-full">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon size={120} />
              </div>
              <div className="absolute right-4 bottom-4 opacity-[0.02] pointer-events-none">
                <div className="w-16 h-16 border-2 border-primary rounded-full rotate-12 flex items-center justify-center">
                  <span className="text-[10px] font-black text-primary">DL</span>
                </div>
              </div>
              <p className="font-label text-xs text-primary uppercase tracking-widest mb-2">{stat.label}</p>
              <h3 className="font-headline text-3xl md:text-4xl font-bold mb-1">{stat.value}</h3>
              <p className={cn("font-label text-sm", i === 0 ? "text-tertiary" : "text-on-surface-variant")}>
                {stat.change}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 2xl:grid-cols-4 gap-8 lg:gap-12">
        {/* Current Deployments */}
        <div className="lg:col-span-2 2xl:col-span-3 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-2xl font-bold">Current Deployments</h2>
            <Link to="/marketplace" className="text-primary text-sm font-medium hover:underline">View all jobs</Link>
          </div>
          
          <div className="bg-surface-container-low rounded-2xl border border-white/5 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-0">
              <thead>
                <tr className="bg-surface-container/50 border-b border-white/5">
                  <th className="px-6 py-4 font-label text-[10px] uppercase tracking-wider text-outline">Project Name</th>
                  <th className="px-6 py-4 font-label text-[10px] uppercase tracking-wider text-outline">Architect / Talent</th>
                  <th className="px-6 py-4 font-label text-[10px] uppercase tracking-wider text-outline">Escrow Budget</th>
                  <th className="px-6 py-4 font-label text-[10px] uppercase tracking-wider text-outline text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {deployments.map((job, i) => (
                  <tr key={i} onClick={() => navigate('/project/1')} className="hover:bg-white/5 transition-colors cursor-pointer group">
                    <td className="px-6 py-6">
                      <p className="font-headline font-bold group-hover:text-primary transition-colors">{job.name}</p>
                      <p className="text-xs text-on-surface-variant mt-1">{job.milestone}</p>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-container overflow-hidden">
                          {job.architect !== 'Unassigned' ? (
                            <img src={`https://picsum.photos/seed/${job.architect}/100/100`} alt="" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-outline"><Search size={14} /></div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{job.architect}</p>
                          <p className="font-label text-[10px] text-outline">{job.wallet}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <p className="font-headline font-bold">{job.budget}</p>
                      <p className="font-label text-[10px] text-tertiary">Secured in V3 Vault</p>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <span className={cn(
                        "px-3 py-1 rounded-full font-label text-[10px] uppercase tracking-tighter",
                        job.status === 'Locked' ? "bg-tertiary/10 text-tertiary" : "bg-secondary/10 text-secondary"
                      )}>
                        {job.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pulse Feed */}
        <div className="space-y-8">
          <h2 className="font-headline text-2xl font-bold">Pulse Feed</h2>
          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-linear-to-b before:from-primary/30 before:via-white/5 before:to-transparent">
            {pulse.map((item, i) => (
              <div key={i} className="relative flex items-start gap-6 group">
                <div className={cn("flex items-center justify-center w-10 h-10 rounded-full ring-4 ring-surface z-10 transition-transform group-hover:scale-110", item.bg, item.color)}>
                  <item.icon size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-label text-outline mb-1 uppercase tracking-widest">{item.time}</p>
                  <div className="bg-surface-container-low p-4 rounded-xl border border-white/5">
                    <p className="text-sm leading-relaxed">
                      <span className="font-bold">{item.title}:</span> {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-3 rounded-xl border border-white/10 text-sm font-medium text-on-surface-variant hover:bg-white/5 transition-all">
            View Full History
          </button>
        </div>
      </div>
    </div>
  );
};
