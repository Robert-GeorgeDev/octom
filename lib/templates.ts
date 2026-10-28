/**
 * Message templates for common follow-up situations.
 * Plain, calm wording. Parts the person must complete stay in [square brackets].
 * Nothing here sends anything: the app only fills the text and opens the person's own app.
 */

export type TemplateLang = "ro" | "en";

export const TEMPLATE_IDS = [
  "offer",
  "offer-late",
  "invoice",
  "quiet",
  "meeting",
  "no-answer",
  "feedback",
] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

type Body = { subject: string; text: string };

const T: Record<TemplateId, Record<TemplateLang, Body>> = {
  offer: {
    ro: {
      subject: "Despre oferta trimisă",
      text: "{salut}\n\nRevin scurt cu privire la oferta pe care v-am trimis-o: ați apucat să o priviți? Dacă ceva nu e clar sau vreți să ajustăm bugetul, termenul sau conținutul, spuneți-mi și vedem împreună.\n\nMulțumesc.",
    },
    en: {
      subject: "About the proposal I sent",
      text: "{salut}\n\nA short follow-up on the proposal I sent: have you had a chance to look at it? If something is unclear, or you would like to adjust the budget, timing or scope, tell me and we will go through it together.\n\nThank you.",
    },
  },
  "offer-late": {
    ro: {
      subject: "Oferta promisă",
      text: "{salut}\n\nV-am promis o ofertă și nu v-am trimis-o la timp. Îmi cer scuze pentru întârziere. O primiți până pe [data]. Dacă între timp s-a schimbat ceva la cerințe, spuneți-mi ca să o adaptez.\n\nMulțumesc pentru răbdare.",
    },
    en: {
      subject: "The proposal I promised",
      text: "{salut}\n\nI promised you a proposal and did not send it on time. I am sorry for the delay. You will have it by [date]. If your requirements have changed in the meantime, tell me so I can adjust it.\n\nThank you for your patience.",
    },
  },
  invoice: {
    ro: {
      subject: "Factura [număr factură]",
      text: "{salut}\n\nVă scriu în legătură cu factura [număr factură], în valoare de [suma], cu scadența [data]. Nu am văzut încă plata în cont, poate a trecut neobservată. Dacă ați făcut-o deja, ignorați mesajul și scuzați-mă. Dacă vă trebuie factura din nou sau alte detalii, vi le trimit.\n\nMulțumesc.",
    },
    en: {
      subject: "Invoice [invoice number]",
      text: "{salut}\n\nI am writing about invoice [invoice number] for [amount], due on [date]. I have not seen the payment yet, so it may have slipped through. If you have already paid, please ignore this and excuse me. If you need the invoice again or any other details, I will send them.\n\nThank you.",
    },
  },
  quiet: {
    ro: {
      subject: "Reiau legătura",
      text: "{salut}\n\nAu trecut câteva săptămâni de la ultimul nostru mesaj și nu vreau să insist. Dacă proiectul a fost amânat sau prioritățile s-au schimbat, e în regulă; mi-ar fi de ajutor să știu, ca să nu vă scriu degeaba. Dacă vă interesează în continuare, reluăm de unde am rămas.\n\nMulțumesc.",
    },
    en: {
      subject: "Picking this up again",
      text: "{salut}\n\nA few weeks have passed since our last message and I do not want to push. If the project was postponed or priorities changed, that is fine; it would help me to know, so I do not write for nothing. If you are still interested, we can continue where we left off.\n\nThank you.",
    },
  },
  meeting: {
    ro: {
      subject: "Rezumat după discuția noastră",
      text: "{salut}\n\nVă mulțumesc pentru discuția de azi. Notez ce am stabilit: [puncte stabilite]. Următorul pas: [pasul următor], până pe [data]. Dacă am înțeles ceva greșit, corectați-mă.\n\nMulțumesc.",
    },
    en: {
      subject: "Summary of our conversation",
      text: "{salut}\n\nThank you for talking today. Here is what we agreed: [points agreed]. Next step: [next step], by [date]. If I understood anything wrong, please correct me.\n\nThank you.",
    },
  },
  "no-answer": {
    ro: {
      subject: "Am încercat să vă sun",
      text: "{salut}\n\nAm încercat să vă sun și nu v-am prins. Vă scriu aici ca să răspundeți când vă e comod. Subiectul: [subiect]. Spuneți-mi un interval în care vă pot suna din nou sau răspundeți direct aici.\n\nMulțumesc.",
    },
    en: {
      subject: "I tried to call you",
      text: "{salut}\n\nI tried to call and could not reach you. I am writing here so you can reply when it suits you. The subject: [subject]. Tell me a time when I can call again, or reply directly here.\n\nThank you.",
    },
  },
  feedback: {
    ro: {
      subject: "O părere despre colaborare",
      text: "{salut}\n\nVă mulțumesc pentru colaborare. Dacă aveți un minut, mi-ar fi de folos o părere sinceră despre cum a mers: ce a funcționat și ce aș putea face mai bine. Orice răspuns scurt ajută.\n\nMulțumesc.",
    },
    en: {
      subject: "Your view on working together",
      text: "{salut}\n\nThank you for working with me. If you have a minute, an honest opinion would help: what worked and what I could do better. Any short reply is useful.\n\nThank you.",
    },
  },
};

export function greeting(lang: TemplateLang, firstName: string | null | undefined): string {
  const n = (firstName ?? "").trim();
  if (lang === "ro") return n ? `Bună, ${n},` : "Bună ziua,";
  return n ? `Hi ${n},` : "Hello,";
}

/** The template text with the greeting filled in. Other [bracketed] parts are left for the person. */
export function fillTemplate(
  id: TemplateId,
  lang: TemplateLang,
  contact: { first_name?: string | null }
): Body {
  const b = T[id][lang];
  return { subject: b.subject, text: b.text.replace("{salut}", greeting(lang, contact.first_name)) };
}

/** True while a [bracketed] part has not been completed yet. */
export function hasBlanks(text: string): boolean {
  return /\[[^\]\n]+\]/.test(text);
}
