# OCTOM — site de prezentare

Site static pentru octom.eu: pagina de lansare OCTOM KYC, formularul de newsletter și resursele gratuite.

## Structură

- `index.html` — pagina principală, cu formularul de înscriere și testul „Ești obligat?”
- `resurse/checklist-amlr.html` — checklist gratuit (lead magnet), se poate printa ca PDF
- `confidentialitate.html` — politica de confidențialitate pentru newsletter
- `confirmare.html` — pagina afișată după confirmarea emailului (setată ca redirect în Brevo)
- `assets/config.js` — **singurul fișier de configurat**: adresa formularului Brevo și emailul de contact
- `assets/form.js` — trimiterea formularelor și testul interactiv
- `assets/style.css` — stiluri

## Configurare Brevo (o singură dată)

1. Creează cont gratuit pe brevo.com.
2. Contacte → Atribute: adaugă atributul `TIP_ACTIVITATE` (tip Text).
3. Contacte → Formulare → Creează formular de înscriere:
   - câmpuri: EMAIL, FIRSTNAME, TIP_ACTIVITATE;
   - activează **dubla confirmare** (double opt-in);
   - pune ca pagină de redirect după confirmare: `https://octom.eu/confirmare.html`.
4. Partajează → Cod HTML: copiază adresa din `action="https://….sibforms.com/serve/…"`.
5. Lipește adresa în `assets/config.js`, la `BREVO_FORM_URL`.

## Publicare

Site static, fără build. `vercel.json` dezactivează build-ul Next.js.
