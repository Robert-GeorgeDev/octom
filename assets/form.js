// Trimite formularele de newsletter către Brevo (dublă confirmare activată în Brevo).
(function () {
  var cfg = window.OCTOM_CONFIG || {};

  function setMsg(form, text, kind) {
    var el = form.querySelector(".form-msg");
    if (!el) return;
    el.textContent = text;
    el.className = "form-msg" + (kind ? " " + kind : "");
  }

  function valid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  document.querySelectorAll("form.signup").forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var email = (form.EMAIL.value || "").trim();
      var consent = form.querySelector("input[name=OPT_IN]");

      if (!valid(email)) { setMsg(form, "Scrie o adresă de email validă.", "err"); form.EMAIL.focus(); return; }
      if (consent && !consent.checked) { setMsg(form, "Bifează acordul ca să te putem înscrie.", "err"); consent.focus(); return; }
      if (form.email_address_check && form.email_address_check.value) { return; }

      if (!cfg.BREVO_FORM_URL) {
        setMsg(form, "Înscrierile se deschid în curând. Revino peste câteva zile.", "err");
        return;
      }

      var btn = form.querySelector("button[type=submit]");
      if (btn) { btn.disabled = true; btn.textContent = "Se trimite…"; }

      var data = new FormData(form);
      data.set("EMAIL", email);
      data.set("locale", "ro");

      fetch(cfg.BREVO_FORM_URL, { method: "POST", body: data, mode: "no-cors" })
        .then(function () {
          form.reset();
          setMsg(form, "Mulțumim! Ți-am trimis un email de confirmare. Apasă linkul din el ca să finalizezi înscrierea.", "ok");
          if (window.plausible) { try { window.plausible("Newsletter"); } catch (e) {} }
        })
        .catch(function () {
          setMsg(form, "Nu am putut trimite acum. Încearcă din nou peste un minut.", "err");
        })
        .finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = btn.getAttribute("data-label") || "Înscrie-mă"; }
        });
    });
  });

  // Mini-test: "Ești obligat să aplici Legea 129/2019?"
  var quiz = document.getElementById("quiz");
  if (quiz) {
    var answers = {};
    quiz.querySelectorAll(".opts button").forEach(function (b) {
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () {
        var q = b.getAttribute("data-q");
        answers[q] = b.getAttribute("data-v");
        quiz.querySelectorAll('.opts button[data-q="' + q + '"]').forEach(function (x) {
          x.setAttribute("aria-pressed", x === b ? "true" : "false");
        });
        render();
      });
    });

    function render() {
      var out = quiz.querySelector(".result");
      if (!answers.activ) { out.innerHTML = ""; return; }
      var html;
      if (answers.activ === "altceva") {
        html = '<div class="card"><strong>Probabil nu ești entitate raportoare ca agent imobiliar.</strong><p class="muted">Lista completă e în art. 5 din Legea 129/2019: contabili, evaluatori, consultanți fiscali, notari, avocați (pentru anumite operațiuni), comercianți care încasează numerar de cel puțin 10.000 EUR și alții. Verifică dacă intri în una dintre categorii.</p></div>';
      } else if (answers.activ === "inchiriere" && answers.chirie === "sub") {
        html = '<div class="card"><strong>Pentru închirierile sub 10.000 EUR pe lună, legea nu se aplică.</strong><p class="muted">Dacă intermediezi și vânzări sau chirii de cel puțin 10.000 EUR pe lună, ești entitate raportoare pentru acele tranzacții.</p></div>';
      } else if (answers.activ === "inchiriere" && !answers.chirie) {
        out.innerHTML = '<p class="muted">Răspunde și la întrebarea despre chirie.</p>';
        return;
      } else {
        html = '<div class="card"><strong>Da, ești entitate raportoare (art. 5 alin. 1 lit. h).</strong><ul>' +
          '<li>Aplici măsurile de cunoaștere a clientelei pentru <b>ambele părți</b> ale tranzacției (art. 11 alin. 10).</li>' +
          '<li>Verifici beneficiarul real, persoanele expuse politic și listele de sancțiuni.</li>' +
          '<li>Raportezi la ONPCSB plățile în numerar de cel puțin 10.000 EUR, în 3 zile lucrătoare.</li>' +
          '<li>Păstrezi dovezile 5 ani.</li>' +
          (answers.notif === "nu" ? '<li><b>Ai 15 zile de la începerea activității să depui notificarea la ONPCSB</b> (art. 30²). Lipsa ei se amendează cu 5.000–10.000 lei.</li>' : "") +
          '</ul><p><a class="btn" href="resurse/checklist-amlr.html">Vezi checklistul complet, gratuit</a></p></div>';
      }
      out.innerHTML = html;
    }
  }
})();
