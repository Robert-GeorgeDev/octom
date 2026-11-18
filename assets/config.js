// Configurare OCTOM — singurul loc unde trebuie modificat ceva.
//
// BREVO_FORM_URL: adresa formularului tău din Brevo.
// Unde o găsești: Brevo → Contacte → Formulare → (formularul tău) → Partajează
// → "Cod HTML". În cod caută <form ... action="https://....sibforms.com/serve/...">
// și copiază aici valoarea din action="...".
//
// Cât timp e gol, formularul afișează un mesaj că înscrierile nu sunt încă deschise.
window.OCTOM_CONFIG = {
  BREVO_FORM_URL: "",
  CONTACT_EMAIL: "contact@octom.eu"
};
