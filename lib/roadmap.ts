/**
 * The public roadmap. Two honest lists: what has shipped, and what is under discussion.
 * No dates for the second list and no promises. Add an item to "shipped" only once it is live.
 */
export type RoadmapItem = {
  id: string;
  en: { title: string; text: string };
  ro: { title: string; text: string };
};

export type ShippedItem = RoadmapItem & { month: string }; // YYYY-MM

export const SHIPPED: ShippedItem[] = [
  {
    id: "cadences",
    month: "2026-10",
    en: { title: "Cadences", text: "Pick a short series of follow-ups for a common situation. Finishing a step schedules the next one, and you can stop at any time." },
    ro: { title: "Cadențe", text: "Alegi o serie scurtă de follow-up-uri pentru o situație obișnuită. Când termini un pas, următorul se programează, iar tu poți opri oricând." },
  },
  {
    id: "search-undo",
    month: "2026-10",
    en: { title: "Search, shortcuts and Undo", text: "Press Ctrl+K to jump to a page or find a contact. Finishing a follow-up now shows a message with Undo." },
    ro: { title: "Căutare, scurtături și Anulare", text: "Apasă Ctrl+K ca să mergi la o pagină sau să găsești un contact. Când închei un follow-up apare un mesaj cu Anulează." },
  },
  {
    id: "templates",
    month: "2026-10",
    en: { title: "Message templates", text: "Seven ready messages in Romanian and English for common situations. You edit the text and send it yourself from WhatsApp or your email app." },
    ro: { title: "Șabloane de mesaje", text: "Șapte mesaje gata făcute, în română și engleză, pentru situații obișnuite. Editezi textul și îl trimiți tu, din WhatsApp sau din aplicația de email." },
  },
  {
    id: "today",
    month: "2026-10",
    en: { title: "Today", text: "A page that puts the follow-ups due or late in order and shows the reasons behind the order." },
    ro: { title: "Azi", text: "O pagină care ordonează follow-up-urile scadente sau întârziate și arată motivele din spatele ordinii." },
  },
  {
    id: "install",
    month: "2026-10",
    en: { title: "Install on your phone", text: "In Chrome you can install the app and open it from your home screen." },
    ro: { title: "Instalare pe telefon", text: "În Chrome poți instala aplicația și o poți deschide de pe ecranul principal." },
  },
];

export const DISCUSSING: RoadmapItem[] = [
  {
    id: "value",
    en: { title: "Estimated value on a contact", text: "So the Today page can weigh a larger opportunity above a smaller one." },
    ro: { title: "Valoare estimată pe contact", text: "Ca pagina Azi să poată pune o oportunitate mai mare înaintea uneia mai mici." },
  },
  {
    id: "weekly",
    en: { title: "A short weekly recap", text: "What you did this week and who to pick up on Monday." },
    ro: { title: "Un rezumat scurt, săptămânal", text: "Ce ai făcut în săptămâna asta și pe cine reiei luni." },
  },
  {
    id: "gmail",
    en: { title: "Add a contact from Gmail", text: "A way to save someone and set a follow-up without leaving your inbox." },
    ro: { title: "Adaugă un contact din Gmail", text: "O cale de a salva pe cineva și de a seta un follow-up fără să părăsești inbox-ul." },
  },
  {
    id: "phone-reminders",
    en: { title: "Reminders on your phone", text: "A notice when something is due, if you want it." },
    ro: { title: "Notificări pe telefon", text: "O notificare când ceva e scadent, dacă o vrei." },
  },
  {
    id: "proposal-link",
    en: { title: "Share a proposal as a link", text: "And see whether it was opened. This would need a clear notice to the person who receives it." },
    ro: { title: "Trimite o ofertă ca link", text: "Și vezi dacă a fost deschisă. Ar cere o informare clară pentru persoana care îl primește." },
  },
  {
    id: "dark",
    en: { title: "Dark mode", text: "A proper pass over every screen, not a quick colour switch." },
    ro: { title: "Mod întunecat", text: "O trecere atentă peste fiecare ecran, nu doar o schimbare rapidă de culori." },
  },
  {
    id: "self-host",
    en: { title: "A short self-hosting guide", text: "The code is open source (AGPL-3.0). A step-by-step guide would make it easier to run your own copy." },
    ro: { title: "Un ghid scurt de self-hosting", text: "Codul este open source (AGPL-3.0). Un ghid pas cu pas ar face mai ușor să rulezi propria copie." },
  },
];
