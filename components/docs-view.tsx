"use client";

import Link from "next/link";
import SitePage from "@/components/site-page";
import { useLanguage } from "@/components/language-provider";

type Section = { id: string; en: string; ro: string; bodyEn: React.ReactNode; bodyRo: React.ReactNode };

const STATUS_LIST = "New, Contacted, Qualified, Proposal Sent, Negotiation, Won, Lost";

const SECTIONS: Section[] = [
  {
    id: "start",
    en: "Getting started",
    ro: "Primii pași",
    bodyEn: (
      <>
        <p>OCTOM One is a simple follow-up CRM: it shows you who to contact today, and nothing else gets in the way.</p>
        <ol>
          <li>Create an account at <a href="https://one.octom.eu/signup">one.octom.eu</a> and confirm your email.</li>
          <li>Add your first contact, or import a CSV file.</li>
          <li>Give each contact a next follow-up date.</li>
          <li>Open the dashboard every morning and clear what is due.</li>
        </ol>
      </>
    ),
    bodyRo: (
      <>
        <p>OCTOM One este un CRM simplu, construit în jurul follow-up-urilor: îți arată pe cine contactezi azi, fără alte complicații.</p>
        <ol>
          <li>Creează un cont pe <a href="https://one.octom.eu/signup">one.octom.eu</a> și confirmă emailul.</li>
          <li>Adaugă primul contact sau importă un fișier CSV.</li>
          <li>Stabilește data următorului follow-up pentru fiecare contact.</li>
          <li>Deschide panoul în fiecare dimineață și rezolvă ce e scadent.</li>
        </ol>
      </>
    ),
  },
  {
    id: "followups",
    en: "Follow-ups",
    ro: "Follow-up-uri",
    bodyEn: (
      <>
        <p>The dashboard groups follow-ups into <strong>Overdue</strong>, <strong>Today</strong> and <strong>Upcoming</strong>. On each one you can:</p>
        <ul>
          <li><strong>Done</strong>: mark it as finished.</li>
          <li><strong>Snooze</strong>: move it to another day.</li>
          <li><strong>Delete</strong>: remove it.</li>
        </ul>
        <p>The counters at the top show overdue follow-ups, follow-ups due today, open leads and deals won this month.</p>
      </>
    ),
    bodyRo: (
      <>
        <p>Panoul grupează follow-up-urile în <strong>Întârziate</strong>, <strong>Azi</strong> și <strong>Viitoare</strong>. Pe fiecare poți:</p>
        <ul>
          <li><strong>Finalizează</strong>: îl marchezi ca rezolvat.</li>
          <li><strong>Amână</strong>: îl muți pe altă zi.</li>
          <li><strong>Șterge</strong>: îl elimini.</li>
        </ul>
        <p>Cifrele de sus arată follow-up-urile întârziate, cele scadente azi, lead-urile deschise și deal-urile câștigate luna aceasta.</p>
      </>
    ),
  },
  {
    id: "contacts",
    en: "Contacts and pipeline",
    ro: "Contacte și pipeline",
    bodyEn: (
      <>
        <p>Each contact has a name, company, email, phone, notes and a status. The available statuses are: {STATUS_LIST}.</p>
        <p>The Pipeline page shows contacts as columns by status. The dashboard shows a short preview of it.</p>
      </>
    ),
    bodyRo: (
      <>
        <p>Fiecare contact are nume, companie, email, telefon, notițe și un status. Statusurile disponibile sunt: {STATUS_LIST}.</p>
        <p>Pagina Pipeline arată contactele pe coloane, după status. Panoul afișează o scurtă previzualizare.</p>
      </>
    ),
  },
  {
    id: "import",
    en: "Import and export",
    ro: "Import și export",
    bodyEn: (
      <>
        <p>On the Import &amp; export page you can upload a CSV file (UTF-8, with a header row, up to 500 rows and 1 MB). Only <code>first_name</code> is required.</p>
        <p>Columns: <code>first_name, last_name, company, email, phone, status, notes, next_followup</code> (date as YYYY-MM-DD). Download the template from the same page, check the preview, then import. Rows with errors are skipped and listed.</p>
        <p>You can also export your follow-ups and activity as CSV.</p>
      </>
    ),
    bodyRo: (
      <>
        <p>Pe pagina Import și export poți încărca un fișier CSV (UTF-8, cu rând de antet, maximum 500 de rânduri și 1 MB). Doar <code>first_name</code> este obligatoriu.</p>
        <p>Coloane: <code>first_name, last_name, company, email, phone, status, notes, next_followup</code> (data în format AAAA-LL-ZZ). Descarcă șablonul de pe aceeași pagină, verifică previzualizarea, apoi importă. Rândurile cu erori sunt sărite și afișate într-o listă.</p>
        <p>Poți exporta și follow-up-urile și activitatea în format CSV.</p>
      </>
    ),
  },
  {
    id: "assistant",
    en: "AI assistant",
    ro: "Asistentul AI",
    bodyEn: (
      <p>The assistant helps you write messages, reply to leads and plan follow-ups. It only prepares drafts: nothing is sent on your behalf. Review every text before you use it.</p>
    ),
    bodyRo: (
      <p>Asistentul te ajută să scrii mesaje, să răspunzi la lead-uri și să planifici follow-up-uri. El pregătește doar ciorne: nimic nu se trimite în numele tău. Citește fiecare text înainte să-l folosești.</p>
    ),
  },
  {
    id: "team",
    en: "Team",
    ro: "Echipă",
    bodyEn: (
      <p>On the Team page you can invite colleagues to your workspace. On the dashboard, “Mine” shows follow-ups assigned to you and “All” shows the whole team’s.</p>
    ),
    bodyRo: (
      <p>Pe pagina Echipă îți poți invita colegii în spațiul de lucru. Pe panou, „Ale mele” arată follow-up-urile atribuite ție, iar „Toți” pe cele ale întregii echipe.</p>
    ),
  },
  {
    id: "plans",
    en: "Plans and limits",
    ro: "Planuri și limite",
    bodyEn: (
      <p>The free plan includes up to 10 contacts and 10 active follow-ups. See the <Link href="/#pricing">pricing section</Link> for paid plans. Billing and refund terms are on the <Link href="/refunds">Billing &amp; refunds</Link> page.</p>
    ),
    bodyRo: (
      <p>Planul gratuit include până la 10 contacte și 10 follow-up-uri active. Planurile plătite sunt în <Link href="/#pricing">secțiunea de prețuri</Link>. Condițiile de facturare și rambursare sunt pe pagina <Link href="/refunds">Facturare și rambursări</Link>.</p>
    ),
  },
  {
    id: "account",
    en: "Account and data",
    ro: "Cont și date",
    bodyEn: (
      <p>You manage your account, language and email preferences from the Account page, where you can also delete your account. How we handle your data is described in the <Link href="/privacy">Privacy Policy</Link> and on the <Link href="/security">Security</Link> page.</p>
    ),
    bodyRo: (
      <p>Îți gestionezi contul, limba și preferințele de email din pagina Cont, unde îți poți și șterge contul. Cum tratăm datele tale este descris în <Link href="/privacy">Politica de confidențialitate</Link> și pe pagina <Link href="/security">Securitate</Link>.</p>
    ),
  },
  {
    id: "help",
    en: "Need help?",
    ro: "Ai nevoie de ajutor?",
    bodyEn: (
      <p>Check the <Link href="/status">status page</Link> first, then write to us through the <Link href="/contact">contact page</Link> and we will reply by email.</p>
    ),
    bodyRo: (
      <p>Verifică mai întâi <Link href="/status">pagina de status</Link>, apoi scrie-ne prin <Link href="/contact">pagina de contact</Link> și îți răspundem pe email.</p>
    ),
  },
];

