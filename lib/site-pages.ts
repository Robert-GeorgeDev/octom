// The public information pages. Every one exists in English at /slug and in Romanian at /ro/slug.
import type { Lang } from "@/lib/seo";

export const SITE_SLUGS = [
  "privacy", "terms", "cookies", "refunds", "accessibility", "subprocessors",
  "security", "company", "contact", "docs", "roadmap", "status",
] as const;
export type SiteSlug = (typeof SITE_SLUGS)[number];

type Copy = { title: string; description: string };

export const SITE_PAGES: Record<SiteSlug, { en: Copy; ro: Copy; legal: boolean; noindex?: boolean }> = {
  privacy: {
    legal: true,
    en: { title: "Privacy Policy", description: "How OCTOM One handles personal data: what we collect, why, where it is stored in the EU, how long we keep it and how to use your GDPR rights." },
    ro: { title: "Politica de confidențialitate", description: "Cum tratează OCTOM One datele personale: ce colectăm, de ce, unde sunt stocate în UE, cât timp le păstrăm și cum îți exerciți drepturile GDPR." },
  },
  terms: {
    legal: true,
    en: { title: "Terms and conditions", description: "The terms for using OCTOM One, the simple follow-up CRM: your account, acceptable use, the free beta, liability and how to contact us." },
    ro: { title: "Termeni și condiții", description: "Termenii de utilizare a OCTOM One, CRM-ul simplu pentru follow-up: contul tău, utilizarea acceptabilă, beta gratuit, răspunderea și cum ne contactezi." },
  },
  cookies: {
    legal: true,
    en: { title: "Cookies and browser storage", description: "What OCTOM One stores in your browser, why, and how analytics works only after you agree. We use no advertising cookies." },
    ro: { title: "Cookie-uri și stocare în browser", description: "Ce stochează OCTOM One în browserul tău, de ce, și cum funcționează analytics doar după acordul tău. Nu folosim cookie-uri de publicitate." },
  },
  refunds: {
    legal: true,
    en: { title: "Billing", description: "OCTOM One is free while in beta. How billing, refunds and any future paid plans will work, and that you are never charged without your agreement." },
    ro: { title: "Facturare", description: "OCTOM One este gratuit în beta. Cum vor funcționa facturarea, rambursările și eventualele planuri plătite viitoare, fără taxare fără acordul tău." },
  },
  accessibility: {
    legal: true,
    en: { title: "Accessibility", description: "Our commitment to making OCTOM One usable for everyone: what we support, known limits and how to report an accessibility problem." },
    ro: { title: "Accesibilitate", description: "Angajamentul nostru ca OCTOM One să poată fi folosit de toți: ce susținem, limite cunoscute și cum raportezi o problemă de accesibilitate." },
  },
  subprocessors: {
    legal: true,
    en: { title: "Subprocessors", description: "The providers that process data for OCTOM One (hosting, database, email, AI), what each does and where." },
    ro: { title: "Subprocesatori", description: "Furnizorii care prelucrează date pentru OCTOM One (găzduire, bază de date, email, AI), ce face fiecare și unde." },
  },
  security: {
    legal: true,
    en: { title: "Security", description: "How OCTOM One protects your data: EU storage, isolated workspaces, encryption in transit, access controls and how to report a vulnerability." },
    ro: { title: "Securitate", description: "Cum îți protejează OCTOM One datele: stocare în UE, spații de lucru izolate, criptare în tranzit, controlul accesului și cum raportezi o vulnerabilitate." },
  },
  company: {
    legal: true,
    en: { title: "Company details", description: "Who is behind OCTOM One: company details, registered address and contact information." },
    ro: { title: "Date despre companie", description: "Cine este în spatele OCTOM One: datele societății, sediul social și informații de contact." },
  },
  contact: {
    legal: false,
    en: { title: "Contact", description: "Write to the OCTOM One team: report a bug, suggest a feature or ask a question. Early feedback can earn a free month of Business." },
    ro: { title: "Contact", description: "Scrie echipei OCTOM One: raportează un bug, propune o funcție sau pune o întrebare. Feedback-ul timpuriu poate aduce o lună gratuită de Business." },
  },
  docs: {
    legal: false,
    en: { title: "Documentation", description: "How to use OCTOM One: follow-ups, contacts, pipeline, CSV import and export, team workspace, the AI assistant and your account." },
    ro: { title: "Documentație", description: "Cum folosești OCTOM One: follow-up-uri, contacte, pipeline, import și export CSV, spațiul de echipă, asistentul AI și contul tău." },
  },
  roadmap: {
    legal: false,
    en: { title: "Roadmap", description: "What OCTOM One shipped recently and what is under discussion, with no dates and no promises. Tell us what would help you most." },
    ro: { title: "Roadmap", description: "Ce a livrat OCTOM One recent și ce se discută, fără date și fără promisiuni. Spune-ne ce te-ar ajuta cel mai mult." },
  },
  status: {
    legal: false,
    noindex: true,
    en: { title: "Status", description: "Live availability of the OCTOM One website, app and database." },
    ro: { title: "Status", description: "Disponibilitatea în timp real a site-ului, aplicației și bazei de date OCTOM One." },
  },
};
