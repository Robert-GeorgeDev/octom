// Romanian articles for the blog at /ro/blog. Each targets one search phrase people really type.
// Facts about OCTOM One are kept to what is true today (see lib/jsonld.ts and the home page).

export type ArticleBlock = {
  h2: string;
  p?: string[];
  ul?: string[];
  ol?: string[];
  /** Message templates, shown as quoted blocks people can copy. */
  templates?: string[];
};

export type Article = {
  slug: string;
  /** The phrase this article is written for. */
  keyword: string;
  title: string;
  desc: string;
  h1: string;
  published: string;
  updated: string;
  intro: string;
  blocks: ArticleBlock[];
  faq: { q: string; a: string }[];
};

export const ARTICLES: Article[] = [
  {
    slug: "follow-up-client",
    keyword: "follow-up client",
    title: "Follow-up client: ghid practic pentru freelanceri",
    desc: "Ce este follow-up-ul cu clienții, când îl trimiți, cât de des și cum nu mai uiți pe cine ai de contactat. Ghid simplu, cu pași, pentru freelanceri și echipe mici.",
    h1: "Follow-up client: ghid practic pentru freelanceri",
    published: "2026-10-22",
    updated: "2026-10-22",
    intro:
      "Cei mai mulți clienți nu spun „nu”. Pur și simplu tac. Oferta a plecat, ai primit un „mă uit și revin”, iar apoi nimic. Follow-up-ul este mesajul prin care reiei firul, politicos și la momentul potrivit. Mulți freelanceri îl amână sau îl uită, iar de aici se pierd proiecte care ar fi fost câștigate.",
    blocks: [
      {
        h2: "Ce este follow-up-ul",
        p: [
          "Follow-up înseamnă să revii la o persoană după o discuție, o ofertă sau un mesaj rămas fără răspuns. Nu este insistență. Este o reamintire utilă: omul e ocupat, mesajul tău s-a pierdut între alte douăzeci, iar o replică scurtă îl readuce în față.",
          "Funcționează pentru lead-uri noi, oferte trimise, clienți vechi care nu au mai comandat și recomandări pe care ți le-a promis cineva.",
        ],
      },
      {
        h2: "Când trimiți follow-up-ul",
        p: ["Nu există o regulă universală, dar un ritm simplu merge bine în majoritatea cazurilor:"],
        ul: [
          "După o ofertă: 2–3 zile lucrătoare pentru o ofertă mică, până la o săptămână pentru una mare.",
          "După un mesaj fără răspuns: după 3–5 zile.",
          "După un client câștigat: o verificare după livrare, apoi la câteva luni.",
          "Dacă clientul a spus „revin luna viitoare”: notează data exactă și scrie-i atunci, fără să aștepți să-ți amintești.",
        ],
      },
      {
        h2: "De câte ori insiști",
        p: [
          "Două sau trei mesaje, la intervale tot mai mari, sunt de obicei suficiente. Dacă nu primești niciun răspuns după al treilea, trimite un ultim mesaj politicos, în care lași ușa deschisă, și treci mai departe. Fiecare mesaj trebuie să aducă ceva: o întrebare clară, o informație nouă sau o variantă de a continua mai ușor.",
        ],
      },
      {
        h2: "Cum arată un follow-up bun",
        ul: [
          "Scurt: două-patru propoziții.",
          "Specific: menționează ce ați discutat sau ce ofertă ai trimis.",
          "Cu o singură întrebare sau un singur pas următor.",
          "Fără reproș. Nu scrie „nu mi-ai răspuns”. Scrie „vreau să fiu sigur că mesajul a ajuns”.",
        ],
      },
      {
        h2: "Cum nu mai uiți pe cine ai de contactat",
        p: [
          "Problema reală nu e ce scrii, ci că uiți. Memoria nu ține la zeci de conversații deschise. Ai nevoie de un loc unde fiecare contact are o dată pentru următorul pas, iar în fiecare dimineață vezi doar ce trebuie făcut azi.",
          "Poți face asta într-un tabel sau într-un calendar, cu disciplină. Un CRM simplu, construit în jurul follow-up-urilor, face același lucru fără efort: OCTOM One îți arată în fiecare dimineață lista cu cine contactezi azi și poate scrie o ciornă de mesaj pe care o verifici tu înainte să o trimiți.",
        ],
      },
    ],
    faq: [
      {
        q: "Cât aștept înainte de primul follow-up?",
        a: "De obicei 2–3 zile lucrătoare după o ofertă mică și până la o săptămână după una mare. Dacă ai promis tu un termen, respectă-l exact.",
      },
      {
        q: "Nu pare că insist prea mult?",
        a: "Nu, dacă mesajul e scurt, politicos și aduce ceva nou. Oamenii uită rar din rea-voință; de obicei sunt doar ocupați.",
      },
      {
        q: "Pot automatiza follow-up-urile?",
        a: "Poți automatiza reamintirea, adică să știi când ai de scris. Mesajul în sine merită verificat de tine, ca să sune a om și să se potrivească discuției.",
      },
    ],
  },
  {
    slug: "cum-faci-follow-up-dupa-oferta",
    keyword: "follow up după ofertă",
    title: "Cum faci follow-up după o ofertă trimisă",
    desc: "Ai trimis oferta și nu ai primit răspuns? Află când scrii, ce spui și cum reiei discuția politicos, cu pași clari și modele de mesaj în română.",
    h1: "Cum faci follow-up după o ofertă trimisă",
    published: "2026-10-22",
    updated: "2026-10-22",
    intro:
      "Ai petrecut o seară la o ofertă, ai trimis-o, iar clientul nu mai răspunde. Este una dintre cele mai frecvente situații pentru freelanceri și agenții mici. Vestea bună: de obicei nu e un refuz, ci o prioritate care a trecut pe locul doi. Un follow-up bine ales aduce frecvent răspunsul.",
    blocks: [
      {
        h2: "De ce nu răspund clienții",
        ul: [
          "Sunt ocupați și au deschis oferta, dar nu au apucat să o citească cu atenție.",
          "Trebuie să o arate altcuiva, de exemplu șefului sau partenerului.",
          "Au nevoie de o clarificare și nu știu cum să o ceară.",
          "Au mai multe oferte și le compară fără grabă.",
          "Prioritatea s-a schimbat și proiectul a fost amânat.",
        ],
      },
      {
        h2: "Calendarul simplu al follow-up-urilor",
        ol: [
          "Ziua 0: trimite oferta și spune clar când revii („Revin joi cu o scurtă verificare”).",
          "Ziua 2–3: primul follow-up, scurt, cu o întrebare.",
          "Ziua 7: al doilea, cu un pas ușor: un apel de 10 minute sau o variantă mai mică a ofertei.",
          "Ziua 14: ultimul mesaj, politicos, care lasă ușa deschisă.",
        ],
      },
      {
        h2: "Modele de mesaj",
        p: ["Adaptează-le cu detalii din discuția voastră. Un mesaj generic se simte generic."],
        templates: [
          "Bună, [Nume]! Voiam să mă asigur că ai primit oferta pentru [proiect]. Dacă ai întrebări sau vrei să ajustăm ceva, spune-mi și le lămurim rapid.",
          "Bună, [Nume]! Revin în legătură cu oferta de la începutul săptămânii. Ar ajuta un apel scurt de 10 minute, în care să trecem împreună prin puncte? Pot oricând joi sau vineri.",
          "Bună, [Nume]! Înțeleg că proiectul poate să nu fie o prioritate acum. Las oferta valabilă până la [dată], iar dacă se schimbă ceva, mă găsești aici. Mulțumesc pentru timp!",
        ],
      },
      {
        h2: "Greșeli de evitat",
        ul: [
          "Să scrii „doar verific” fără să adaugi nimic. Oferă un motiv să răspundă.",
          "Să reproșezi tăcerea.",
          "Să scazi prețul din prima, înainte să afli dacă prețul e problema.",
          "Să uiți complet. Cea mai frecventă greșeală este că nu mai revii deloc.",
        ],
      },
      {
        h2: "Ține evidența, altfel uiți",
        p: [
          "După trei-patru oferte deschise, nu mai ții minte cine a primit ce și când. Pune o dată de follow-up pe fiecare ofertă în momentul în care o trimiți. Cu OCTOM One poți programa acea dată pe contact, iar în ziua respectivă apare în lista „de contactat azi”, cu notița ta alături.",
        ],
      },
    ],
    faq: [
      {
        q: "Cât aștept după ce trimit oferta?",
        a: "Două-trei zile lucrătoare pentru o ofertă mică, cel mult o săptămână pentru una mare. Cel mai bun moment este cel pe care l-ai anunțat tu în mesajul cu oferta.",
      },
      {
        q: "Ce fac dacă nu răspunde nici după trei mesaje?",
        a: "Trimite un ultim mesaj politicos, care lasă oferta valabilă până la o dată clară, și treci mai departe. Poți relua după câteva luni cu un motiv nou.",
      },
      {
        q: "Să propun un telefon sau să scriu tot pe email?",
        a: "Depinde de client. Un apel scurt, propus ca opțiune, ajută când oferta are multe detalii. Pentru restul, un mesaj scurt cu o singură întrebare e suficient.",
      },
    ],
  },
  {
    slug: "email-follow-up-exemple",
    keyword: "email follow up exemplu",
    title: "Email de follow-up: 7 exemple în română de copiat",
    desc: "Șapte modele de email și mesaj de follow-up în română: după ofertă, după întâlnire, lead fără răspuns, client vechi și factură. Cu sfaturi să sune natural.",
    h1: "Email de follow-up: 7 exemple în română de copiat",
    published: "2026-10-22",
    updated: "2026-10-22",
    intro:
      "Un follow-up bun e scurt, specific și cere un singur lucru. Mai jos ai șapte modele pentru situațiile cele mai frecvente. Nu le trimite așa cum sunt: schimbă numele, adaugă un detaliu din discuția voastră și scoate orice propoziție care nu sună ca tine.",
    blocks: [
      {
        h2: "1. După ce ai trimis o ofertă",
        templates: [
          "Subiect: Despre oferta pentru [proiect]\n\nBună, [Nume]! Am vrut să verific dacă ai apucat să te uiți peste ofertă. Dacă ai întrebări sau vrei să ajustăm ceva, spune-mi și lămurim repede.",
        ],
      },
      {
        h2: "2. După o întâlnire sau un apel",
        templates: [
          "Subiect: Mulțumesc pentru discuție\n\nBună, [Nume]! Mulțumesc pentru timpul de azi. Am reținut că [punct discutat] e prioritatea voastră. Îți trimit până vineri [ce ai promis]. Ne auzim apoi.",
        ],
      },
      {
        h2: "3. Lead care nu a răspuns la primul mesaj",
        templates: [
          "Bună, [Nume]! Revin scurt la mesajul de acum câteva zile. Dacă [problema lor] e încă un subiect, pot să-ți arăt în 10 minute cum aș aborda-o. Dacă nu, nicio problemă.",
        ],
      },
      {
        h2: "4. Client vechi care nu a mai comandat",
        templates: [
          "Bună, [Nume]! Au trecut câteva luni de la [proiect]. Sper că totul merge bine. Dacă apare ceva nou sau vrei să revedem rezultatele, sunt aici.",
        ],
      },
      {
        h2: "5. Ultimul mesaj, după mai multe încercări",
        templates: [
          "Bună, [Nume]! Nu vreau să te deranjez, așa că acesta e ultimul meu mesaj pe tema asta. Dacă se schimbă ceva, mă găsești oricând aici. Mult succes cu [proiectul lor]!",
        ],
      },
      {
        h2: "6. Reamintirea unei facturi",
        templates: [
          "Subiect: Factura [număr]\n\nBună, [Nume]! O reamintire prietenoasă: factura [număr], în valoare de [sumă], a ajuns la scadență pe [dată]. Dacă ai trimis deja plata, ignoră mesajul. Dacă ai nevoie de ceva de la mine, spune-mi.",
        ],
      },
      {
        h2: "7. Cerere de recomandare",
        templates: [
          "Bună, [Nume]! Mă bucur că [rezultat] a mers bine. Dacă te gândești la cineva care ar avea nevoie de ceva similar, mi-ar fi de mare ajutor o prezentare. Mulțumesc!",
        ],
      },
      {
        h2: "Cum faci ca mesajul să sune natural",
        ul: [
          "Citește-l cu voce tare. Dacă tu nu ai spune așa, rescrie.",
          "Menționează un detaliu real: un termen, un buget, o frază spusă de ei.",
          "Cere un singur lucru. Două întrebări înseamnă de obicei zero răspunsuri.",
          "Folosește tonul pe care îl aveai deja în discuția cu ei.",
        ],
      },
    ],
    faq: [
      {
        q: "Pot folosi aceste modele exact așa cum sunt?",
        a: "Mai bine nu. Ele sunt un punct de plecare. Schimbă numele, adaugă un detaliu concret din discuția voastră și ajustează tonul ca să sune ca tine.",
      },
      {
        q: "Scriu cu „tu” sau cu „dumneavoastră”?",
        a: "Potrivește-te cu felul în care ți-a scris clientul. Dacă nu ești sigur, începe politicos și treci la „tu” când o face și el.",
      },
      {
        q: "Un asistent AI poate scrie follow-up-urile pentru mine?",
        a: "Poate scrie o ciornă, dar tu o verifici și o trimiți. OCTOM One are un asistent care propune mesaje, însă nu trimite nimic în numele tău.",
      },
    ],
  },
  {
    slug: "crm-simplu-pentru-freelanceri",
    keyword: "crm simplu pentru freelanceri",
    title: "CRM simplu pentru freelanceri: ce să cauți",
    desc: "Ai nevoie de un CRM ca freelancer? Ce trebuie să facă un CRM simplu, ce funcții poți ignora și cum alegi unul care nu te încurcă, cu o listă scurtă de verificat.",
    h1: "CRM simplu pentru freelanceri: ce să cauți",
    published: "2026-10-22",
    updated: "2026-10-22",
    intro:
      "Multe CRM-uri sunt făcute pentru echipe de vânzări cu zeci de oameni: rapoarte, automatizări, previziuni. Un freelancer are nevoie de altceva: să nu uite pe cine a promis că îl contactează. Dacă un CRM cere o oră pe zi doar ca să-l ții la zi, ajungi să nu-l mai folosești.",
    blocks: [
      {
        h2: "Ai nevoie de CRM?",
        p: [
          "Dacă ai doar câțiva clienți, o foaie de calcul poate fi suficientă. Începi să ai nevoie de ceva mai bun când ai peste 15–20 de contacte active, oferte deschise în paralel sau clienți care revin la intervale mari de timp. Atunci uiți, iar uitatul costă proiecte.",
        ],
      },
      {
        h2: "Ce trebuie să facă un CRM simplu",
        ul: [
          "Să-ți arate în fiecare zi pe cine contactezi azi.",
          "Să păstreze notițe și istoricul fiecărui contact, într-un singur loc.",
          "Să te anunțe când a trecut data unui follow-up.",
          "Să-ți permită să adaugi un contact în câteva secunde.",
          "Să importe contactele existente dintr-un fișier CSV, ca să nu o iei de la zero.",
          "Să-ți lase datele să iasă: export, nu blocare.",
        ],
      },
      {
        h2: "Ce poți ignora la început",
        ul: [
          "Automatizări complexe și scenarii cu zeci de condiții.",
          "Rapoarte și previziuni de vânzări.",
          "Integrări cu zeci de aplicații pe care nu le folosești.",
          "Permisiuni pe roluri, dacă lucrezi singur.",
        ],
      },
      {
        h2: "Întrebări de pus înainte să alegi",
        ol: [
          "Cât durează să adaug un contact și un follow-up?",
          "Pot importa și exporta datele mele?",
          "Unde sunt stocate datele și cine le poate vedea?",
          "Ce se întâmplă cu planul gratuit: ce limite are și poate fi folosit în scop comercial?",
          "Am nevoie de el și pe telefon?",
        ],
      },
      {
        h2: "Unde se încadrează OCTOM One",
        p: [
          "OCTOM One este un CRM intenționat simplu, construit în jurul follow-up-urilor, pentru freelanceri, consultanți și echipe mici. Este gratuit în perioada beta, are import și export CSV, interfață în română și engleză, iar datele sunt stocate în UE. Nu este o suită completă de vânzări și nu încearcă să fie.",
        ],
      },
    ],
    faq: [
      {
        q: "Un tabel în Excel nu e suficient?",
        a: "Pentru câțiva clienți, da. Când ai multe conversații deschise, tabelul nu te anunță când trebuie să revii și ajungi să-l deschizi rar.",
      },
      {
        q: "Cât de mult timp îmi ia un CRM?",
        a: "Unul simplu ar trebui să-ți ia câteva minute pe zi: adaugi contactele noi și bifezi follow-up-urile făcute. Dacă cere mai mult, e prea complicat pentru tine.",
      },
      {
        q: "Pot muta contactele din alt loc?",
        a: "De obicei da, printr-un fișier CSV exportat din Google Contacts, Excel sau alt CRM. OCTOM One acceptă import CSV cu antete flexibile.",
      },
    ],
  },
  {
    slug: "excel-sau-crm",
    keyword: "excel sau crm",
    title: "Excel sau CRM pentru clienți: când nu mai ajunge tabelul",
    desc: "Excel merge bine la început, dar la un moment dat te costă clienți. Vezi semnele că ai depășit tabelul, ce câștigi cu un CRM simplu și cum muți datele fără durere.",
    h1: "Excel sau CRM pentru clienți: când nu mai ajunge tabelul",
    published: "2026-10-22",
    updated: "2026-10-22",
    intro:
      "Aproape toți începem cu un tabel: nume, telefon, ce am discutat. Funcționează, este gratuit și îl înțelegi. Problema apare mai târziu, când tabelul are 80 de rânduri și nimeni nu-ți spune că ai uitat să răspunzi cuiva acum două săptămâni.",
    blocks: [
      {
        h2: "Ce face bine un tabel",
        ul: [
          "Este gratuit și îl știi deja.",
          "Îl adaptezi cum vrei.",
          "Merge bine pentru 10–15 contacte și un singur om.",
        ],
      },
      {
        h2: "Semne că ai depășit tabelul",
        ul: [
          "Ai uitat să revii la cineva și ai aflat abia când te-a căutat el.",
          "Nu mai deschizi tabelul în fiecare zi.",
          "Nu știi pe loc cine are un follow-up întârziat.",
          "Notițele sunt împrăștiate: o parte în tabel, o parte în email, o parte în telefon.",
          "Lucrezi cu un partener și vă suprapuneți sau nu știți cine a scris cui.",
        ],
      },
      {
        h2: "Ce aduce în plus un CRM simplu",
        ul: [
          "O listă de azi: vezi doar ce trebuie făcut acum, nu tot tabelul.",
          "Mementouri: nu depinzi de memorie sau de disciplină.",
          "Istoric pe contact: tot ce ați discutat, într-un loc.",
          "Lucru în echipă: toată lumea vede aceeași situație.",
        ],
      },
      {
        h2: "Cum muți datele din Excel",
        ol: [
          "Curăță tabelul: un contact pe rând, fără rânduri goale sau duplicate evidente.",
          "Salvează-l ca fișier CSV (în Excel: Salvare ca, apoi CSV).",
          "Importă fișierul în CRM și verifică primele rânduri.",
          "Setează o dată de follow-up pentru contactele care au nevoie de ea.",
        ],
      },
      {
        h2: "Un CRM nu rezolvă tot",
        p: [
          "Dacă nu ai un obicei de a scrie ce ai discutat, niciun instrument nu te salvează. Diferența este că un CRM simplu face obiceiul mai ușor: un pas scurt, la finalul fiecărei discuții, apoi sistemul îți amintește el.",
        ],
      },
    ],
    faq: [
      {
        q: "Pierd date când trec din Excel într-un CRM?",
        a: "Nu, dacă exporți tabelul ca CSV și îl importi. Păstrează și tabelul original până verifici că totul a ajuns corect.",
      },
      {
        q: "Cât costă un CRM simplu?",
        a: "Variază mult. OCTOM One este gratuit în perioada beta, iar eventualele planuri plătite viitoare vor fi anunțate din timp.",
      },
      {
        q: "Pot folosi și tabelul, și CRM-ul?",
        a: "Poți, dar nu recomand. Două locuri înseamnă date care nu mai coincid. Alege unul și mută tot acolo.",
      },
    ],
  },
  {
    slug: "crm-gratuit-pentru-freelanceri",
    keyword: "crm gratuit pentru freelanceri",
    title: "CRM gratuit pentru freelanceri: la ce să te uiți",
    desc: "Un CRM gratuit poate fi suficient pentru un freelancer, dar condițiile contează. Limite, uz comercial, date și export: ce verifici înainte să-ți muți clienții acolo.",
    h1: "CRM gratuit pentru freelanceri: la ce să te uiți",
    published: "2026-10-22",
    updated: "2026-10-22",
    intro:
      "Gratuit sună bine, mai ales la început. Dar „gratuit” poate însemna lucruri diferite: gratuit pentru totdeauna cu limite, gratuit doar la probă sau gratuit în beta. Înainte să muți acolo lista ta de clienți, merită să știi ce primești și ce se poate schimba.",
    blocks: [
      {
        h2: "Tipuri de „gratuit”",
        ul: [
          "Plan gratuit permanent, cu limite de contacte, utilizatori sau funcții.",
          "Perioadă de probă, după care trebuie să plătești sau pierzi accesul la funcții.",
          "Beta gratuită, în care produsul este în dezvoltare și condițiile se pot schimba.",
          "Open source, pe care îl poți găzdui singur, dar pe care trebuie să-l întreții tu.",
        ],
      },
      {
        h2: "Ce verifici înainte să te muți",
        ol: [
          "Limitele: câte contacte, câți utilizatori, câte follow-up-uri.",
          "Uzul comercial: planul gratuit poate fi folosit pentru munca ta cu clienți?",
          "Exportul: poți scoate toate datele oricând, într-un fișier?",
          "Unde sunt datele: în UE sau în afară, și cine are acces la ele.",
          "Ce se întâmplă când se termină gratuitul: vei fi anunțat din timp?",
        ],
      },
      {
        h2: "Datele clienților tăi sunt și responsabilitatea ta",
        p: [
          "Contactele și notițele despre clienți sunt date personale. Dacă lucrezi cu persoane din UE, GDPR se aplică și ție. Alege un instrument care spune clar unde stochează datele, cine le procesează și cum le ștergi. Pagina de confidențialitate a produsului trebuie să răspundă la aceste întrebări.",
        ],
      },
      {
        h2: "Planul tău de rezervă",
        p: [
          "Orice instrument poate dispărea sau își poate schimba condițiile. Exportă-ți contactele într-un CSV o dată la câteva luni. Dacă instrumentul nu permite export, nu e un instrument pe care să-ți construiești afacerea.",
        ],
      },
      {
        h2: "Ce primești gratuit în OCTOM One",
        p: [
          "OCTOM One este gratuit în perioada beta, cu contacte și follow-up-uri nelimitate și fără card. Include lista zilnică cu cine contactezi azi, mementouri, rezumat zilnic pe email, import și export CSV și spațiu de lucru pentru până la 5 persoane. Eventualele planuri plătite viitoare vor fi anunțate din timp. Nucleul este open source (AGPL-3.0).",
        ],
      },
    ],
    faq: [
      {
        q: "Pot folosi un CRM gratuit pentru clienți reali?",
        a: "Da, dacă termenii planului permit uz comercial. Citește termenii și verifică limitele înainte să-ți muți contactele.",
      },
      {
        q: "Ce fac dacă instrumentul devine plătit?",
        a: "De aceea contează exportul. Cu un CSV al contactelor poți pleca oricând în alt loc, fără să pierzi nimic.",
      },
      {
        q: "Este sigur să țin datele clienților într-un CRM gratuit?",
        a: "Depinde de furnizor, nu de preț. Verifică unde sunt stocate datele, cine le procesează și dacă poți să le ștergi sau să le exporți.",
      },
    ],
  },
];

export function articleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
