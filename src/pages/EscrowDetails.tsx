import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Lock,
  Zap
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { cn } from '@/src/utils';

export const EscrowDetails = () => {
  const { id } = useParams();

  const timeline = [
    { status: 'completed', title: 'Contract Initialized', date: 'Oct 20, 2024', desc: `Smart contract deployed on Base. 12.5 ETH deposited for Escrow #${id || '8821-B'}.` },
    { status: 'completed', title: 'Architect Assigned', date: 'Oct 21, 2024', desc: '0x71C...4f92 (Alex R.) accepted the project terms.' },
    { status: 'active', title: 'Milestone 1: Architecture', date: 'In Progress', desc: 'Deliverables submitted. Pending client review for release of 2.5 ETH.' },
    { status: 'pending', title: 'Milestone 2: Implementation', date: 'Upcoming', desc: '6.0 ETH currently locked in vault.' },
    { status: 'pending', title: 'Final Release', date: 'Upcoming', desc: '4.0 ETH currently locked in vault.' },
  ];

  return (
    <div className="max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link to="/dashboard" className="mb-8 sm:mb-12 flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-medium group w-fit">
        <ArrowLeft size={16} />
        <span>Back to Dashboard</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-8 sm:space-y-10">
          <header className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Shield size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-headline font-extrabold tracking-tight">Escrow #{id || '8821-B'}</h1>
                <p className="text-on-surface-variant text-sm font-label">Contract: 0x8f2...e91a</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold font-headline">DeFi Yield Aggregator Audit</h2>
          </header>

          <div className="space-y-8">
            <h3 className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">Transaction Timeline</h3>
            <div className="space-y-0">
              {timeline.map((item, i) => (
                <div key={i} className="relative pl-10 pb-10 last:pb-0">
                  {i !== timeline.length - 1 && (
                    <div className={cn(
                      "absolute left-[15px] top-[30px] bottom-0 w-[2px]",
                      item.status === 'completed' ? "bg-tertiary" : "bg-white/5"
                    )}></div>
                  )}
                  <div className={cn(
                    "absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center z-10",
                    item.status === 'completed' ? "bg-tertiary text-surface" : 
                    item.status === 'active' ? "bg-primary text-surface animate-pulse" : 
                    "bg-surface-container-highest text-on-surface-variant"
                  )}>
                    {item.status === 'completed' ? <CheckCircle size={16} /> : 
                     item.status === 'active' ? <Clock size={16} /> : 
                     <Lock size={14} />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className={cn("font-bold", item.status === 'pending' && "text-on-surface/40")}>{item.title}</h4>
                      <span className="text-[10px] font-label text-outline uppercase tracking-widest">{item.date}</span>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-surface-container-low p-8 rounded-2xl border border-white/5 space-y-8">
            <div className="space-y-4">
              <h3 className="font-headline font-bold text-xl">Vault Status</h3>
              <div className="p-6 bg-surface-container rounded-xl border border-white/5 space-y-4">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Total Locked</p>
                  <p className="text-2xl font-label font-bold">12.5 ETH</p>
                </div>
                <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[20%]"></div>
                </div>
                <div className="flex justify-between text-[10px] font-label text-outline uppercase tracking-widest">
                  <span>Released: 0.0 ETH</span>
                  <span>Remaining: 12.5 ETH</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">Protocol Security</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Shield size={16} className="text-tertiary" />
                  <span>Multi-sig Verified</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Zap size={16} className="text-primary" />
                  <span>Instant Settlement</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <AlertCircle size={16} className="text-secondary" />
                  <span>Dispute Resolution Active</span>
                </div>
              </div>
            </div>

            <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all">
              <ExternalLink size={16} />
              View on BaseScan
            </button>
          </div>

          <div className="p-6 glass-card rounded-2xl border border-primary/10">
            <p className="text-xs text-on-surface-variant leading-relaxed italic">
              "This transaction is protected by the DeLance v1.0 Escrow Protocol. Funds are cryptographically secured and can only be released upon milestone verification or consensus."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
