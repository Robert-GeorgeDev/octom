# OCTOM — site de prezentare

Site static pentru octom.eu: pagina de lansare OCTOM KYC, formularul listei de lansare și resursele gratuite.

## Structură

- `index.html` — pagina principală, cu formularul de înscriere și testul „Ești obligat?”
- `resurse/checklist-amlr.html` — checklist gratuit (lead magnet), se poate printa ca PDF
- `confidentialitate.html` — politica de confidențialitate pentru newsletter
- `confirmare.html` — pagina afișată după confirmarea emailului
- `assets/config.js` — **singurul fișier de configurat**: adresa endpoint-ului listei și emailul de contact
- `assets/form.js` — trimiterea formularelor și testul interactiv
- `assets/style.css` — stiluri

## Lista de lansare

Formularele trimit înscrierile (JSON: email, prenume, tip_activitate, acord) către `LISTA_ENDPOINT` din `assets/config.js`.
Endpoint-ul va rula pe serverul propriu OCTOM, cu dublă confirmare pe email și evidența acordului.
Cât timp `LISTA_ENDPOINT` e gol, formularul nu trimite nimic și afișează „Înscrierile se deschid în curând”.

## Publicare

Site static, fără build. `vercel.json` dezactivează build-ul Next.js.
