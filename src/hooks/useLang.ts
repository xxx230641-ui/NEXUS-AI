import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export type Language = 'ar' | 'en';

export function useLang() {
  const { i18n } = useTranslation();

  const [lang, setLangState] = useState<Language>(() => {
    const active = i18n.language || (typeof window !== 'undefined' ? localStorage.getItem('nexus_lang') : 'ar');
    return active.startsWith('en') ? 'en' : 'ar';
  });

  useEffect(() => {
    const syncLang = (lng: string) => {
      const formatted: Language = lng.startsWith('en') ? 'en' : 'ar';
      setLangState(formatted);
      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        // Keep direction fixed to 'rtl' as requested so toggling language does NOT shift layout from right-to-left to left-to-right
        root.dir = 'rtl';
        root.lang = formatted;
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('nexus_lang', formatted);
      }
    };

    // Sync on mount
    syncLang(i18n.language || 'ar');

    i18n.on('languageChanged', syncLang);
    return () => {
      i18n.off('languageChanged', syncLang);
    };
  }, [i18n]);

  const toggleLang = () => {
    const nextLang: Language = lang === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
  };

  const setLang = (newLang: Language) => {
    i18n.changeLanguage(newLang);
  };

  return { lang, toggleLang, setLang, isRTL: true };
}

