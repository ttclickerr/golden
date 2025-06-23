import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations, type Language, languageNames } from './translations';

interface TranslationStore {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useTranslationStore = create<TranslationStore>()(
  persist(
    (set) => ({
      language: 'en', // Default to English
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'translation-storage',
    }
  )
);

export const useTranslation = () => {
  const language = useTranslationStore((state) => state.language);
  
  const t = (key: keyof typeof translations.en) => {
    const translationSet = (translations as any)[language] || translations.en;
    return translationSet[key] || translations.en[key] || key;
  };
  
  return { t, language };
};

export const getLanguageFlag = (language: Language): string => {
  const flagMap: Record<Language, string> = {
    en: '🇺🇸', es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪', it: '🇮🇹', pt: '🇵🇹',
    ru: '🇷🇺', zh: '🇨🇳', ja: '🇯🇵', ko: '🇰🇷', ar: '🇸🇦', hi: '🇮🇳',
    tr: '🇹🇷', pl: '🇵🇱', nl: '🇳🇱', sv: '🇸🇪', da: '🇩🇰', no: '🇳🇴',
    fi: '🇫🇮', cs: '🇨🇿', hu: '🇭🇺', ro: '🇷🇴', bg: '🇧🇬', hr: '🇭🇷',
    sk: '🇸🇰', sl: '🇸🇮', et: '🇪🇪', lv: '🇱🇻', lt: '🇱🇹', uk: '🇺🇦',
    he: '🇮🇱', th: '🇹🇭', vi: '🇻🇳', id: '🇮🇩', ms: '🇲🇾', tl: '🇵🇭'
  };
  return flagMap[language] || '🌐';
};

export const getLanguageName = (language: Language): string => {
  return languageNames[language] || language;
};

export { languageNames };
export type { Language };