import { useLanguageStore, Language } from '../stores/useLanguageStore';
import en from '../locales/en.json';
import ar from '../locales/ar.json';

const dictionaries: Record<Language, any> = {
  en,
  ar,
};

function getNestedValue(obj: any, path: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = path.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

export function useTranslation() {
  const { language, setLanguage, toggleLanguage } = useLanguageStore();

  const t = (key: string, fallback?: string): string => {
    const dict = dictionaries[language] || en;
    const value = getNestedValue(dict, key);
    if (value !== undefined) return value;

    // Fallback to English dictionary if missing in current language
    if (language !== 'en') {
      const enValue = getNestedValue(en, key);
      if (enValue !== undefined) return enValue;
    }

    return fallback ?? key;
  };

  return {
    t,
    language,
    setLanguage,
    toggleLanguage,
    isArabic: language === 'ar',
    isEnglish: language === 'en',
  };
}
