import React from 'react';
import { cn } from '@/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  padding = 'md'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden',
        hover && 'hover:shadow-lg transition-shadow duration-300 cursor-pointer',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;