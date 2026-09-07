import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, glass = true }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'rounded-2xl p-5 border border-slate-200/80 shadow-sm transition-all duration-300 bg-white text-slate-900',
          glass ? 'glass-card' : 'bg-white',
          className
        )
      )}
    >
      {children}
    </div>
  );
};
