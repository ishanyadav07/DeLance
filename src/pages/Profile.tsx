import React from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  MapPin, 
  Link as LinkIcon, 
  Twitter, 
  Github, 
  ShieldCheck, 
  Star, 
  Clock, 
  CheckCircle2,
  ExternalLink,
  Code2,
  Terminal,
  Cpu
} from 'lucide-react';
import { cn } from '@/src/utils';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientText } from '../components/ui/GradientText';

export const Profile = () => {
  const architect = {
    name: 'Alex Rivers',
    handle: '0x71C...4f92',
    bio: 'Full-stack Web3 Architect specializing in ZK-proofs and DeFi protocol security. Building the future of trustless finance.',
    location: 'Berlin, DE',
    website: 'alexrivers.eth',
    joined: 'Oct 2023',
    stats: [
      { label: 'Success Rate', value: '100%', icon: CheckCircle2 },
      { label: 'Avg. Rating', value: '4.9/5', icon: Star },
      { label: 'Jobs Completed', value: '24', icon: ShieldCheck },
      { label: 'Total Earned', value: '84.5 ETH', icon: Cpu },
    ],
    skills: ['Solidity', 'Rust', 'React', 'ZK-SNARKs', 'EVM Optimization'],
    portfolio: [
      { title: 'YieldVault V2', desc: 'Optimized smart contracts for a cross-chain yield aggregator.', tags: ['Solidity', 'Base'] },
      { title: 'ZkIdentity', desc: 'Privacy-preserving identity layer for DAO governance.', tags: ['Rust', 'Circom'] },
      { title: 'DeLance Protocol', desc: 'Core escrow logic and frontend architecture.', tags: ['TypeScript', 'Ethers.js'] },
    ]
  };

  return (
    <div className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
        {/* Left Column: Profile Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="space-y-6">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-tertiary p-1">
              <div className="w-full h-full rounded-[22px] bg-surface flex items-center justify-center overflow-hidden">
                <img 
                  src="https://picsum.photos/seed/architect/200/200" 
                  alt="Profile" 
                  loading="lazy"
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-headline font-extrabold">{architect.name}</h1>
              <p className="text-sm font-mono text-primary">{architect.handle}</p>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {architect.bio}
            </p>
            <div className="space-y-3 text-sm text-on-surface-variant">
              <div className="flex items-center gap-2">
                <MapPin size={14} />
                <span>{architect.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <LinkIcon size={14} />
                <span className="text-on-surface">{architect.website}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} />
                <span>Joined {architect.joined}</span>
              </div>
            </div>
            <div className="flex gap-4 pt-2">
              <button className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors">
                <Twitter size={18} />
              </button>
              <button className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors">
                <Github size={18} />
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 space-y-4">
            <h3 className="font-label text-xs uppercase tracking-widest text-on-surface-variant font-bold">Verification</h3>
            <div className="p-4 bg-tertiary/5 rounded-xl border border-tertiary/20 flex items-center gap-3">
              <ShieldCheck className="text-tertiary" size={20} />
              <div className="text-xs">
                <p className="font-bold text-tertiary">Verified Architect</p>
                <p className="text-on-surface-variant">Identity verified on-chain</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Stats and Content */}
        <div className="lg:col-span-3 space-y-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {architect.stats.map((stat, i) => (
              <GlassCard key={i} className="p-6 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <stat.icon size={14} />
                  <span className="text-[10px] font-label uppercase tracking-widest">{stat.label}</span>
                </div>
                <p className="text-2xl font-headline font-bold">{stat.value}</p>
              </GlassCard>
            ))}
          </div>

          {/* Skills */}
          <div className="space-y-6">
            <h3 className="font-headline font-bold text-xl flex items-center gap-2">
              <Terminal size={20} className="text-primary" />
              Technical Stack
            </h3>
            <div className="flex flex-wrap gap-2">
              {architect.skills.map((skill, i) => (
                <span key={i} className="px-4 py-2 bg-surface-container rounded-full text-xs font-medium border border-white/5">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Portfolio */}
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <h3 className="font-headline font-bold text-xl flex items-center gap-2">
                <Code2 size={20} className="text-secondary" />
                Recent Deployments
              </h3>
              <button className="text-xs text-primary font-medium hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {architect.portfolio.map((item, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -4 }}
                  className="h-full"
                >
                  <GlassCard className="p-6 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group cursor-pointer h-full">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold group-hover:text-primary transition-colors">{item.title}</h4>
                      <ExternalLink size={14} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
                      {item.desc}
                    </p>
                    <div className="flex gap-2">
                      {item.tags.map((tag, j) => (
                        <span key={j} className="text-[10px] font-label uppercase tracking-widest px-2 py-1 bg-surface-container rounded text-outline">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
