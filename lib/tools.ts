/**
 * Free tools: public pages that work without an account and run in the browser.
 * Nothing typed into them is stored or sent anywhere.
 */
import type { Lang } from "@/lib/seo";

export const TOOL_SLUGS = ["follow-up-message-generator", "forgotten-client-cost"] as const;
export type ToolSlug = (typeof TOOL_SLUGS)[number];

export type ToolCopy = {
  title: string; // page title, without the site name
  desc: string;
  h1: string;
  intro: string;
  faqTitle: string;
  faq: { q: string; a: string }[];
};

export const TOOLS: Record<ToolSlug, { en: ToolCopy; ro: ToolCopy }> = {
  "follow-up-message-generator": {
    en: {
      title: "Follow-up message generator",
      desc: "Free follow-up message generator: pick a situation, add a name and get a calm, ready-to-edit message in Romanian or English. Nothing is stored or sent.",
      h1: "Follow-up message generator",
      intro:
        "Choose a situation, add a name and get a short, polite message that you can edit and send yourself. It runs in your browser: nothing you type is stored or sent anywhere.",
      faqTitle: "Questions about this tool",
      faq: [
        { q: "Is it free, and do I need an account?", a: "It is free and needs no account." },
        { q: "Does it use AI?", a: "No. The messages are written in advance and only the greeting and your name are filled in. The assistant inside OCTOM One can draft from a contact's details, and it only drafts: it never sends anything." },
        { q: "Can I send the message from this page?", a: "No. Copy it and paste it into your email or chat app. Nothing is sent from here." },
      ],
    },
    ro: {
      title: "Generator de mesaje de follow-up",
      desc: "Generator gratuit de mesaje de follow-up: alegi o situație, adaugi un nume și primești un mesaj calm, gata de editat, în română sau engleză. Nimic nu se salvează.",
      h1: "Generator de mesaje de follow-up",
      intro:
        "Alege o situație, adaugă un nume și primești un mesaj scurt și politicos, pe care îl editezi și îl trimiți tu. Rulează în browserul tău: nimic din ce scrii nu se salvează sau trimite nicăieri.",
      faqTitle: "Întrebări despre acest instrument",
      faq: [
        { q: "Este gratuit și am nevoie de cont?", a: "Este gratuit și nu are nevoie de cont." },
        { q: "Folosește AI?", a: "Nu. Mesajele sunt scrise dinainte, iar doar salutul și numele tău se completează. Asistentul din OCTOM One poate scrie ciorne pornind de la datele unui contact și doar scrie ciorne: nu trimite nimic." },
        { q: "Pot trimite mesajul de pe această pagină?", a: "Nu. Îl copiezi și îl lipești în aplicația ta de email sau de chat. De aici nu se trimite nimic." },
      ],
    },
  },
  "forgotten-client-cost": {
    en: {
      title: "What a forgotten client costs you",
      desc: "Free calculator: enter your own numbers to see roughly what clients who go quiet without a follow-up cost you per month and per year. Runs in your browser.",
      h1: "What does a forgotten client cost you?",
      intro:
        "Enter three numbers from your own business. The calculator multiplies them: it shows what your estimates add up to, not a forecast. Nothing you type leaves your browser.",
      faqTitle: "Questions about this calculator",
      faq: [
        { q: "Where do the numbers come from?", a: "From you. The calculator has no built-in averages. It multiplies the value of a client, how many go quiet each month and the share you think a follow-up would win back." },
        { q: "How should I estimate the share?", a: "Look at the last few clients you did follow up with and how many answered. If you have no data yet, use a small, cautious figure and check it again after a month." },
        { q: "Is the result a promise?", a: "No. It is simple arithmetic on your own estimates. Real results depend on your work, your clients and your messages." },
      ],
    },
    ro: {
      title: "Cât te costă un client uitat",
      desc: "Calculator gratuit: introdu cifrele tale și vezi aproximativ cât te costă clienții care tac fără un follow-up, pe lună și pe an. Rulează în browserul tău.",
      h1: "Cât te costă un client uitat?",
      intro:
        "Introdu trei cifre din afacerea ta. Calculatorul le înmulțește: arată ce rezultă din estimările tale, nu o prognoză. Nimic din ce scrii nu părăsește browserul.",
      faqTitle: "Întrebări despre acest calculator",
      faq: [
        { q: "De unde vin cifrele?", a: "De la tine. Calculatorul nu are medii încorporate. Înmulțește valoarea unui client, câți tac în fiecare lună și cota pe care crezi că un follow-up ar recâștiga-o." },
        { q: "Cum estimez cota?", a: "Uită-te la ultimii câțiva clienți cărora le-ai făcut follow-up și la câți au răspuns. Dacă nu ai încă date, folosește o cifră mică, prudentă, și verific-o din nou peste o lună." },
        { q: "Este rezultatul o promisiune?", a: "Nu. Este o simplă aritmetică pe estimările tale. Rezultatele reale depind de munca ta, de clienți și de mesaje." },
      ],
    },
  },
};

export function isToolSlug(v: string): v is ToolSlug {
  return (TOOL_SLUGS as readonly string[]).includes(v);
}

export function toolCopy(slug: ToolSlug, lang: Lang): ToolCopy {
  return TOOLS[slug][lang];
}

/**
 * Reads a number the way people type it: "1500", "1 500", "1.500,50" and "1,5" are all accepted.
 * Returns null for anything else, including negative numbers.
 */
export function parseAmount(raw: string): number | null {
  let v = raw.trim().replace(/\s+/g, "");
  if (!v || !/^[\d.,]+$/.test(v)) return null;
  const lastComma = v.lastIndexOf(",");
  const lastDot = v.lastIndexOf(".");
  if (lastComma !== -1 && lastDot !== -1) {
    // Both appear: the later one is the decimal mark, the other groups thousands.
    const decimal = lastComma > lastDot ? "," : ".";
    const group = decimal === "," ? "." : ",";
    v = v.split(group).join("").replace(decimal, ".");
  } else if (lastComma !== -1) {
    // A single comma followed by exactly three digits reads as thousands ("1,500"); otherwise decimal.
    v = /^\d{1,3}(,\d{3})+$/.test(v) ? v.split(",").join("") : v.replace(",", ".");
  } else if (lastDot !== -1 && /^\d{1,3}(\.\d{3})+$/.test(v)) {
    v = v.split(".").join("");
  }
  if (!/^\d*\.?\d+$|^\d+\.$/.test(v)) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export const COST_LIMITS = { value: 1_000_000_000, quietPerMonth: 100_000 } as const;

export type CostResult = { perMonth: number; perYear: number; clientsPerYear: number };

/**
 * value x clients that go quiet each month x share a follow-up would win back.
 * Returns null unless all three inputs are valid.
 */
export function forgottenCost(input: { value: number | null; quietPerMonth: number | null; sharePercent: number | null }): CostResult | null {
  const { value, quietPerMonth, sharePercent } = input;
  if (value === null || quietPerMonth === null || sharePercent === null) return null;
  if (value <= 0 || value > COST_LIMITS.value) return null;
  if (quietPerMonth <= 0 || quietPerMonth > COST_LIMITS.quietPerMonth) return null;
  if (sharePercent <= 0 || sharePercent > 100) return null;
  const clientsPerMonth = quietPerMonth * (sharePercent / 100);
  return { perMonth: value * clientsPerMonth, perYear: value * clientsPerMonth * 12, clientsPerYear: clientsPerMonth * 12 };
}
