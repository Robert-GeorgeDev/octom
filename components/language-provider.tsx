"use client";

import { usePathname, useRouter } from "next/navigation";
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
 * Fixes the language for one page (English at the normal address, Romanian under
 * /ro), so the server sends that language in the HTML. Choosing the other language
 * moves to the same page at the other address.
 */
export function LangScope({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const outer = useContext(LanguageContext);
  const { setLang: setOuter } = outer;

  // Keep everything outside this page (cookie banner, etc.) in the same language.
  useEffect(() => {
    setOuter(lang);
  }, [lang, setOuter]);

  const setLang = useCallback(
    (next: Lang) => {
      setOuter(next);
      if (next === lang) return;
      // Same page in the other language: /privacy <-> /ro/privacy, / <-> /ro.
      const english = pathname === "/ro" ? "/" : pathname.replace(/^\/ro(?=\/)/, "");
      router.push(next === "ro" ? (english === "/" ? "/ro" : `/ro${english}`) : english);
    },
    [lang, pathname, router, setOuter]
  );
  const t = useCallback((key: Key) => dictionaries[lang][key], [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <div lang={lang} style={{ display: "contents" }}>{children}</div>
    </LanguageContext.Provider>
  );
}
