/**
 * Example data and rules for the public demo (/demo). Everything lives in the visitor's browser:
 * nothing is saved or sent. The names are made up. The ordering reuses the real rules from lib/priority.ts.
 */
import { addDays } from "@/lib/dates";
import { nextStep, type CadenceId } from "@/lib/cadences";
import type { TemplateId } from "@/lib/templates";
import type { Priority } from "@/types/followup";

export type DemoItem = {
  id: string; // "<contact>:<step>", unique per follow-up
  contact: string;
  firstName: string;
  name: string;
  company: string;
  contactStatus: string;
  due_date: string;
  due_time: string;
  priority: Priority;
  quietDays: number;
  cadence?: CadenceId;
  step?: number;
  template: TemplateId;
};

/** Six made-up follow-ups, dated relative to `today` (YYYY-MM-DD). */
export function demoItems(today: string): DemoItem[] {
  const base = {
    due_time: "",
  };
  return [
    { ...base, id: "maria:2", contact: "maria", firstName: "Maria", name: "Maria Ionescu", company: "Bright Agency", contactStatus: "Proposal Sent", due_date: addDays(today, -3), priority: "High", quietDays: 9, cadence: "offer", step: 2, template: "offer" },
    { ...base, id: "andrei:0", contact: "andrei", firstName: "Andrei", name: "Andrei Pop", company: "Studio Nord", contactStatus: "Negotiation", due_date: today, priority: "Normal", quietDays: 5, template: "meeting" },
    { ...base, id: "elena:1", contact: "elena", firstName: "Elena", name: "Elena Dumitru", company: "Dumitru Consulting", contactStatus: "Contacted", due_date: addDays(today, -1), priority: "Normal", quietDays: 20, cadence: "invoice", step: 1, template: "invoice" },
    { ...base, id: "radu:0", contact: "radu", firstName: "Radu", name: "Radu Stan", company: "Lumen Foto", contactStatus: "New", due_date: today, priority: "Low", quietDays: 2, template: "no-answer" },
    { ...base, id: "tudor:0", contact: "tudor", firstName: "Tudor", name: "Tudor Marin", company: "Marin Studio", contactStatus: "Won", due_date: today, priority: "Normal", quietDays: 30, template: "feedback" },
    { ...base, id: "ioana:0", contact: "ioana", firstName: "Ioana", name: "Ioana Vasile", company: "Vasile & Co", contactStatus: "Contacted", due_date: addDays(today, 5), priority: "Normal", quietDays: 4, template: "quiet" },
  ];
}

export type CompleteOutcome = { items: DemoItem[]; next?: DemoItem; gapDays?: number };

/** Finishing a step removes it and, for a cadence, adds the next step counted from today. */
export function completeDemo(items: DemoItem[], id: string, today: string): CompleteOutcome | null {
  const item = items.find((i) => i.id === id);
  if (!item) return null;
  const rest = items.filter((i) => i.id !== id);
  if (item.cadence && item.step !== undefined) {
    const n = nextStep(item.cadence, item.step);
    if (n) {
      const next: DemoItem = { ...item, id: `${item.contact}:${n.step}`, step: n.step, due_date: addDays(today, n.gapDays), quietDays: 0 };
      return { items: [...rest, next], next, gapDays: n.gapDays };
    }
  }
  return { items: rest };
}

/** Moves a follow-up to tomorrow. */
export function snoozeDemo(items: DemoItem[], id: string, today: string): DemoItem[] {
  return items.map((i) => (i.id === id ? { ...i, due_date: addDays(today, 1) } : i));
}

export type DemoCopy = {
  title: string; // page title, without the site name
  desc: string;
  h1: string;
  intro: string;
  faqTitle: string;
  faq: { q: string; a: string }[];
};

export const DEMO_COPY: { en: DemoCopy; ro: DemoCopy } = {
  en: {
    title: "Try OCTOM One without an account",
    desc: "Try a working copy of OCTOM One on example data: see who to contact today, finish a follow-up and open a message to start from. No account, nothing saved.",
    h1: "Try OCTOM One without an account",
    intro:
      "This is the Today page on made-up contacts. Finish a follow-up, snooze one, undo, and open a message to start from. It all stays in your browser.",
    faqTitle: "Questions about the demo",
    faq: [
      { q: "Is this my data?", a: "No. The contacts are made up, and the page keeps them in your browser only. Nothing is saved or sent, and a reload starts over." },
      { q: "Does it work like the real app?", a: "The order, the reasons, cadences, Undo and the messages to start from use the same rules as the app. The app adds your own contacts, the contact page, the pipeline, CSV import and export, and a shared workspace." },
      { q: "How do I try it with my own contacts?", a: "Create a free account, then add contacts or import a CSV file. OCTOM One is free during beta and needs no card." },
    ],
  },
  ro: {
    title: "Încearcă OCTOM One fără cont",
    desc: "Încearcă o copie funcțională OCTOM One pe date-exemplu: vezi cui să scrii azi, închei un follow-up și deschizi un mesaj de pornire. Fără cont, nimic salvat.",
    h1: "Încearcă OCTOM One fără cont",
    intro:
      "Aceasta este pagina Azi, pe contacte inventate. Încheie un follow-up, amână unul, anulează și deschide un mesaj de la care să pornești. Totul rămâne în browserul tău.",
    faqTitle: "Întrebări despre demo",
    faq: [
      { q: "Sunt datele mele?", a: "Nu. Contactele sunt inventate, iar pagina le ține doar în browserul tău. Nimic nu se salvează sau trimite, iar la reîncărcare se pornește de la zero." },
      { q: "Funcționează ca aplicația reală?", a: "Ordinea, motivele, cadențele, Anularea și mesajele de pornire folosesc aceleași reguli ca aplicația. Aplicația adaugă contactele tale, pagina contactului, pipeline-ul, importul și exportul CSV și un spațiu de lucru comun." },
      { q: "Cum încerc cu propriile contacte?", a: "Creează un cont gratuit, apoi adaugă contacte sau importă un fișier CSV. OCTOM One este gratuit în beta și nu cere card." },
    ],
  },
};
