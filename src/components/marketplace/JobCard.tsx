import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { cn } from '@/src/utils';
import { GlassCard } from '../ui/GlassCard';
import { GradientText } from '../ui/GradientText';

interface JobCardProps {
  job: {
    id: number;
    title: string;
    client: string;
    budget: string;
    currency: string;
    category: string;
    tags: string[];
    status: string;
    desc: string;
  };
  index: number;
}

export const JobCard: React.FC<JobCardProps> = ({ job, index }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="h-full"
    >
      <GlassCard className="group flex flex-col h-full border border-white/5 hover:border-primary/30 transition-all duration-500 relative overflow-hidden shadow-2xl">
        <Link to={`/project/${job.id}`} className="absolute inset-0 z-30" />
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-tertiary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="p-5 md:p-6 flex flex-col h-full relative z-20">
          <div className="flex items-start justify-between gap-3 mb-4 sm:mb-6">
            <div className="flex items-start gap-3 w-full">
              <div className="w-10 h-10 sm:w-12 rounded-lg sm:rounded-xl bg-surface-container border border-white/10 overflow-hidden group-hover:border-primary/30 transition-colors duration-500 shadow-inner shrink-0 mt-0.5">
                <img src={`https://picsum.photos/seed/${job.client}/100/100`} alt="" loading="lazy" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="text-[9px] sm:text-[10px] text-primary font-mono font-bold uppercase tracking-widest truncate max-w-[120px]">{job.client}</p>
                  <div className={cn(
                    "px-1.5 py-0.5 rounded-full flex items-center gap-1 border backdrop-blur-md shrink-0",
                    job.status === 'Negotiable' ? "bg-secondary/10 text-secondary border-secondary/20" : "bg-tertiary/10 text-tertiary border-tertiary/20"
                  )}>
                    <ShieldCheck size={10} className="fill-current" />
                    <span className="text-[7px] sm:text-[8px] font-mono font-bold uppercase tracking-wider">{job.status}</span>
                  </div>
                </div>
                <h3 className="text-base md:text-lg font-bold font-headline leading-tight tracking-tight group-hover:text-primary transition-colors duration-500 line-clamp-2">{job.title}</h3>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs md:text-sm text-on-surface-variant line-clamp-2 leading-relaxed group-hover:text-on-surface transition-colors duration-500">
              {job.desc}
            </p>
          </div>

          <div className="flex items-baseline gap-1.5 mb-4 sm:mb-6">
            <GradientText className="font-headline text-2xl sm:text-3xl font-black tracking-tighter">{job.budget}</GradientText>
            <span className="font-mono text-[10px] sm:text-xs text-on-surface-variant font-bold uppercase">{job.currency}</span>
          </div>

          <div className="flex flex-wrap gap-1 mb-6 sm:mb-8 flex-1">
            {job.tags.map(tag => (
              <span key={tag} className="bg-surface-container-highest/30 text-on-surface-variant text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-md border border-white/5 group-hover:border-primary/20 transition-colors duration-500">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-auto">
            <div className="w-full bg-white/5 group-hover:bg-primary group-hover:text-surface py-2.5 px-4 rounded-lg sm:rounded-xl font-headline font-bold text-[9px] sm:text-[10px] uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-2">
              View Details
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-500" />
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};
