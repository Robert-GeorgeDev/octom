// First-minute help on the dashboard: getting started card and example data.
export const enStart = {
  "start.title": "Start in one minute",
  "start.text": "Add your first contact and schedule when to follow up. Or look around first with a few example contacts you can remove with one click.",
  "start.add": "Add my first contact",
  "start.examples": "Try with examples",
  "start.adding": "Adding…",
  "start.error": "Could not add the examples. Please try again.",
  "start.banner": "You are looking at example contacts.",
  "start.remove": "Remove examples",
  "start.removing": "Removing…",
  "start.removeError": "Could not remove the examples. Please try again.",
} as const;

export const roStart: Record<keyof typeof enStart, string> = {
  "start.title": "Începe într-un minut",
  "start.text": "Adaugă primul contact și programează când revii. Sau uită-te mai întâi în jur cu câteva contacte de exemplu, pe care le ștergi dintr-un click.",
  "start.add": "Adaugă primul contact",
  "start.examples": "Încearcă cu exemple",
  "start.adding": "Se adaugă…",
  "start.error": "Nu am putut adăuga exemplele. Încearcă din nou.",
  "start.banner": "Vezi contacte de exemplu.",
  "start.remove": "Șterge exemplele",
  "start.removing": "Se șterge…",
  "start.removeError": "Nu am putut șterge exemplele. Încearcă din nou.",
};