export default function DocsView() {
  const { lang } = useLanguage();
  const ro = lang === "ro";
  return (
    <SitePage
      title="Documentation"
      titleRo="Documentație"
      intro="Everything you need to use OCTOM One, in a few short pages."
      introRo="Tot ce ai nevoie ca să folosești OCTOM One, pe scurt."
    >
      <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <nav aria-label={ro ? "Pe această pagină" : "On this page"} className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 hover:border-brand hover:text-brand lg:rounded-lg lg:border-0 lg:bg-transparent lg:px-2 lg:py-1.5"
              >
                {ro ? s.ro : s.en}
              </a>
            ))}
          </nav>
        </aside>
        <div className="max-w-[68ch] text-[15px] leading-7 text-slate-700 [&_a]:font-semibold [&_a]:text-brand [&_a]:underline-offset-2 hover:[&_a]:underline [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px] [&_li]:mt-1.5 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mt-3 [&_strong]:text-ink [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-8 border-t border-line pt-8 first:border-t-0 first:pt-0 [&:not(:first-child)]:mt-10">
              <h2 className="text-xl font-semibold tracking-tight text-ink">{ro ? s.ro : s.en}</h2>
              {ro ? s.bodyRo : s.bodyEn}
            </section>
          ))}
        </div>
      </div>
    </SitePage>
  );
}
