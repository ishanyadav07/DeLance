import React from 'react';
import { cn } from '@/src/utils';

interface ResponsiveCardProps {
  image: string;
  title: string;
  description: string;
  tags: string[];
  price: string;
  buttonText?: string;
  onButtonClick?: () => void;
  className?: string;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = React.memo(({
  image,
  title,
  description,
  tags,
  price,
  buttonText = 'View Details',
  onButtonClick,
  className,
}) => {
  return (
    <div 
      className={cn(
        "flex flex-col h-auto w-full bg-surface-container-low rounded-md sm:rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 border border-white/5 group",
        className
      )}
    >
      {/* Card Padding - Responsive */}
      <div className="p-2.5 sm:p-3 flex flex-col h-full">
        {/* Image Section */}
        <div className="w-full mb-2 sm:mb-3 overflow-hidden rounded-md aspect-video">
          <img 
            src={image} 
            alt={title} 
            loading="lazy" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-1">
          {/* Title */}
          <h3 className="text-sm md:text-base font-semibold font-headline text-on-surface line-clamp-2 mb-1">
            {title}
          </h3>

          {/* Description */}
          <p className="text-[10px] md:text-xs text-on-surface-variant line-clamp-2 mb-2">
            {description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.map((tag, index) => (
              <span 
                key={index} 
                className="px-1.5 py-0.5 text-[8px] md:text-[9px] font-bold font-label uppercase tracking-wider bg-primary/10 text-primary rounded-full border border-primary/20"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-auto pt-2 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-2">
            <div className="text-left w-full md:w-auto">
              <span className="text-[8px] font-label text-on-surface-variant uppercase tracking-widest block mb-0.5">Budget</span>
              <span className="text-base font-headline font-bold text-primary">{price}</span>
            </div>
            
            <button 
              onClick={onButtonClick}
              className="w-full md:w-auto px-3 py-1.5 bg-primary text-surface font-bold text-[10px] rounded-md hover:bg-primary-container transition-all active:scale-95 shadow-sm shadow-primary/10"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
