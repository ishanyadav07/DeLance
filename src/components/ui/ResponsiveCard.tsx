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

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
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
        "flex flex-col h-auto bg-surface-container-low rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-white/5 group",
        className
      )}
    >
      {/* Card Padding - Responsive */}
      <div className="p-3.5 sm:p-5 md:p-6 lg:p-7 flex flex-col h-full">
        {/* Image Section */}
        <div className="w-full mb-4 sm:mb-6 overflow-hidden rounded-xl aspect-video">
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
          <h3 className="text-lg md:text-xl lg:text-2xl font-semibold font-headline text-on-surface line-clamp-2 mb-2">
            {title}
          </h3>

          {/* Description */}
          <p className="text-sm md:text-base text-on-surface-variant line-clamp-2 mb-4">
            {description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag, index) => (
              <span 
                key={index} 
                className="px-3 py-1 text-[10px] md:text-xs font-bold font-label uppercase tracking-wider bg-primary/10 text-primary rounded-full border border-primary/20"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-left w-full md:w-auto">
              <span className="text-xs font-label text-on-surface-variant uppercase tracking-widest block mb-1">Budget</span>
              <span className="text-xl font-headline font-bold text-primary">{price}</span>
            </div>
            
            <button 
              onClick={onButtonClick}
              className="w-full md:w-auto px-6 py-3 bg-primary text-surface font-bold text-sm rounded-xl hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/10"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
