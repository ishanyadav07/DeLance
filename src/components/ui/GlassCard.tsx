import React from 'react';
import { cn } from '@/src/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn("glass-card rounded-2xl p-4 sm:p-6 border border-white/5 shadow-xl relative overflow-hidden", className)}
      {...props}
    >
      {children}
    </div>
  );
};
