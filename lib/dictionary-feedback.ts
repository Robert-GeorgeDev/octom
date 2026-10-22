// In-app feedback button and window.
export const enFeedback = {
  "fb.button": "Feedback",
  "fb.title": "Send feedback",
  "fb.message": "Your message",
  "fb.placeholder": "What happened, or what would you like to see?",
  "fb.note": "We read every message and reply to your account email.",
  "fb.send": "Send",
  "fb.sending": "Sending…",
  "fb.thanks": "Thank you! We got your message.",
  "fb.error": "Could not send. Please try again in a moment.",
  "fb.close": "Close",
} as const;

export const roFeedback: Record<keyof typeof enFeedback, string> = {
  "fb.button": "Feedback",
  "fb.title": "Trimite feedback",
  "fb.message": "Mesajul tău",
  "fb.placeholder": "Ce s-a întâmplat sau ce ți-ar plăcea să vezi?",
  "fb.note": "Citim fiecare mesaj și răspundem pe emailul contului tău.",
  "fb.send": "Trimite",
  "fb.sending": "Se trimite…",
  "fb.thanks": "Mulțumim! Am primit mesajul tău.",
  "fb.error": "Nu am putut trimite. Încearcă din nou peste puțin.",
  "fb.close": "Închide",
};
