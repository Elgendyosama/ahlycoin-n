import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">{label}</label>}
      <input
        className={twMerge(
          clsx(
            'w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:bg-white transition-all duration-200 text-sm',
            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500',
            className
          )
        )}
        {...props}
      />
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </div>
  );
};
