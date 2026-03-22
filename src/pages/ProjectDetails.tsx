import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Calendar, 
  ShieldCheck, 
  MapPin, 
  Star, 
  Bookmark,
  ChevronRight,
  User,
  Lock
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { cn } from '@/src/utils';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientText } from '../components/ui/GradientText';

export const ProjectDetails = () => {
  const { id } = useParams();

  // Mock data fetching based on ID
  const project = {
    id,
    title: id === '1' ? 'Smart Contract Audit' : 'Senior Smart Contract Architect: DeFi Yield Aggregator',
    client: id === '1' ? 'Aether Protocol' : 'Sovereign Labs',
    budget: id === '1' ? '4.50' : '12.5',
    currency: 'ETH',
    posted: 'Oct 24, 2024',
    rating: '4.95/5.0',
    location: 'Remote / Global',
    desc: 'We are seeking a senior-level blockchain architect to design and implement a complex yield aggregation protocol on Base. The project requires high-level security patterns, gas optimization, and integration with major liquidity pools.',
    milestones: [
      { title: 'Architecture Design & MVP Spec', date: 'Due 14 days after start', amount: '2.5 ETH', status: 'Active Phase', active: true },
      { title: 'Vault Strategy Implementation', date: 'Due 30 days after start', amount: '6.0 ETH', status: 'Pending', active: false },
      { title: 'Audit Prep & Documentation', date: 'Final Delivery', amount: '4.0 ETH', status: 'Pending', active: false },
    ]
  };

  return (
    <div className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link to="/marketplace" className="mb-6 sm:mb-8 flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group w-fit">
        <ArrowLeft size={16} />
        <span className="font-label text-xs uppercase tracking-widest">Back to Browse</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-wrap gap-3">
            <span className="bg-tertiary/10 text-tertiary px-3 py-1 rounded-full text-[10px] font-label font-bold uppercase tracking-tighter border border-tertiary/20">Verified Protocol</span>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-label font-bold uppercase tracking-tighter border border-primary/20">Smart Contract Escrow</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight leading-tight">
            {project.title}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-on-surface-variant text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              <span>Posted {project.posted}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-primary" />
              <span>Client Rating: {project.rating}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              <span>{project.location}</span>
            </div>
          </div>
        </div>

        <GlassCard className="p-8 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2">Project Budget</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold font-headline">{project.budget}</span>
              <span className="text-primary font-label font-bold text-xl uppercase">{project.currency}</span>
            </div>
            <p className="text-on-surface-variant font-label text-sm mt-1">≈ $32,450.00 USDC</p>
          </div>
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="flex items-center gap-2 text-tertiary">
              <Lock size={16} fill="currentColor" />
              <span className="text-xs font-label uppercase font-bold tracking-widest">Escrow Protected</span>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 space-y-10 sm:space-y-12">
          <section className="space-y-6">
            <h2 className="text-2xl font-bold font-headline">Scope of Work</h2>
            <div className="text-on-surface-variant leading-relaxed space-y-4 text-lg">
              <p>{project.desc}</p>
              <ul className="list-none space-y-3">
                <li className="flex gap-3"><span className="text-primary">•</span> Development of vault strategies for LSTs.</li>
                <li className="flex gap-3"><span className="text-primary">•</span> Implementing multi-sig controlled emergency shutdowns.</li>
                <li className="flex gap-3"><span className="text-primary">•</span> Integration with Chainlink Data Feeds and CCIP.</li>
                <li className="flex gap-3"><span className="text-primary">•</span> Full coverage unit testing (Hardhat/Foundry).</li>
              </ul>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold font-headline">Milestone Breakdown</h2>
            <div className="space-y-4">
              {project.milestones.map((m, i) => (
                <GlassCard key={i} className={cn(
                  "p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-l-4",
                  m.active ? "border-primary" : "border-outline-variant"
                )}>
                  <div>
                    <p className={cn("font-headline font-bold", !m.active && "text-on-surface/60")}>{m.title}</p>
                    <p className="text-xs text-on-surface-variant font-label mt-1">{m.date}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className={cn("font-headline font-bold", !m.active && "text-on-surface/60")}>{m.amount}</p>
                    <p className={cn("text-[10px] font-label uppercase font-bold", m.active ? "text-tertiary" : "text-on-surface-variant")}>{m.status}</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </section>

          <GlassCard className="p-8 rounded-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold font-headline">Apply for this Project</h2>
              <div className="flex gap-1 text-primary">
                {[1, 2, 3, 4].map(i => <Star key={i} size={14} fill="currentColor" />)}
                <Star size={14} className="text-on-surface-variant" />
              </div>
            </div>
            <div className="space-y-4">
              <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">Your Proposal & Approach</label>
              <textarea 
                className="w-full bg-surface-container-highest border-none rounded-xl p-6 focus:ring-1 focus:ring-primary/30 text-sm placeholder:text-on-surface-variant/50 min-h-[160px]" 
                placeholder="Describe your technical architecture approach and relevant experience..."
              />
              <div className="flex items-center gap-4">
                <button className="flex-1 bg-linear-to-r from-primary to-primary-container text-surface font-label font-bold uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-primary/10 hover:brightness-110 active:scale-[0.98] transition-all">
                  Submit Application
                </button>
                <button className="p-4 bg-surface-container-highest rounded-xl text-on-surface-variant hover:text-white transition-colors">
                  <Bookmark size={20} />
                </button>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-8">
          <GlassCard className="p-8 rounded-2xl border border-white/5 space-y-6 sticky top-28">
            <h3 className="font-headline font-bold text-xl">Client Reputation</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden">
                <img src={`https://picsum.photos/seed/${project.client}/200/200`} alt="" loading="lazy" referrerPolicy="no-referrer" />
              </div>
              <div>
                <p className="font-bold font-headline">{project.client}</p>
                <p className="text-xs text-on-surface-variant font-label">Member since 2022</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container p-4 rounded-xl text-center">
                <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-widest mb-1">Spent</p>
                <p className="font-bold font-headline text-lg">145+ ETH</p>
              </div>
              <div className="bg-surface-container p-4 rounded-xl text-center">
                <p className="text-[10px] text-on-surface-variant font-label uppercase tracking-widest mb-1">Hires</p>
                <p className="font-bold font-headline text-lg">12 Total</p>
              </div>
            </div>
            <div className="space-y-4 pt-4">
              <h4 className="font-label text-xs uppercase tracking-widest text-on-surface-variant">Recent Activity</h4>
              {[
                { text: '"Top tier client, clear specs."', author: 'dev_architect.eth' },
                { text: '"Prompt payments via escrow."', author: 'solidity_master' },
              ].map((review, i) => (
                <div key={i} className="text-sm space-y-1">
                  <p className="font-medium">{review.text}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-on-surface-variant">{review.author}</p>
                    <div className="flex text-tertiary">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} size={8} fill="currentColor" />)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full text-center py-3 text-[10px] font-label uppercase tracking-widest text-primary border border-primary/20 rounded-xl hover:bg-primary/5 transition-colors">
              View All Client Projects
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
