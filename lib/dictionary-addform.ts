// Add-contact form: sections, follow-up shortcuts.
export const enAddForm = {
  "add.sec.who": "Who",
  "add.sec.reach": "How to reach",
  "add.sec.about": "About",
  "add.sec.next": "Next step",
  "add.followUpOn": "Follow up on",
  "add.followUpNote": "What to say or do",
  "add.followUpHint": "Optional. It shows up on your dashboard on that day.",
  "add.tomorrow": "Tomorrow",
  "add.in3": "In 3 days",
  "add.nextWeek": "Next week",
  "add.noDate": "No date",
  "add.savedPartial": "The contact was saved, but the follow-up could not be added. You can add it from the contact page.",
  "add.close": "Close",
} as const;

export const roAddForm: Record<keyof typeof enAddForm, string> = {
  "add.sec.who": "Cine",
  "add.sec.reach": "Cum îl contactezi",
  "add.sec.about": "Despre",
  "add.sec.next": "Următorul pas",
  "add.followUpOn": "Revino pe",
  "add.followUpNote": "Ce să spui sau să faci",
  "add.followUpHint": "Opțional. Apare pe dashboard în ziua respectivă.",
  "add.tomorrow": "Mâine",
  "add.in3": "Peste 3 zile",
  "add.nextWeek": "Săptămâna viitoare",
  "add.noDate": "Fără dată",
  "add.savedPartial": "Contactul a fost salvat, dar follow-up-ul nu a putut fi adăugat. Îl poți adăuga din pagina contactului.",
  "add.close": "Închide",
};
