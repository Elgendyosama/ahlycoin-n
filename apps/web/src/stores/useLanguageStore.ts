import { create } from 'zustand';

export type Language = 'en' | 'ar';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const STORAGE_KEY = 'app_lang';
const COOKIE_KEY = 'app_lang';

const updateDOMDirection = (lang: Language) => {
  if (typeof window !== 'undefined') {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
    if (document.body) {
      document.body.setAttribute('dir', dir);
    }
  }
};

const getInitialLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved === 'en' || saved === 'ar') {
      updateDOMDirection(saved);
      return saved;
    }
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]*)`));
    if (match && (match[1] === 'en' || match[1] === 'ar')) {
      const cookieLang = match[1] as Language;
      updateDOMDirection(cookieLang);
      return cookieLang;
    }
  }
  return 'en';
};

const saveLanguage = (lang: Language) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, lang);
    document.cookie = `${COOKIE_KEY}=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    updateDOMDirection(lang);
  }
};

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: getInitialLanguage(),

  setLanguage: (lang: Language) => {
    saveLanguage(lang);
    set({ language: lang });
  },

  toggleLanguage: () => {
    const current = get().language;
    const nextLang: Language = current === 'en' ? 'ar' : 'en';
    saveLanguage(nextLang);
    set({ language: nextLang });
  },
}));
