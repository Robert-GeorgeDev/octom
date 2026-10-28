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
  {
    slug: "translators",
    en: {
      title: "A simple CRM for freelance translators",
      desc: "OCTOM One helps freelance translators remember which agencies and clients to write to, and when a quote or invoice needs a nudge. Free during beta.",
      h1: "A simple CRM for freelance translators",
      intro:
        "Translation work comes in waves, and many repeat clients go quiet between projects. OCTOM One keeps track of who to write to and when.",
      problemsTitle: "What usually goes wrong",
      problems: [
        "A quote goes out, the client says nothing, and the thread is buried a week later.",
        "A good agency or client has not heard from you since the last project.",
        "An invoice is overdue and writing about it keeps getting postponed.",
      ],
      pointsTitle: "How OCTOM One helps",
      points: [
        { t: "A list for today", d: "See which quotes, check-ins and invoices are due or late, with the reason each one is on the list." },
        { t: "Messages in Romanian or English", d: "Start from a ready message for a quote, an overdue invoice or a quiet client, edit it and send it yourself." },
        { t: "Cadences for quotes and invoices", d: "Pick a short series of reminders. Finishing one step schedules the next, and you can stop at any time." },
      ],
      stepsTitle: "Start in a few minutes",
      steps: [
        "Add your agencies and direct clients, or import them from a CSV file.",
        "After you send a quote, add a follow-up with the cadence that fits.",
        "Open OCTOM One in the morning and work through today's list.",
      ],
      faqTitle: "Questions translators ask",
      faq: [
        { q: "Is OCTOM One free for translators?", a: "Yes. It is free while it is in beta, with unlimited contacts and follow-ups and no card needed. If paid plans come later, you will be told well in advance." },
        { q: "Does it send emails or messages for me?", a: "No. It fills in a message for you, and you copy it or open it in WhatsApp or your email app. OCTOM One never sends anything on its own." },
        { q: "Can I keep my client list from a spreadsheet?", a: "Yes. Import a CSV file, check the preview and fix any errors before anything is saved." },
      ],
    },
    ro: {
      title: "Un CRM simplu pentru traducători freelance",
      desc: "OCTOM One îi ajută pe traducătorii freelance să-și amintească cărei agenții sau cărui client să-i scrie și când o ofertă sau o factură cere o reamintire. Gratuit în beta.",
      h1: "Un CRM simplu pentru traducători freelance",
      intro:
        "Munca de traducător vine în valuri, iar mulți clienți care revin tac între proiecte. OCTOM One ține evidența cui să-i scrii și când.",
      problemsTitle: "Ce merge de obicei prost",
      problems: [
        "Trimiți o ofertă, clientul nu spune nimic, iar conversația se îngroapă după o săptămână.",
        "O agenție sau un client bun n-a mai auzit de tine de la ultimul proiect.",
        "O factură e scadentă, iar mesajul despre ea tot e amânat.",
      ],
      pointsTitle: "Cum te ajută OCTOM One",
      points: [
        { t: "O listă pentru azi", d: "Vezi ce oferte, reveniri și facturi sunt scadente sau întârziate, cu motivul pentru care fiecare e pe listă." },
        { t: "Mesaje în română sau engleză", d: "Pornești de la un mesaj gata făcut pentru o ofertă, o factură întârziată sau un client care a tăcut, îl editezi și îl trimiți tu." },
        { t: "Cadențe pentru oferte și facturi", d: "Alegi o serie scurtă de reamintiri. Când termini un pas, următorul se programează, iar tu poți opri oricând." },
      ],
      stepsTitle: "Începi în câteva minute",
      steps: [
        "Adaugă agențiile și clienții direcți sau importă-i dintr-un fișier CSV.",
        "După ce trimiți o ofertă, adaugă un follow-up cu cadența potrivită.",
        "Dimineața deschizi OCTOM One și parcurgi lista de azi.",
      ],
      faqTitle: "Întrebări frecvente ale traducătorilor",
      faq: [
        { q: "Este OCTOM One gratuit pentru traducători?", a: "Da. Este gratuit cât timp este în beta, cu contacte și follow-up-uri nelimitate și fără card. Dacă vor veni planuri plătite, vei fi anunțat din timp." },
        { q: "Trimite emailuri sau mesaje în locul meu?", a: "Nu. Completează un mesaj pentru tine, iar tu îl copiezi sau îl deschizi în WhatsApp sau în aplicația ta de email. OCTOM One nu trimite nimic singur." },
        { q: "Pot să-mi păstrez lista de clienți dintr-un tabel?", a: "Da. Importă un fișier CSV, verifică previzualizarea și corectează erorile înainte să se salveze ceva." },
      ],
    },
  },
  {
    slug: "designers",
    en: {
      title: "A simple CRM for freelance designers",
      desc: "OCTOM One helps freelance designers follow up on quotes, wait-and-see clients and feedback rounds, so good projects do not fade away. Free during beta.",
      h1: "A simple CRM for freelance designers",
      intro:
        "Design projects stall at the same points: after the quote, while waiting for feedback, between one project and the next. OCTOM One reminds you to move them along.",
      problemsTitle: "What usually goes wrong",
      problems: [
        "A client asks for a quote, you send it, and nobody mentions it again.",
        "A project waits for feedback and slides past its deadline.",
        "Past clients are the easiest new work, but you rarely get round to writing to them.",
      ],
      pointsTitle: "How OCTOM One helps",
      points: [
        { t: "A list for today", d: "See who needs a reply or a nudge, ordered by what matters most, with the reasons shown." },
        { t: "Messages for common moments", d: "Start from a ready message after a quote, after a meeting or when a client has gone quiet, then make it sound like you." },
        { t: "A pipeline you can read at a glance", d: "Move each project from new to won or lost without setting up a complicated system." },
      ],
      stepsTitle: "Start in a few minutes",
      steps: [
        "Add your current and past clients, or import them from a CSV file.",
        "Set a follow-up when you send a quote or a draft for feedback.",
        "Open OCTOM One in the morning and start with the first name on the list.",
      ],
      faqTitle: "Questions designers ask",
      faq: [
        { q: "Is OCTOM One free for designers?", a: "Yes. It is free while it is in beta, with unlimited contacts and follow-ups and no card needed. If paid plans come later, you will be told well in advance." },
        { q: "Can I use it from my phone?", a: "Yes. It works in a phone browser, and in Chrome you can install it and open it from your home screen." },
        { q: "Does the AI assistant send anything?", a: "No. It only writes drafts. You read them, edit them and send them yourself." },
      ],
    },
    ro: {
      title: "Un CRM simplu pentru designeri freelance",
      desc: "OCTOM One îi ajută pe designerii freelance să facă follow-up la oferte, la clienți care așteaptă și la feedback, ca proiectele bune să nu se piardă. Gratuit în beta.",
      h1: "Un CRM simplu pentru designeri freelance",
      intro:
        "Proiectele de design se opresc mereu în aceleași locuri: după ofertă, cât aștepți feedback, între un proiect și următorul. OCTOM One îți amintește să le urnești.",
      problemsTitle: "Ce merge de obicei prost",
      problems: [
        "Un client cere o ofertă, tu o trimiți, iar apoi nimeni nu mai pomenește de ea.",
        "Un proiect așteaptă feedback și depășește termenul.",
        "Clienții de până acum sunt cea mai ușoară muncă nouă, dar rar ajungi să le scrii.",
      ],
      pointsTitle: "Cum te ajută OCTOM One",
      points: [
        { t: "O listă pentru azi", d: "Vezi cui trebuie să-i răspunzi sau să-i amintești, ordonat după ce contează cel mai mult, cu motivele afișate." },
        { t: "Mesaje pentru momentele obișnuite", d: "Pornești de la un mesaj gata făcut după o ofertă, după o întâlnire sau când un client a tăcut, apoi îl faci să sune ca tine." },
        { t: "Un pipeline pe care îl citești dintr-o privire", d: "Muți fiecare proiect de la nou la câștigat sau pierdut, fără un sistem complicat de configurat." },
      ],
      stepsTitle: "Începi în câteva minute",
      steps: [
        "Adaugă clienții actuali și cei de până acum sau importă-i dintr-un fișier CSV.",
        "Setează un follow-up când trimiți o ofertă sau o variantă pentru feedback.",
        "Dimineața deschizi OCTOM One și începi cu primul nume de pe listă.",
      ],
      faqTitle: "Întrebări frecvente ale designerilor",
      faq: [
        { q: "Este OCTOM One gratuit pentru designeri?", a: "Da. Este gratuit cât timp este în beta, cu contacte și follow-up-uri nelimitate și fără card. Dacă vor veni planuri plătite, vei fi anunțat din timp." },
        { q: "Pot să-l folosesc de pe telefon?", a: "Da. Funcționează în browserul de pe telefon, iar în Chrome îl poți instala și deschide de pe ecranul principal." },
        { q: "Trimite ceva asistentul AI?", a: "Nu. Scrie doar ciorne. Le citești, le editezi și le trimiți tu." },
      ],
    },
  },
  {
    slug: "photographers",
    en: {
      title: "A simple CRM for photographers",
      desc: "OCTOM One helps photographers answer enquiries, follow up on quotes and ask past clients for a review, without a heavy studio-management suite. Free during beta.",
      h1: "A simple CRM for photographers",
      intro:
        "Enquiries arrive between shoots, and many are answered late. OCTOM One keeps every enquiry and quote in one list so you know who to write to today.",
      problemsTitle: "What usually goes wrong",
      problems: [
        "An enquiry comes in during a shoot and is answered days later.",
        "A quote is sent and the couple or company never hears from you again.",
        "Happy clients are never asked for a review or a recommendation.",
      ],
      pointsTitle: "How OCTOM One helps",
      points: [
        { t: "A list for today", d: "See enquiries and quotes that are due or late, with the reason each one is on the list." },
        { t: "Messages for each moment", d: "Start from a ready message after a quote, after a meeting or when you want to ask for feedback, then edit it and send it yourself." },
        { t: "Contacts with notes and tags", d: "Keep the date, the place and what the client asked for next to the person." },
      ],
      stepsTitle: "Start in a few minutes",
      steps: [
        "Add your open enquiries and past clients, or import them from a CSV file.",
        "Set a follow-up when you send a quote.",
        "After a shoot, add a follow-up to ask for feedback.",
      ],
      faqTitle: "Questions photographers ask",
      faq: [
        { q: "Is OCTOM One free for photographers?", a: "Yes. It is free while it is in beta, with unlimited contacts and follow-ups and no card needed. If paid plans come later, you will be told well in advance." },
        { q: "Does it handle bookings, contracts or galleries?", a: "No. OCTOM One only keeps track of conversations and follow-ups. It is a deliberately simple tool, not a studio-management suite." },
        { q: "Can I use it from my phone between shoots?", a: "Yes. It works in a phone browser, and in Chrome you can install it and open it from your home screen." },
      ],
    },
    ro: {
      title: "Un CRM simplu pentru fotografi",
      desc: "OCTOM One îi ajută pe fotografi să răspundă la solicitări, să facă follow-up la oferte și să ceară o părere clienților, fără o suită grea de gestiune. Gratuit în beta.",
      h1: "Un CRM simplu pentru fotografi",
      intro:
        "Solicitările vin între ședințe foto, iar multe primesc răspuns târziu. OCTOM One ține fiecare solicitare și ofertă într-o singură listă, ca să știi cui să scrii azi.",
      problemsTitle: "Ce merge de obicei prost",
      problems: [
        "O solicitare vine în timpul unei ședințe și primește răspuns după zile.",
        "Trimiți o ofertă, iar cuplul sau firma nu mai aude de tine.",
        "Clienților mulțumiți nu li se cere niciodată o părere sau o recomandare.",
      ],
      pointsTitle: "Cum te ajută OCTOM One",
      points: [
        { t: "O listă pentru azi", d: "Vezi solicitările și ofertele scadente sau întârziate, cu motivul pentru care fiecare e pe listă." },
        { t: "Mesaje pentru fiecare moment", d: "Pornești de la un mesaj gata făcut după o ofertă, după o întâlnire sau când vrei să ceri o părere, apoi îl editezi și îl trimiți tu." },
        { t: "Contacte cu notițe și etichete", d: "Păstrezi data, locul și ce a cerut clientul lângă persoană." },
      ],
      stepsTitle: "Începi în câteva minute",
      steps: [
        "Adaugă solicitările deschise și clienții de până acum sau importă-i dintr-un fișier CSV.",
        "Setează un follow-up când trimiți o ofertă.",
        "După o ședință foto, adaugă un follow-up ca să ceri o părere.",
      ],
      faqTitle: "Întrebări frecvente ale fotografilor",
      faq: [
        { q: "Este OCTOM One gratuit pentru fotografi?", a: "Da. Este gratuit cât timp este în beta, cu contacte și follow-up-uri nelimitate și fără card. Dacă vor veni planuri plătite, vei fi anunțat din timp." },
        { q: "Se ocupă de rezervări, contracte sau galerii?", a: "Nu. OCTOM One ține doar evidența conversațiilor și a follow-up-urilor. E un instrument simplu intenționat, nu o suită de gestiune pentru studio." },
        { q: "Îl pot folosi de pe telefon între ședințe?", a: "Da. Funcționează în browserul de pe telefon, iar în Chrome îl poți instala și deschide de pe ecranul principal." },
      ],
    },
  },
  {
    slug: "accountants",
    en: {
      title: "A simple CRM for small accounting practices",
      desc: "OCTOM One helps freelance accountants and small firms follow up with prospects, chase overdue invoices and keep in touch with clients. Free during beta.",
      h1: "A simple CRM for small accounting practices",
      intro:
        "A small practice lives on repeat clients and referrals. OCTOM One keeps track of prospects, overdue invoices and clients you have not spoken to in a while.",
      problemsTitle: "What usually goes wrong",
      problems: [
        "A prospect asks for a price and the reply waits behind client deadlines.",
        "An invoice is overdue and the reminder keeps slipping.",
        "Clients are only contacted when something is due, so the relationship stays thin.",
      ],
      pointsTitle: "How OCTOM One helps",
      points: [
        { t: "A list for today", d: "See prospects, invoices and check-ins that are due or late, in order, with the reason for each." },
        { t: "A cadence for unpaid invoices", d: "Pick a short series of reminders. Finishing one step schedules the next, and it stops if the contact is closed." },
        { t: "Shared workspace", d: "Invite a colleague and see who is following up with whom." },
      ],
      stepsTitle: "Start in a few minutes",
      steps: [
        "Add prospects and clients, or import them from a CSV file.",
        "Set a follow-up for each overdue invoice or open price request.",
        "Open OCTOM One in the morning and work through today's list.",
      ],
      faqTitle: "Questions accountants ask",
      faq: [
        { q: "Is OCTOM One free for accounting practices?", a: "Yes. It is free while it is in beta, with unlimited contacts and follow-ups and no card needed. If paid plans come later, you will be told well in advance." },
        { q: "Does it connect to my accounting or invoicing software?", a: "No. OCTOM One is a separate, simple follow-up tool. You add the follow-up yourself when an invoice or a request needs one." },
        { q: "Where is the data stored?", a: "In a database in the EU (Frankfurt). The privacy policy and the list of subprocessors explain who processes what." },
      ],
    },
    ro: {
      title: "Un CRM simplu pentru cabinete de contabilitate mici",
      desc: "OCTOM One îi ajută pe contabilii freelance și firmele mici să urmărească potențialii clienți și facturile întârziate și să țină legătura cu clienții. Gratuit în beta.",
      h1: "Un CRM simplu pentru cabinete de contabilitate mici",
      intro:
        "Un cabinet mic trăiește din clienți care revin și din recomandări. OCTOM One ține evidența potențialilor clienți, a facturilor întârziate și a clienților cu care n-ai mai vorbit de ceva vreme.",
      problemsTitle: "Ce merge de obicei prost",
      problems: [
        "Un potențial client cere un preț, iar răspunsul așteaptă în spatele termenelor clienților.",
        "O factură e întârziată, iar reamintirea tot alunecă.",
        "Clienții sunt contactați doar când ceva e scadent, deci relația rămâne subțire.",
      ],
      pointsTitle: "Cum te ajută OCTOM One",
      points: [
        { t: "O listă pentru azi", d: "Vezi potențiali clienți, facturi și reveniri scadente sau întârziate, în ordine, cu motivul fiecăreia." },
        { t: "O cadență pentru facturi neplătite", d: "Alegi o serie scurtă de reamintiri. Când termini un pas, următorul se programează, iar seria se oprește dacă persoana e marcată ca închisă." },
        { t: "Spațiu de lucru comun", d: "Inviți un coleg și vezi cine ține legătura cu cine." },
      ],
      stepsTitle: "Începi în câteva minute",
      steps: [
        "Adaugă potențialii clienți și clienții sau importă-i dintr-un fișier CSV.",
        "Setează un follow-up pentru fiecare factură întârziată sau cerere de preț deschisă.",
        "Dimineața deschizi OCTOM One și parcurgi lista de azi.",
      ],
      faqTitle: "Întrebări frecvente ale contabililor",
      faq: [
        { q: "Este OCTOM One gratuit pentru cabinete de contabilitate?", a: "Da. Este gratuit cât timp este în beta, cu contacte și follow-up-uri nelimitate și fără card. Dacă vor veni planuri plătite, vei fi anunțat din timp." },
        { q: "Se conectează la programul meu de contabilitate sau de facturare?", a: "Nu. OCTOM One este un instrument separat, simplu, pentru follow-up. Adaugi tu follow-up-ul când o factură sau o cerere are nevoie de unul." },
        { q: "Unde sunt stocate datele?", a: "Într-o bază de date din UE (Frankfurt). Politica de confidențialitate și lista de subprocesatori explică cine prelucrează ce." },
      ],
    },
  },
];
