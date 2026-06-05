import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { LANG } from "./strings";
import type { Lang } from "./strings";

interface LanguageValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  /** UI string lookup with zh fallback. */
  t: (key: string) => string;
  /** Localize a data field: returns obj[field+"En"] in English, else obj[field]. */
  tr: (obj: any, field: string) => any;
  /** Inline pick between a zh and en value. */
  L: (zh: any, en: any) => any;
}

const LanguageContext = createContext<LanguageValue | null>(null);

const STORAGE_KEY = "g_lang";

function loadLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "en" ? "en" : "zh";
  } catch {
    return "zh";
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage errors
    }
  }, []);

  const value = useMemo<LanguageValue>(() => {
    const t = (key: string) => (LANG[lang] && LANG[lang][key]) ?? LANG.zh[key] ?? key;
    const tr = (obj: any, field: string) => {
      if (!obj) return obj;
      if (lang === "en") return obj[`${field}En`] ?? obj[field];
      return obj[field];
    };
    const L = (zh: any, en: any) => (lang === "en" ? en : zh);
    return {
      lang,
      setLang,
      toggleLang: () => setLang(lang === "en" ? "zh" : "en"),
      t,
      tr,
      L,
    };
  }, [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// Default (zh) value so components used outside a provider (e.g. in unit tests)
// still render rather than throw.
const DEFAULT_VALUE: LanguageValue = {
  lang: "zh",
  setLang: () => {},
  toggleLang: () => {},
  t: (key: string) => LANG.zh[key] ?? key,
  tr: (obj: any, field: string) => (obj ? obj[field] : obj),
  L: (zh: any) => zh,
};

export function useLanguage(): LanguageValue {
  return useContext(LanguageContext) ?? DEFAULT_VALUE;
}
