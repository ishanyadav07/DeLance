import React from 'react';
import { cn } from '@/src/utils';

interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export const GradientText: React.FC<GradientTextProps> = ({ children, className, ...props }) => {
  return (
    <span 
      className={cn("text-gradient-primary", className)}
      {...props}
    >
      {children}
    </span>
  );
};
