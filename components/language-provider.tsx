"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { dictionaries, type Key, type Lang } from "@/lib/dictionaries";

type LanguageState = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: Key) => string;
};

const LanguageContext = createContext<LanguageState>({
  lang: "en",
  setLang: () => {},
  t: (key) => dictionaries.en[key],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("orbito-lang");
      if (saved === "en" || saved === "ro") {
        setLangState(saved);
      }
    } catch {
      // storage unavailable: keep the default language
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem("orbito-lang", next);
    } catch {
      // ignore
    }
    try {
      // Read by proxy.ts so the home page opens in the chosen language.
      document.cookie = `octom-lang=${next}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback((key: Key) => dictionaries[lang][key], [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/**
 * Fixes the language for one page (the home page at "/" is English, "/ro" is
 * Romanian), so the server sends that language in the HTML. Choosing the other
 * language moves to the other address.
 */
export function LangScope({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const router = useRouter();
  const outer = useContext(LanguageContext);
  const { setLang: setOuter } = outer;

  // Keep everything outside this page (cookie banner, etc.) in the same language.
  useEffect(() => {
    setOuter(lang);
  }, [lang, setOuter]);

  const setLang = useCallback(
    (next: Lang) => {
      setOuter(next);
      if (next !== lang) router.push(next === "ro" ? "/ro" : "/");
    },
    [lang, router, setOuter]
  );
  const t = useCallback((key: Key) => dictionaries[lang][key], [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <div lang={lang} style={{ display: "contents" }}>{children}</div>
    </LanguageContext.Provider>
  );
}
