'use client';

import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguageStore } from '../../stores/useLanguageStore';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguageStore();

  return (
    <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-full p-1 shadow-inner">
      <div className="flex items-center px-2 text-slate-400">
        <Globe className="w-3.5 h-3.5" />
      </div>
      
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all duration-200 ${
          language === 'en'
            ? 'bg-primary text-white shadow-md shadow-blue-500/20'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLanguage('ar')}
        className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all duration-200 ${
          language === 'ar'
            ? 'bg-primary text-white shadow-md shadow-blue-500/20'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-label="Switch to Arabic"
      >
        AR
      </button>
    </div>
  );
};
