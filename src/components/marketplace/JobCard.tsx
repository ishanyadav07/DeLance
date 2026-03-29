import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { cn } from '@/src/utils';

interface JobCardProps {
  job: {
    id: string | number;
    title: string;
    client: string;
    clientPhotoURL?: string;
    budget: string | number;
    currency: string;
    category: string;
    tags: string[];
    status: string;
    desc: string;
    bidCount?: number;
  };
  index: number;
}

export const JobCard: React.FC<JobCardProps> = React.memo(({ job, index }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="h-full w-full"
    >
      <div className="group flex flex-col h-full w-full bg-surface-container-low/40 hover:bg-surface-container-low border border-white/5 hover:border-primary/30 transition-all duration-500 relative overflow-hidden rounded-2xl shadow-lg hover:shadow-primary/5">
        <Link to={`/project/${job.id}`} className="absolute inset-0 z-30" />
        
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="p-6 flex flex-col h-full relative z-20">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container-high border border-white/10 overflow-hidden shrink-0">
                <img 
                  src={job.clientPhotoURL || `https://picsum.photos/seed/${job.client}/100/100`} 
                  alt={job.client} 
                  loading="lazy" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                />
              </div>
              <div>
                <p className="font-mono text-[10px] text-primary font-bold uppercase tracking-widest truncate max-w-[120px]">{job.client}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <ShieldCheck size={10} className="text-tertiary" />
                  <span className="font-mono text-[9px] text-outline uppercase tracking-wider">Verified</span>
                </div>
              </div>
            </div>
            
            <div className={cn(
              "px-2 py-1 rounded-full border backdrop-blur-md shrink-0 flex items-center gap-1",
              job.status === 'Negotiable' ? "bg-secondary/10 text-secondary border-secondary/20" : "bg-tertiary/10 text-tertiary border-tertiary/20"
            )}>
              <span className="text-[8px] font-mono font-bold uppercase tracking-wider">{job.status}</span>
            </div>
          </div>

          <div className="mb-6 flex-1">
            <h3 className="text-xl font-bold font-headline leading-tight tracking-tight text-on-surface group-hover:text-primary transition-colors duration-300 mb-3 line-clamp-2">
              {job.title}
            </h3>
            <p className="text-sm text-on-surface-variant line-clamp-2 leading-relaxed opacity-80">
              {job.desc}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-6">
            {job.tags.slice(0, 3).map(tag => (
              <span key={tag} className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md border border-white/5">
                {tag}
              </span>
            ))}
            {job.tags.length > 3 && (
              <span className="font-mono text-[9px] text-outline uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md border border-white/5">
                +{job.tags.length - 3}
              </span>
            )}
          </div>

          <div className="pt-5 border-t border-white/5 flex items-end justify-between mt-auto">
            <div>
              <span className="font-mono text-[9px] text-outline uppercase tracking-widest block mb-1">Budget</span>
              <div className="flex items-baseline gap-1">
                <span className="font-headline text-2xl font-black tracking-tighter text-on-surface">{job.budget}</span>
                <span className="font-mono text-[10px] text-primary font-bold uppercase">{job.currency}</span>
              </div>
            </div>
            
            <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-primary flex items-center justify-center transition-colors duration-500 border border-white/10 group-hover:border-primary">
              <ArrowRight size={16} className="text-on-surface group-hover:text-surface group-hover:-rotate-45 transition-all duration-500" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
