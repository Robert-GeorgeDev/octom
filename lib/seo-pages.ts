// Landing pages for specific audiences, at /for/<slug> (English) and /ro/for/<slug> (Romanian).
// Only statements that are true of the product today.

export type SeoContent = {
  title: string; // page title, without the site name
  desc: string;
  h1: string;
  intro: string;
  problemsTitle: string;
  problems: string[];
  pointsTitle: string;
  points: { t: string; d: string }[];
  stepsTitle: string;
  steps: string[];
  faqTitle: string;
  faq: { q: string; a: string }[];
};

export type SeoPage = { slug: string; en: SeoContent; ro: SeoContent };

export const PAGES: SeoPage[] = [
  {
    slug: "freelancers",
    en: {
      title: "A simple CRM for freelancers",
      desc: "OCTOM One shows freelancers who to contact today, so no lead or client goes quiet. Simple follow-ups, no sales suite. Free during beta.",
      h1: "A simple CRM for freelancers",
      intro:
        "Most freelance work comes from people you already talked to. OCTOM One keeps track of them and tells you who is due for a message today.",
      problemsTitle: "What usually goes wrong",
      problems: [
        "A lead goes quiet because nothing reminded you to write back.",
        "Contacts are scattered across email, chat apps and a spreadsheet.",
        "Follow-ups slip when you are busy with client work.",
      ],
      pointsTitle: "How OCTOM One helps",
      points: [
        { t: "One list for today", d: "Open the app and see who needs a reply, a check-in or a reminder." },
        { t: "Drafts when you need them", d: "Get a first version of the message and edit it in your own words. The assistant never sends anything." },
        { t: "Import what you have", d: "Bring contacts from a spreadsheet with a CSV file and check the preview first." },
      ],
      stepsTitle: "Start in a few minutes",
      steps: [
        "Add a contact, or import a CSV file.",
        "Set the next follow-up date when a conversation ends.",
        "Open OCTOM One in the morning: today's list is ready.",
      ],
      faqTitle: "Questions freelancers ask",
      faq: [
        { q: "Is OCTOM One free for freelancers?", a: "Yes. It is free while it is in beta, with unlimited contacts and follow-ups and no card needed. If paid plans come later, you will be told well in advance." },
        { q: "Do I need to connect my email?", a: "No. You can generate a message, copy it or open it in your email app. OCTOM One never sends anything for you." },
        { q: "Can I move my spreadsheet in?", a: "Yes. Import a CSV file, check the preview and fix any errors before anything is saved." },
      ],
    },
    ro: {
      title: "Un CRM simplu pentru freelanceri",
      desc: "OCTOM One le arată freelancerilor pe cine să contacteze azi, ca niciun lead sau client să nu rămână în uitare. Follow-up simplu, fără suită de vânzări. Gratuit în beta.",
      h1: "Un CRM simplu pentru freelanceri",
      intro:
        "Cea mai mare parte a muncii de freelancer vine de la oameni cu care ai vorbit deja. OCTOM One îi ține evidența și îți spune cui ai de scris azi.",
      problemsTitle: "Ce merge de obicei prost",
      problems: [
        "Un lead tace pentru că nimic nu ți-a amintit să revii.",
        "Contactele sunt împrăștiate între email, aplicații de chat și un tabel.",
        "Follow-up-urile alunecă atunci când ești ocupat cu proiectele clienților.",
      ],
      pointsTitle: "Cum te ajută OCTOM One",
      points: [
        { t: "O listă pentru azi", d: "Deschizi aplicația și vezi cui trebuie să răspunzi, cu cine să iei legătura sau ce să reamintești." },
        { t: "Ciorne când ai nevoie", d: "Primești o primă variantă de mesaj și o modifici cu vorbele tale. Asistentul nu trimite nimic." },
        { t: "Importă ce ai deja", d: "Adu contactele dintr-un tabel cu un fișier CSV și verifică mai întâi previzualizarea." },
      ],
      stepsTitle: "Începi în câteva minute",
      steps: [
        "Adaugă un contact sau importă un fișier CSV.",
        "Setează data următorului follow-up când se termină o conversație.",
        "Dimineața deschizi OCTOM One: lista de azi e gata.",
      ],
      faqTitle: "Întrebări frecvente ale freelancerilor",
      faq: [
        { q: "Este OCTOM One gratuit pentru freelanceri?", a: "Da. Este gratuit cât timp este în beta, cu contacte și follow-up-uri nelimitate și fără card. Dacă vor veni planuri plătite, vei fi anunțat din timp." },
        { q: "Trebuie să îmi conectez emailul?", a: "Nu. Poți genera un mesaj, îl copiezi sau îl deschizi în aplicația ta de email. OCTOM One nu trimite nimic în locul tău." },
        { q: "Pot să mut tabelul meu în aplicație?", a: "Da. Importă un fișier CSV, verifică previzualizarea și corectează erorile înainte să se salveze ceva." },
      ],
    },
  },
  {
    slug: "agencies",
    en: {
      title: "A lightweight CRM for small agencies",
      desc: "OCTOM One helps small agencies keep client and lead follow-ups in one shared workspace, without the weight of a full CRM suite. Free during beta.",
      h1: "A lightweight CRM for small agencies",
      intro:
        "Small agencies lose leads in inboxes and chat threads. OCTOM One gives the team one shared place for follow-ups.",
      problemsTitle: "What usually goes wrong",
      problems: [
        "Nobody knows who last spoke to a lead.",
        "Two people write to the same client, or nobody does.",
        "A full CRM suite is too heavy to keep up to date.",
      ],
      pointsTitle: "How OCTOM One helps",
      points: [
        { t: "Shared workspace", d: "Invite teammates and see everyone's follow-ups or only your own." },
        { t: "Assign contacts", d: "Make it clear who owns each conversation." },
        { t: "Pipeline view", d: "See where each lead stands without configuring a complex system." },
      ],
      stepsTitle: "Set it up in an afternoon",
      steps: [
        "Create the workspace and invite your teammates.",
        "Import your leads from a CSV file and assign owners.",
        "Everyone opens their own list of follow-ups each morning.",
      ],
      faqTitle: "Questions agencies ask",
      faq: [
        { q: "How many people can share a workspace?", a: "A workspace supports up to 5 people during the beta." },
        { q: "Can I see only my own follow-ups?", a: "Yes. The dashboard switches between your own follow-ups and the whole team's." },
        { q: "Can the AI assistant contact our clients?", a: "No. It only writes text for you to review. It cannot send messages, edit contacts or delete anything." },
      ],
    },
    ro: {
      title: "Un CRM ușor pentru agenții mici",
      desc: "OCTOM One ajută agențiile mici să țină follow-up-urile pentru clienți și lead-uri într-un singur spațiu comun, fără greutatea unei suite CRM. Gratuit în beta.",
      h1: "Un CRM ușor pentru agenții mici",
      intro:
        "Agențiile mici pierd lead-uri în inbox-uri și conversații de chat. OCTOM One oferă echipei un singur loc comun pentru follow-up.",
      problemsTitle: "Ce merge de obicei prost",
      problems: [
        "Nimeni nu știe cine a vorbit ultima dată cu un lead.",
        "Doi oameni scriu aceluiași client sau nu scrie nimeni.",
        "O suită CRM completă e prea grea ca să o ții la zi.",
      ],
      pointsTitle: "Cum te ajută OCTOM One",
      points: [
        { t: "Spațiu comun", d: "Invită colegii și vezi follow-up-urile tuturor sau doar pe ale tale." },
        { t: "Atribuie contacte", d: "Fă clar cine răspunde de fiecare conversație." },
        { t: "Vedere pipeline", d: "Vezi unde se află fiecare lead, fără să configurezi un sistem complex." },
      ],
      stepsTitle: "Îl configurezi într-o după-amiază",
      steps: [
        "Creează spațiul de lucru și invită-ți colegii.",
        "Importă lead-urile dintr-un fișier CSV și atribuie responsabili.",
        "Fiecare își deschide dimineața propria listă de follow-up.",
      ],
      faqTitle: "Întrebări frecvente ale agențiilor",
      faq: [
        { q: "Câte persoane pot folosi un spațiu de lucru?", a: "Un spațiu de lucru permite până la 5 persoane în perioada beta." },
        { q: "Pot vedea doar follow-up-urile mele?", a: "Da. Dashboard-ul comută între follow-up-urile tale și cele ale întregii echipe." },
        { q: "Poate asistentul AI să contacteze clienții noștri?", a: "Nu. Scrie doar text pe care îl verifici tu. Nu poate trimite mesaje, modifica contacte sau șterge ceva." },
      ],
    },
  },
  {
    slug: "consultants",
    en: {
      title: "A follow-up CRM for consultants",
      desc: "OCTOM One helps consultants stay in touch with prospects and past clients, with a daily list of who to contact. Data stored in the EU. Free during beta.",
      h1: "A follow-up CRM for consultants",
      intro:
        "Consulting depends on trust built over time. OCTOM One helps you keep in touch with prospects and past clients without a spreadsheet.",
      problemsTitle: "What usually goes wrong",
      problems: [
        "A promising conversation fades because the next step was never written down.",
        "You forget what was said last time, and it shows.",
        "Past clients hear from you only when you need work.",
      ],
      pointsTitle: "How OCTOM One helps",
      points: [
        { t: "Remember the context", d: "Keep notes and history next to each contact." },
        { t: "Never lose the thread", d: "Set the next follow-up date as soon as a conversation ends." },
        { t: "Your data in the EU", d: "Data is stored in Frankfurt, and you can export or delete it at any time." },
      ],
      stepsTitle: "Make follow-up a habit",
      steps: [
        "Log a note after each call or meeting.",
        "Pick the next follow-up date before you close the tab.",
        "Each morning, work through today's list, past clients included.",
      ],
      faqTitle: "Questions consultants ask",
      faq: [
        { q: "Where is my data stored?", a: "In the EU (Frankfurt). Workspaces are isolated at the database level, and you can export or delete your data at any time." },
        { q: "Can I export my contacts?", a: "Yes. Export your contacts as CSV whenever you like and delete your account from the Account page." },
        { q: "Does it replace my calendar?", a: "No. It tells you who to contact and when, so the right conversations make it into your week." },
      ],
    },
    ro: {
      title: "Un CRM de follow-up pentru consultanți",
      desc: "OCTOM One îi ajută pe consultanți să rămână în legătură cu prospecți și foști clienți, cu o listă zilnică cu cine de contactat. Date stocate în UE. Gratuit în beta.",
      h1: "Un CRM de follow-up pentru consultanți",
      intro:
        "Consultanța se bazează pe încredere construită în timp. OCTOM One te ajută să rămâi în legătură cu prospecți și foști clienți, fără tabel.",
      problemsTitle: "Ce merge de obicei prost",
      problems: [
        "O conversație promițătoare se stinge pentru că pasul următor n-a fost notat.",
        "Uiți ce s-a spus data trecută, și se vede.",
        "Foștii clienți aud de la tine doar când ai nevoie de lucru.",
      ],
      pointsTitle: "Cum te ajută OCTOM One",
      points: [
        { t: "Ține minte contextul", d: "Păstrează notițe și istoric lângă fiecare contact." },
        { t: "Nu pierde firul", d: "Setează data următorului follow-up imediat ce se termină o conversație." },
        { t: "Datele tale în UE", d: "Datele sunt stocate la Frankfurt, iar tu le poți exporta sau șterge oricând." },
      ],
      stepsTitle: "Fă din follow-up un obicei",
      steps: [
        "Notează câteva rânduri după fiecare apel sau întâlnire.",
        "Alege data următorului follow-up înainte să închizi pagina.",
        "În fiecare dimineață parcurgi lista de azi, inclusiv foștii clienți.",
      ],
      faqTitle: "Întrebări frecvente ale consultanților",
      faq: [
        { q: "Unde sunt stocate datele mele?", a: "În UE (Frankfurt). Spațiile de lucru sunt izolate la nivelul bazei de date, iar datele le poți exporta sau șterge oricând." },
        { q: "Pot să îmi export contactele?", a: "Da. Exportă contactele ca CSV oricând vrei și șterge-ți contul din pagina Cont." },
        { q: "Îmi ia locul calendarului?", a: "Nu. Îți spune pe cine să contactezi și când, ca să ajungă în săptămâna ta conversațiile potrivite." },
      ],
    },
  },
  {
    slug: "small-teams",
    en: {
      title: "A simple CRM for small B2B teams",
      desc: "OCTOM One is a simple shared CRM for small B2B teams. Follow-ups, assignees and a pipeline, without the clutter. Open source core, free during beta.",
      h1: "A simple CRM for small B2B teams",
      intro:
        "A small team does not need a large system. It needs to know who talks to whom and when. OCTOM One covers that and little else.",
      problemsTitle: "What usually goes wrong",
      problems: [
        "Customer context lives in one person's head or inbox.",
        "Enterprise CRMs ask for weeks of setup and a dedicated admin.",
        "Follow-ups are tracked in a spreadsheet nobody trusts.",
      ],
      pointsTitle: "How OCTOM One helps",
      points: [
        { t: "Built for a few people", d: "One workspace supports up to 5 users." },
        { t: "Open source core", d: "The code is public under the AGPL-3.0 license." },
        { t: "English and Romanian", d: "The interface works in both languages." },
      ],
      stepsTitle: "Up and running today",
      steps: [
        "Sign up and name your workspace.",
        "Invite your teammates and import your contacts.",
        "Agree on one habit: set a next follow-up after every conversation.",
      ],
      faqTitle: "Questions small teams ask",
      faq: [
        { q: "Is the code open source?", a: "Yes. The core is public on GitHub under the AGPL-3.0 license." },
        { q: "Does it cost anything?", a: "Not during the beta: unlimited contacts and follow-ups for up to 5 people in a workspace. If paid plans come later, you will be told well in advance." },
        { q: "Which languages does it support?", a: "The interface works in English and Romanian." },
      ],
    },
    ro: {
      title: "Un CRM simplu pentru echipe B2B mici",
      desc: "OCTOM One este un CRM comun și simplu pentru echipe B2B mici. Follow-up, responsabili și pipeline, fără aglomerație. Nucleu open source, gratuit în beta.",
      h1: "Un CRM simplu pentru echipe B2B mici",
      intro:
        "O echipă mică nu are nevoie de un sistem mare. Are nevoie să știe cine vorbește cu cine și când. OCTOM One acoperă asta și puțin altceva.",
      problemsTitle: "Ce merge de obicei prost",
      problems: [
        "Contextul clienților stă în capul sau inbox-ul unei singure persoane.",
        "CRM-urile enterprise cer săptămâni de configurare și un administrator dedicat.",
        "Follow-up-urile sunt urmărite într-un tabel în care nu mai are nimeni încredere.",
      ],
      pointsTitle: "Cum te ajută OCTOM One",
      points: [
        { t: "Făcut pentru câțiva oameni", d: "Un spațiu de lucru permite până la 5 utilizatori." },
        { t: "Nucleu open source", d: "Codul este public, sub licența AGPL-3.0." },
        { t: "Română și engleză", d: "Interfața funcționează în ambele limbi." },
      ],
      stepsTitle: "Funcționează chiar azi",
      steps: [
        "Creează-ți cont și dă un nume spațiului de lucru.",
        "Invită colegii și importă contactele.",
        "Stabiliți un singur obicei: setați un următor follow-up după fiecare conversație.",
      ],
      faqTitle: "Întrebări frecvente ale echipelor mici",
      faq: [
        { q: "Este codul open source?", a: "Da. Nucleul este public pe GitHub, sub licența AGPL-3.0." },
        { q: "Costă ceva?", a: "Nu în perioada beta: contacte și follow-up-uri nelimitate pentru până la 5 persoane într-un spațiu de lucru. Dacă vor veni planuri plătite, vei fi anunțat din timp." },
        { q: "Ce limbi suportă?", a: "Interfața funcționează în română și engleză." },
      ],
    },
  },
];
