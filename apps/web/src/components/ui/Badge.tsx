import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'live' | 'scheduled' | 'finished' | 'primary' | 'secondary';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', className }) => {
  const styles = {
    live: 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse font-bold',
    scheduled: 'bg-slate-100 text-slate-700 border-slate-200',
    finished: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    primary: 'bg-rose-50 text-rose-600 border-rose-200',
    secondary: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wider uppercase',
          styles[variant],
          className
        )
      )}
    >
      {variant === 'live' && (
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
      )}
      {children}
    </span>
  );
};
