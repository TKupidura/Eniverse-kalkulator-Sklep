/* Eniverse — independent WooCommerce calculator. Demo quote form does not send messages. */
(() => {
  "use strict";
  const root = document.getElementById("enishop");
  if (!root) return;
  const one = (s) => root.querySelector(s);
  const all = (s) => [...root.querySelectorAll(s)];
  const money = (n) => new Intl.NumberFormat("pl-PL", {maximumFractionDigits:0}).format(n) + " zł";
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const packages = {
  "start": {
    "id": "start",
    "name": "Start e-Commerce",
    "tag": "START SPRZEDAŻY ONLINE",
    "price": 2290,
    "description": "Ekonomiczny sklep oparty na gotowym szablonie, idealny na początek.",
    "products": 5,
    "pagesLabel": "Komplet podstawowych podstron",
    "revisions": 1,
    "training": "1 godzina",
    "warranty": "6 miesięcy",
    "delivery": "Do ustalenia",
    "benefits": [
      "Gotowy szablon z bibliotek komercyjnych",
      "5 produktów prostych wprowadzonych w cenie",
      "Komplet standardowych podstron sklepu",
      "Płatności i podstawowa dostawa",
      "Szkolenie z obsługi — 1 godz.",
      "WordPress + WooCommerce i wersja mobilna"
    ],
    "excluded": [
      "Licencja wybranego szablonu — osobno",
      "Blog i integracje dodatkowe — opcjonalnie"
    ],
    "scope": [
      "Motyw WooCommerce z Envato Market, TemplateMonster lub podobnej biblioteki",
      "Instalacja i dostosowanie gotowego szablonu: logo, kolory i treści",
      "Strona główna, sklep, kategorie, produkty, koszyk, kasa, konto i informacje dla klientów",
      "Wprowadzenie 5 produktów prostych z materiałów klienta",
      "Jedna bramka płatności i podstawowe sposoby dostawy",
      "Kody rabatowe, konto klienta i obsługa zamówień",
      "Podstawowe ustawienia SEO technicznego",
      "1 runda poprawek i 1 godzina szkolenia online",
      "Licencja motywu / dodatków oraz dokumenty prawne klienta nie są w cenie"
    ]
  },
  "standard": {
    "id": "standard",
    "name": "Standard",
    "tag": "DLA MAŁYCH FIRM",
    "price": 2800,
    "description": "Uniwersalny sklep z szerszą konfiguracją i pomocą we wdrożeniu.",
    "products": 10,
    "pagesLabel": "Komplet standardowych podstron",
    "revisions": 1,
    "training": "2 godziny",
    "warranty": "6 miesięcy",
    "delivery": "2–4 tygodnie",
    "benefits": [
      "Sklep WooCommerce dopasowany do marki",
      "10 produktów prostych w cenie",
      "Wszystkie standardowe podstrony sklepu",
      "Koszyk, płatności i podstawowe dostawy",
      "Podstawowa konfiguracja Google Analytics",
      "Szkolenie z obsługi — 2 godz."
    ],
    "excluded": [
      "Blog i integracja InPost — dodatki"
    ],
    "scope": [
      "Responsywność na desktopie, tablecie i telefonie",
      "Gotowy motyw i personalizacja kolorów, fontów, zdjęć oraz układu podstawowych sekcji",
      "Komplet standardowych widoków sklepu i stron informacyjnych z treści klienta",
      "Wprowadzenie 10 produktów prostych",
      "Jedna wybrana bramka płatności oraz podstawowe metody dostawy",
      "Konto klienta, kody rabatowe, stany magazynowe i raporty",
      "Podstawowe SEO techniczne i Google Analytics 4",
      "Konfiguracja banera cookies i funkcji Omnibus",
      "Testy zamówienia, 1 runda poprawek, szkolenie 2 godziny",
      "Gwarancja na wykonane prace — 6 miesięcy"
    ]
  },
  "pro": {
    "id": "pro",
    "name": "PRO",
    "tag": "DLA ROZWIJAJĄCEGO SIĘ BIZNESU",
    "price": 4500,
    "featured": true,
    "description": "Więcej personalizacji, narzędzi marketingowych i integracji sprzedażowych.",
    "products": 20,
    "pagesLabel": "Komplet standardowych podstron",
    "revisions": 2,
    "training": "2 godziny",
    "warranty": "12 miesięcy",
    "delivery": "4–6 tygodni",
    "benefits": [
      "Wszystkie funkcje Standard",
      "Rozszerzona personalizacja motywu",
      "Wprowadzenie 20 produktów prostych",
      "Komplet podstron sklepu oraz blog",
      "Integracja InPost w cenie wdrożenia",
      "Google Analytics + Search Console"
    ],
    "excluded": [],
    "scope": [
      "Rozszerzone dopasowanie układu gotowych sekcji i nawigacji",
      "Komplet typowych stron sklepu — bez limitu 2 lub 4 podstron",
      "Wprowadzenie 20 produktów prostych",
      "Konfiguracja jednej głównej bramki płatności",
      "Podstawowe metody dostawy i konfiguracja InPost",
      "Blog, Google Analytics 4 i Google Search Console",
      "SEO techniczne, cookies i mechanizm Omnibus",
      "Szkolenie online 2 godziny + instrukcja PDF",
      "2 rundy poprawek, testy procesu zakupowego",
      "Gwarancja na wykonane prace — 12 miesięcy"
    ]
  },
  "business": {
    "id": "business",
    "name": "Business",
    "tag": "SKLEP DOPASOWANY DO FIRMY",
    "price": null,
    "description": "Indywidualne procesy, automatyzacje i integracje z systemami firmy.",
    "delivery": "Indywidualnie",
    "revisions": null,
    "warranty": "Do ustalenia",
    "benefits": [
      "Indywidualny zakres wdrożenia",
      "Integracje z systemami firmy",
      "Procesy B2B i automatyzacje",
      "Zaawansowane moduły i katalog produktów",
      "Migracja i synchronizacja danych",
      "Konsultacja i dedykowana wycena"
    ],
    "excluded": [],
    "scope": [
      "Dobór technologii i architektury według potrzeb",
      "Integracje z Base (BaseLinker), Sellasist, Subiekt GT lub Comarch ERP Optima",
      "Integracja z magazynem, hurtownią lub fulfillmentem",
      "Możliwość sprzedaży B2B i niestandardowych cenników",
      "Migracja sklepu i katalogu — po analizie źródła",
      "Zakres, termin i cena określane indywidualnie"
    ]
  }
};
  const addonDefs = [
  {
    "key": "inpost",
    "name": "Integracja InPost",
    "hint": "Konfiguracja paczkomatów; licencja zewnętrzna osobno",
    "price": 300,
    "category": "delivery",
    "includedIn": [
      "pro"
    ]
  },
  {
    "key": "courier",
    "name": "Integracja DPD / DHL",
    "hint": "Dodatkowa usługa dostawy; licencja zewnętrzna osobno",
    "price": 300,
    "category": "delivery"
  },
  {
    "key": "fulfillment",
    "name": "Usługa fulfillment",
    "hint": "Połączenie z zewnętrznym magazynem / operatorem realizacji",
    "price": null,
    "category": "delivery"
  },
  {
    "key": "stripe",
    "name": "Stripe",
    "hint": "Dodatkowy operator płatności, jeśli nie jest wybrany jako główny",
    "price": 250,
    "category": "payment",
    "paymentCode": "stripe"
  },
  {
    "key": "paypal",
    "name": "PayPal",
    "hint": "Dodatkowy operator płatności, jeśli nie jest wybrany jako główny",
    "price": 250,
    "category": "payment",
    "paymentCode": "paypal"
  },
  {
    "key": "klarna",
    "name": "Klarna",
    "hint": "Dodatkowy operator płatności, jeśli nie jest wybrany jako główny",
    "price": 250,
    "category": "payment",
    "paymentCode": "klarna"
  },
  {
    "key": "ifirma",
    "name": "iFirma",
    "hint": "Integracja z systemem księgowym / fakturami",
    "price": 250,
    "category": "accounting"
  },
  {
    "key": "fakturownia",
    "name": "Fakturownia",
    "hint": "Integracja i automatyczne wystawianie dokumentów",
    "price": 250,
    "category": "accounting"
  },
  {
    "key": "allegro",
    "name": "Allegro",
    "hint": "Integracja sprzedaży i ofert; wycena po poznaniu zakresu",
    "price": null,
    "category": "integration"
  },
  {
    "key": "baselinker",
    "name": "Base (dawniej BaseLinker)",
    "hint": "Integracja zamówień i sprzedaży wielokanałowej",
    "price": null,
    "category": "integration"
  },
  {
    "key": "sellassist",
    "name": "Sellasist",
    "hint": "Połączenie z narzędziem do zarządzania sprzedażą",
    "price": null,
    "category": "integration"
  },
  {
    "key": "subiekt",
    "name": "Subiekt GT",
    "hint": "Integracja z programem sprzedażowo-magazynowym",
    "price": null,
    "category": "integration"
  },
  {
    "key": "optima",
    "name": "Comarch ERP Optima",
    "hint": "Integracja z systemem ERP — wymaga analizy",
    "price": null,
    "category": "integration"
  },
  {
    "key": "fbLogin",
    "name": "Logowanie przez Facebook",
    "hint": "Logowanie społecznościowe i konfiguracja aplikacji Meta",
    "price": null,
    "category": "integration"
  },
  {
    "key": "blog",
    "name": "Blog firmowy",
    "hint": "Uruchomienie bloga i jego podstawowej struktury",
    "price": 249,
    "category": "content",
    "includedIn": [
      "pro"
    ]
  },
  {
    "key": "ga4",
    "name": "Google Analytics 4",
    "hint": "Konfiguracja analityki i podstawowego pomiaru",
    "price": 200,
    "category": "marketing",
    "includedIn": [
      "standard",
      "pro"
    ]
  },
  {
    "key": "gsc",
    "name": "Google Search Console",
    "hint": "Dodanie strony, weryfikacja domeny i ustawienia",
    "price": 99,
    "category": "marketing",
    "includedIn": [
      "pro"
    ]
  },
  {
    "key": "seoExpanded",
    "name": "Rozszerzone SEO e-commerce",
    "hint": "Dodatkowa optymalizacja kategorii i produktów",
    "price": null,
    "category": "marketing"
  },
  {
    "key": "tracking",
    "name": "Rozszerzony pomiar zakupów",
    "hint": "Zdarzenia e-commerce i ścieżka konwersji",
    "price": null,
    "category": "marketing"
  },
  {
    "key": "facebookShop",
    "name": "Sklep na Facebooku / Instagramie",
    "hint": "Katalog produktów Meta i synchronizacja",
    "price": null,
    "category": "marketing"
  },
  {
    "key": "abandoned",
    "name": "Porzucone koszyki",
    "hint": "Konfiguracja automatycznych przypomnień i zgód marketingowych",
    "price": null,
    "category": "marketing"
  },
  {
    "key": "care",
    "name": "Opieka techniczna",
    "hint": "Pakiet aktualizacji i wsparcia — zakres i koszt do wyceny",
    "price": null,
    "category": "service",
    "recurring": true
  }
];
  const customChoices = ["Zaawansowana personalizacja wyglądu","Integracja Allegro / Base (BaseLinker) / Sellasist","Subiekt GT / Comarch ERP Optima","Synchronizacja z hurtownią","Sprzedaż B2B i cenniki hurtowe","Fulfillment i automatyzacje","Migracja obecnego sklepu","Rozszerzony marketing i analityka"];
  const languageChoices = ["Angielski","Niemiecki","Ukraiński","Czeski","Francuski","Hiszpański","Włoski","Niderlandzki","Słowacki","Szwedzki","Norweski","Duński","Portugalski","Rumuński"];
  const paymentChoices = [["przelewy24","Przelewy24"],["payu","PayU"],["tpay","Tpay"],["paynow","PayNow"],["stripe","Stripe"],["paypal","PayPal"],["klarna","Klarna"]];
  const FINAL_STEP = 6;

  const defaults = () => ({simple:0,variable:0,pages:0,revisions:0,extras:{},primaryPayment:"przelewy24",languages:[],hosting:false,needs:[],businessNote:"",clientName:"",clientEmail:"",clientPhone:"",hasSite:false,clientSite:"",clientMessage:"",prepared:false,errors:[]});
  const states = Object.fromEntries(Object.keys(packages).map(id => [id,defaults()]));
  let current = packages.start, step = 0, direct = false, opener = null, originalBodyOverflow = "";
  const state = () => states[current.id];
  const isIncluded = (a) => !!((a.includedIn || []).includes(current.id) || (a.paymentCode && a.paymentCode === state().primaryPayment));
  const selectedExtras = () => addonDefs.filter(a => state().extras[a.key] && !isIncluded(a));
  const isCustom = () => current.price == null || state().languages.length>0 || selectedExtras().some(a=>a.price==null || a.custom);
  const price = () => {
    const s=state();
    if(current.price==null) return {base:null,extras:null,project:null,annual:null,custom:true,lineItems:[]};
    const lineItems = [
      ...(s.simple ? [{name:"Dodatkowe produkty proste × "+s.simple,cost:s.simple*15}]:[]),
      ...(s.variable ? [{name:"Wprowadzane produkty wariantowe × "+s.variable,cost:s.variable*30}]:[]),
      ...(s.pages ? [{name:"Dodatkowe niestandardowe podstrony × "+s.pages,cost:s.pages*200}]:[]),
      ...(s.revisions ? [{name:"Dodatkowe rundy poprawek × "+s.revisions,cost:s.revisions*150}]:[]),
      ...selectedExtras().filter(a=>a.price!=null).map(a=>({name:a.name,cost:a.price}))
    ];
    const extras=lineItems.reduce((sum,item)=>sum+item.cost,0);
    return {base:current.price,extras,project:current.price+extras,annual:s.hosting?399:0,custom:isCustom(),lineItems};
  };

  const buildCards = () => {
    const container=one("#ens-cards");
    container.innerHTML=Object.values(packages).map(p=>{
      const featured=p.featured;
      const short=p.price==null?'<div class="ens-price-custom">Wycena<br>indywidualna</div>':`<div class="ens-price">${money(p.price).replace(" zł","")} <span>zł netto</span></div>`;
      return `<article class="ens-card ${featured?"ens-featured":""}" data-card="${p.id}" aria-labelledby="ens-plan-${p.id}">
        ${featured?'<div class="ens-card-flag">POLECANY</div>':""}
        <div class="ens-card-kicker">${p.tag}</div><h3 id="ens-plan-${p.id}">${p.name}</h3><p class="ens-card-description">${p.description}</p>
        <div class="ens-price-wrap">${short}<p class="ens-price-note">${p.price==null?"Cena po poznaniu potrzeb projektu":"Jednorazowa opłata za projekt"}</p></div>
        <div class="ens-included"><p class="ens-included-label">CO ZYSKUJESZ</p><ul class="ens-features">${p.benefits.map(x=>`<li><span class="ens-tick" aria-hidden="true">✓</span><span>${x}</span></li>`).join("")}${p.excluded.map(x=>`<li class="ens-excluded"><span class="ens-tick" aria-hidden="true">−</span><span>${x}</span></li>`).join("")}</ul>
        <details class="ens-card-details" name="ens-card-scope"><summary>Pełen zakres pakietu</summary><ul>${p.scope.map(x=>`<li>${x}</li>`).join("")}</ul></details></div>
        <dl class="ens-meta"><div><dt>Czas realizacji</dt><dd>${p.delivery}</dd></div><div><dt>Rundy poprawek</dt><dd>${p.revisions==null?"Do ustalenia":p.revisions+" w cenie"}</dd></div></dl>
        <div class="ens-card-actions"><button class="ens-btn ens-btn-primary" type="button" data-plan="${p.id}" data-mode="direct"><span>${p.price==null?"Poproś o wycenę":"Wybieram pakiet"}</span><span aria-hidden="true">↗</span></button><button class="ens-btn ens-btn-outline" type="button" data-plan="${p.id}" data-mode="configure"><span>${p.price==null?"Określ potrzeby":"Skonfiguruj pakiet"}</span><span aria-hidden="true">⚙</span></button></div>
      </article>`;
    }).join("");
  };
  const paneIntro = (title,intro) => `<h2 class="ens-pane-title">${title}</h2><p class="ens-pane-intro">${intro}</p>`;
  const sec = (title,html) => `<section class="ens-form-section"><h3>${title}</h3>${html}</section>`;
  const counter = (key,label,hint,cost) => `<div class="ens-field-row">
    <div><div class="ens-field-name">${label}</div><p class="ens-field-help">${hint}</p></div>
    <div class="ens-field-end"><span class="ens-cost">${money(cost)}/szt.</span><div class="ens-stepper">
    <button type="button" data-counter="${key}" data-delta="-1" aria-label="Zmniejsz: ${label}">−</button><output aria-live="polite">${state()[key]}</output><button type="button" data-counter="${key}" data-delta="1" aria-label="Zwiększ: ${label}">+</button></div></div>
    </div>`;
  const switchRow = function switchRow(a) {
    const included=isIncluded(a),checked=included||!!state().extras[a.key],value=a.price===null?"Do wyceny":money(a.price);
    return `<div class="ens-field-row"><div><div class="ens-field-name">${a.name}</div><p class="ens-field-help">${a.hint}</p></div>
      <div class="ens-field-end"><span class="ens-cost ${included?"included":""}">${included?"W cenie":value}</span>
        ${included?'<span class="ens-pill">✓</span>':`<label class="ens-toggle"><input type="checkbox" data-addon="${a.key}" aria-label="${a.name}" ${checked?"checked":""}><span></span></label>`}</div></div>`;
};
  const field = (key,label,type="text",placeholder="",required=false) => {
    const invalid=state().errors.includes(key);
    const value=escapeHtml(state()[key]||"");
    return `<label class="ens-field">${label}${required?" *":""}<input type="${type}" data-client="${key}" ${required?"required":""} value="${value}" placeholder="${placeholder}" maxlength="${key==="clientMessage"?3000:500}" ${invalid?'aria-invalid="true"':""}></label>`;
  };
  function businessPane() {
    const s=state();
    return paneIntro("Opowiedz, jakiego sklepu potrzebujesz","Zaznacz interesujące Cię rozwiązania. Nie musisz znać szczegółów technicznych — dopracujemy je razem.")+
      `<div class="ens-business-hero"><strong>Business — wycena indywidualna</strong><p>Nie podajemy ceny z góry. Koszt przygotujemy na podstawie funkcji, integracji oraz potrzeb Twojego biznesu.</p></div>`+
      sec("Jakie możliwości są Ci potrzebne?",`<div class="ens-business-picks">${customChoices.map((t,i)=>`<label><input type="checkbox" data-business="${i}" ${s.needs.includes(i)?"checked":""}><span>${t}</span></label>`).join("")}</div>`)+
      sec("Dodatkowe informacje",`<label class="ens-field">Krótki opis sklepu<textarea rows="5" maxlength="3000" data-note="businessNote" placeholder="Co zamierzasz sprzedawać? Jakie integracje są ważne?">${escapeHtml(s.businessNote)}</textarea></label>`);
  }
  function languagesSection(){
  const options=languageChoices.filter(x=>!state().languages.includes(x));
  const chosen=state().languages.map(x=>`<span class="ens-language-chip">${x}<button type="button" data-remove-language="${escapeHtml(x)}" aria-label="Usuń język ${escapeHtml(x)}">×</button></span>`).join("");
  return `<div class="ens-language-picker"><select id="ens-language-select" aria-label="Wybierz dodatkowy język"><option value="">Wybierz język...</option>${options.map(x=>`<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join("")}</select><button type="button" class="ens-add-language" data-action="add-language" ${options.length?"":"disabled"}>+ Dodaj język</button></div><div class="ens-language-chips">${chosen}</div><p class="ens-field-help">Dodatkowe wersje językowe sklepu wymagają indywidualnej wyceny. Tłumaczenia tekstów i produktów nie są wliczone automatycznie.</p>`;
}
  function stepPane(){
    if(current.price===null)return businessPane();
    const p=current,s=state();
    if(step===0)return paneIntro("Co zawiera pakiet "+p.name+"?","Najważniejsze elementy pakietu są wliczone w cenę. W kolejnych krokach możesz wybrać rozszerzenia.")+
      `<div class="ens-included-box"><strong>${p.name} · ${money(p.price)} netto</strong><ul class="ens-bullet-list">${p.benefits.map(x=>`<li>${x}</li>`).join("")}</ul></div>`+
      sec("Zakres realizacji",`<div class="ens-field-row"><div class="ens-field-name">Wprowadzenie produktów prostych</div><span class="ens-pill">${p.products} w cenie</span></div><div class="ens-field-row"><div><div class="ens-field-name">Podstrony sklepu</div><p class="ens-field-help">Główna, katalog, produkt, koszyk, kasa, konto i typowe strony informacyjne</p></div><span class="ens-pill">Komplet</span></div><div class="ens-field-row"><div class="ens-field-name">Rundy poprawek</div><span class="ens-pill">${p.revisions} w cenie</span></div><div class="ens-field-row"><div class="ens-field-name">Szkolenie online</div><span class="ens-pill">${p.training}</span></div>`)+
      (p.id==="start"?sec("Szablon komercyjny",'<p class="ens-field-help">Sklep opiera się na gotowym motywie WooCommerce wybranym z bibliotek takich jak Envato Market lub TemplateMonster. Koszt licencji motywu i ewentualnych płatnych dodatków jest osobny. Wybór konkretnego motywu nastąpi podczas ustalania projektu.</p>'):"");
    if(step===1)return paneIntro("Produkty i zawartość","Dodaj produkty lub niestandardowe podstrony ponad standardowy zakres sklepu.")+
      sec("Wprowadzanie produktów",counter("simple","Dodatkowy produkt prosty","Ponad "+p.products+" produktów zawartych w pakiecie",15)+counter("variable","Produkt z wariantami","Praca przy wprowadzaniu produktu z wariantami; złożone konfiguracje wyceniamy osobno",30))+
      sec("Treści i dodatkowe strony",counter("pages","Dodatkowa niestandardowa podstrona","Komplet typowych podstron e-commerce jest już w cenie",200)+addonDefs.filter(a=>a.category==="content").map(switchRow).join(""))+
      '<p class="ens-compact-note">Nie ma limitu systemowego liczby produktów ani standardowych stron WooCommerce. Powyższe liczniki dotyczą wyłącznie dodatkowej pracy Eniverse.</p>';
    if(step===2)return paneIntro("Płatności i dostawa","Wybierz głównego operatora płatności. Dodatkowe integracje rozliczamy osobno.")+
      sec("Główna metoda płatności",`<label class="ens-field">Jedna integracja płatności w cenie <select data-primary-payment>${paymentChoices.map(([v,n])=>`<option value="${v}" ${s.primaryPayment===v?"selected":""}>${n}</option>`).join("")}</select></label><p class="ens-compact-note">Stripe, PayPal lub Klarna mogą być główną bramką — wtedy nie dopłacasz za ich podstawową konfigurację. Prowizje operatorów i wymagane usługi są płatne osobno.</p>`)+
      sec("Dodatkowe metody płatności",addonDefs.filter(a=>a.category==="payment").map(switchRow).join(""))+
      sec("Dostawa i logistyka",addonDefs.filter(a=>a.category==="delivery").map(switchRow).join(""));
    if(step===3)return paneIntro("Integracje z systemami","Połącz sklep z księgowością, marketplace lub narzędziami do automatyzacji sprzedaży.")+
      sec("Księgowość i faktury",addonDefs.filter(a=>a.category==="accounting").map(switchRow).join(""))+
      sec("Marketplace, ERP i konta klientów",addonDefs.filter(a=>a.category==="integration").map(switchRow).join(""))+
      '<p class="ens-compact-note">Wdrożenie integracji ERP, Base (BaseLinker), Sellasist i innych rozbudowanych systemów wymaga analizy. W podsumowaniu pojawi się informacja o dodatkowej wycenie.</p>';
    if(step===4)return paneIntro("SEO i marketing","Narzędzia wspierające analizę sprzedaży, pozyskiwanie klientów i powroty do koszyka.")+
      sec("Analityka, SEO i sprzedaż",addonDefs.filter(a=>a.category==="marketing").map(switchRow).join(""))+
      '<p class="ens-compact-note">Kampanie reklamowe i abonamenty zewnętrznych dostawców są niezależne od jednorazowej konfiguracji sklepu.</p>';
    if(step===5)return paneIntro("Języki, poprawki i opieka","Dostosuj wersje językowe, liczbę poprawek i usługi po wdrożeniu.")+
      sec("Dodatkowe wersje językowe",languagesSection())+
      sec("Dodatkowe poprawki",counter("revisions","Dodatkowa runda poprawek","Ponad "+p.revisions+" rundy w cenie pakietu",150))+
      sec("Hosting i opieka",`<div class="ens-field-row"><div><div class="ens-field-name">Hosting WooCommerce</div><p class="ens-field-help">399 zł netto / rok. Ewentualną promocję hostingu z domeną potwierdzimy przy zamówieniu.</p></div><div class="ens-field-end"><span class="ens-cost">399 zł/rok</span><label class="ens-toggle"><input type="checkbox" data-hosting ${s.hosting?"checked":""} aria-label="Dodaj hosting"><span></span></label></div></div>${addonDefs.filter(a=>a.category==="service").map(switchRow).join("")}`);
    return "";
}
  function summaryLines(){
 const s=state(),a=price();
 if(current.price===null)return `<div class="ens-summary-list"><div class="ens-summary-line"><span>Pakiet</span><strong>Business</strong></div><div class="ens-summary-line"><span>Rozliczenie</span><strong>Wycena indywidualna</strong></div>${s.needs.map(i=>`<div class="ens-summary-line"><span>${customChoices[i]}</span><strong>Do ustalenia</strong></div>`).join("")}</div>`;
 const base=`<div class="ens-summary-line"><span>Pakiet ${current.name}</span><strong>${money(a.base)}</strong></div><div class="ens-summary-line"><span>Podstrony typowego sklepu</span><strong>Komplet</strong></div><div class="ens-summary-line"><span>Produkty proste w cenie</span><strong>${current.products}</strong></div><div class="ens-summary-line"><span>Główna bramka płatności</span><strong>${paymentChoices.find(([code])=>code===s.primaryPayment)?.[1]||"Do ustalenia"}</strong></div>`;
 const more=a.lineItems.map(x=>`<div class="ens-summary-line"><span>${x.name}</span><strong>${money(x.cost)}</strong></div>`).join("");
 const custom=selectedExtras().filter(a=>a.price===null||a.custom).map(a=>`<div class="ens-summary-line"><span>${a.name}</span><strong>Do wyceny</strong></div>`).join("");
 const langs=s.languages.map(l=>`<div class="ens-summary-line"><span>Język: ${escapeHtml(l)}</span><strong>Do wyceny</strong></div>`).join("");
 return `<div class="ens-summary-list">${base}${more}${custom}${langs}${s.hosting?`<div class="ens-summary-line"><span>Hosting — 1 rok</span><strong>${money(a.annual)}</strong></div>`:""}</div>`;
}
  function summaryPane(){
 const s=state(),a=price(),biz=current.price===null;
 const customCount=selectedExtras().filter(x=>x.price===null||x.custom).length+s.languages.length;
 const total=biz?'<div class="ens-summary-total"><span>Wycena projektu</span><div><strong>Indywidualna</strong></div></div>':`<div class="ens-summary-total"><span>Projekt i dodatki jednorazowe</span><div><strong>${money(a.project)}</strong> netto</div>${a.annual?`<p class="ens-compact-note">Hosting: ${money(a.annual)}/rok — osobno od projektu</p>`:""}${a.custom?`<p class="ens-compact-note">Dodatkowo ${customCount} ${customCount===1?"opcja wymaga":"opcje wymagają"} indywidualnej wyceny.</p>`:""}<p class="ens-compact-note">Proponowana zaliczka 50%: ${money(a.project/2)} · Pozostała kwota: ${money(a.project/2)}</p></div>`;
 return paneIntro(biz?"Zapytaj o wycenę Business":"Twoja wycena — "+current.name,biz?"Podsumuj potrzeby i zostaw dane kontaktowe.":"Sprawdź pakiet i dodatki przed przygotowaniem zapytania.")+
   sec("Co wybrano",`<div class="ens-summary-collapsed"><div class="ens-summary-line"><span>Pakiet</span><strong>${current.name}</strong></div>${!biz?`<div class="ens-summary-line"><span>Standardowe podstrony</span><strong>Komplet</strong></div>`:""}<details class="ens-summary-expand"><summary>Pokaż szczegółowe elementy wyceny</summary>${summaryLines()}</details></div><p class="ens-change-link">${direct?'<button class="ens-action-link" type="button" data-action="configure">Potrzebujesz skonfigurować pakiet? Przejdź do konfiguratora ↗</button>':'<button class="ens-action-link" type="button" data-action="edit">Zmień konfigurację ↗</button>'}</p>`)+total+
   sec("Twoje dane kontaktowe",`<form id="ens-lead-form" novalidate><div class="ens-form-grid">
     ${field("clientName","Imię i nazwisko / firma","text","Np. Jan Kowalski",true)}
     ${field("clientEmail","Adres e-mail","email","kontakt@firma.pl",true)}
     ${field("clientPhone","Telefon (opcjonalnie)","tel","+48 000 000 000")}
     <label class="ens-field">Masz już sklep internetowy?<select data-client="hasSite"><option value="false" ${!s.hasSite?"selected":""}>Nie</option><option value="true" ${s.hasSite?"selected":""}>Tak</option></select></label>
     ${s.hasSite?`<div class="ens-full">${field("clientSite","Adres obecnego sklepu","url","https://twojsklep.pl")}</div>`:""}
     <label class="ens-field ens-full">Informacje o projekcie (opcjonalnie)<textarea data-client="clientMessage" rows="2" maxlength="3000" placeholder="Co zamierzasz sprzedawać?">${escapeHtml(s.clientMessage)}</textarea></label></div>
     <p class="ens-demo-message">Makieta demonstracyjna. Formularz nie wysyła wiadomości — pokaże gotową treść do skopiowania.</p>
     ${s.errors.length?'<p class="ens-error" role="alert">Uzupełnij wymagane pola i sprawdź adres e-mail oraz adres sklepu.</p>':""}
     <button type="submit" class="ens-btn ens-btn-primary ens-submit">Przygotuj podgląd zapytania <span aria-hidden="true">↗</span></button>
     ${s.prepared?`<div class="ens-success" id="ens-preview" role="status"><h3>Zapytanie przygotowane — nie zostało wysłane</h3><p>Skopiuj treść i prześlij ją do Eniverse.</p><textarea class="ens-preview-area" id="ens-quote-copy" readonly></textarea><button type="button" class="ens-btn ens-btn-outline" data-action="copy">Kopiuj treść zapytania</button></div>`:""}</form>`);
}
  function renderAside(){
    const a=price(), s=state();
    one("#ens-aside").innerHTML=`<span class="ens-quote-kicker">TWOJA WYCENA</span><h3 class="ens-quote-plan">Sklep ${current.name}</h3>`+
      (current.price==null?`<hr><p class="ens-quote-total">Wycena indywidualna</p><p class="ens-quote-label">Oferta po poznaniu potrzeb i integracji</p><hr><div class="ens-quote-line"><span>Wybrane obszary</span><strong>${s.needs.length}</strong></div>`:
       `<div class="ens-quote-line"><span>Cena pakietu</span><strong>${money(a.base)}</strong></div><div class="ens-quote-line"><span>Dodatki jednorazowe</span><strong>${money(a.extras)}</strong></div><hr><span class="ens-quote-kicker">PROJEKT + DODATKI</span><p class="ens-quote-total">${money(a.project)}</p><p class="ens-quote-label">netto · jednorazowo</p>${a.annual?`<hr><div class="ens-quote-line"><span>Hosting roczny</span><strong>${money(a.annual)}</strong></div>`:""}${a.custom?'<hr><p class="ens-compact-note">Część wybranych opcji wymaga osobnej wyceny.</p>':""}`)+
      `<p class="ens-aside-note">Przedstawione ceny dodatków są orientacyjne. Finalny koszt i warunki zostaną potwierdzone po ustaleniu szczegółów.</p>`;
  }
  function render(){
 const biz=current.price===null,final=step===FINAL_STEP;
 one("#ens-dialog-title").textContent=final?(biz?"Zapytanie o wycenę":"Podsumowanie — "+current.name):(biz?"Określ potrzeby — Business":"Konfigurator — "+current.name);
 one("#ens-dialog-subtitle").textContent=final?"Sprawdź wybrany zakres i przygotuj zapytanie.":"Dopasuj sklep do potrzeb Twojego biznesu.";
 one("#ens-steps").hidden=direct;
 const names=biz?["Zakres potrzeb","Podsumowanie"]:["Zakres","Produkty","Płatności","Integracje","Marketing","Języki","Podsumowanie"];
 const mapped=biz?(final?1:0):step;
 one("#ens-steps").innerHTML=names.map((n,i)=>`<div class="ens-step ${i===mapped?"is-active":i<mapped?"is-done":""}" ${i===mapped?'aria-current="step"':""}><span class="ens-step-num">${i<mapped?"✓":i+1}</span>${n}</div>`).join("");
 one("#ens-dialog-content").innerHTML=final?summaryPane():stepPane();
 one("#ens-dialog-foot").hidden=direct||final;
 one("#ens-prev").hidden=step===0;
 one("#ens-next").innerHTML=(biz||step===FINAL_STEP-1?"Podsumowanie":"Dalej")+' <span aria-hidden="true">→</span>';
 renderAside();
 if(final&&state().prepared)setPreviewText();
}
  function quoteText(){
 const s=state(),a=price();
 const lines=["ZAPYTANIE — SKLEP INTERNETOWY ENIVERSE","Pakiet: "+current.name,"","DANE KLIENTA","Firma / imię i nazwisko: "+s.clientName,"E-mail: "+s.clientEmail,"Telefon: "+(s.clientPhone||"Nie podano"),"Istniejący sklep: "+(s.hasSite?"Tak":"Nie")];
 if(s.clientSite)lines.push("Adres sklepu: "+s.clientSite);
 lines.push("","ZAKRES");
 if(current.price===null){
   s.needs.forEach(i=>lines.push("- "+customChoices[i]));
   if(s.businessNote)lines.push("Opis projektu: "+s.businessNote);
   lines.push("Cena: wycena indywidualna");
 }else{
   lines.push("Cena bazowa: "+money(a.base),"Standardowe podstrony sklepu: komplet","Produkty proste w pakiecie: "+current.products,"Główna bramka: "+(paymentChoices.find(([k])=>k===s.primaryPayment)?.[1]||"Brak"));
   a.lineItems.forEach(i=>lines.push("- "+i.name+": "+money(i.cost)));
   selectedExtras().filter(i=>i.price===null||i.custom).forEach(i=>lines.push("- "+i.name+": dodatkowa wycena"));
   s.languages.forEach(l=>lines.push("- Dodatkowy język "+l+": do wyceny"));
   lines.push("Dodatki z ustaloną ceną: "+money(a.extras),"Projekt i dodatki jednorazowe: "+money(a.project),"Hosting roczny: "+(a.annual?money(a.annual):"Nie wybrano"),"Zaliczka 50% (propozycja): "+money(a.project/2));
 }
 lines.push("","WIADOMOŚĆ KLIENTA",s.clientMessage||"Nie podano","","Podgląd demonstracyjny — żadna wiadomość nie została wysłana.");
 return lines.join("\n");
}
  function setPreviewText(){const el=one("#ens-quote-copy");if(el)el.value=quoteText();}
  function open(id,mode,button){
    if(!packages[id])return;
    opener=button||null;
    current=packages[id];
    direct=mode==="direct";
    if(direct)states[id]=defaults();
    step=direct?FINAL_STEP:0;
    originalBodyOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    one("#ens-overlay").hidden=false;
    render();
    one("#ens-close").focus();
  }
  function close(){
    one("#ens-overlay").hidden=true;
    document.body.style.overflow=originalBodyOverflow;
    opener?.focus();
  }
  function navigate(n){
    step=n;
    state().errors=[];
    state().prepared=false;
    render();
    const content=one("#ens-dialog-content");
    content.scrollTop=0;
    one(".ens-dialog-main").scrollTop=0;
  }
  function validate(){
    const s=state();
    const emailOk=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.clientEmail.trim());
    const urlOk=!s.hasSite||!s.clientSite||/^https?:\/\/[A-Za-z0-9.-]+\.[A-Za-z]{2,}(\/.*)?$/i.test(s.clientSite.trim());
    s.errors=[];
    if(!s.clientName.trim())s.errors.push("clientName");
    if(!emailOk)s.errors.push("clientEmail");
    if(!urlOk)s.errors.push("clientSite");
    return !s.errors.length;
  }
  root.addEventListener("click",event=>{
    const btn=event.target.closest("[data-plan][data-mode]");
    if(btn){open(btn.dataset.plan,btn.dataset.mode,btn);return;}
    const counterBtn=event.target.closest("[data-counter][data-delta]");
    if(counterBtn){
      const key=counterBtn.dataset.counter,delta=Number(counterBtn.dataset.delta),s=state();
      if(["simple","variable","pages","revisions"].includes(key)){
        s[key]=Math.max(0,Math.min(250,s[key]+delta));
        render();
      }
      return;
    }
    const remove=event.target.closest("[data-remove-language]");
    if(remove){state().languages=state().languages.filter(x=>x!==remove.dataset.removeLanguage);render();return;}
    const action=event.target.closest("[data-action]")?.dataset.action;
    if(action==="add-language"){
      const lang=one("#ens-language-select")?.value;
      if(lang&&languageChoices.includes(lang)&&!state().languages.includes(lang))state().languages.push(lang);
      render();return;
    }
    if(action==="configure"||action==="edit"){direct=false;navigate(0);return;}
    if(action==="copy"){
      const el=one("#ens-quote-copy");
      if(!el)return;
      el.focus();el.select();
      const copied=()=>{
        const b=event.target.closest("button");if(b)b.textContent="Skopiowano ✓";
      };
      if(navigator.clipboard && window.isSecureContext)navigator.clipboard.writeText(el.value).then(copied).catch(()=>{el.focus();el.select();});
      else {try{if(document.execCommand("copy"))copied();}catch{}}
    }
  });
  root.addEventListener("change",event=>{
    const t=event.target,s=state();
    if(t.dataset.addon){s.extras[t.dataset.addon]=t.checked;render();return;}
    if(t.hasAttribute("data-primary-payment")){s.primaryPayment=t.value;render();return;}
    if(t.hasAttribute("data-hosting")){s.hosting=t.checked;render();return;}
    if(t.hasAttribute("data-business")){
      const index=Number(t.dataset.business);
      s.needs=t.checked?[...new Set([...s.needs,index])]:s.needs.filter(x=>x!==index);
      renderAside();return;
    }
    if(t.dataset.client==="hasSite"){s.hasSite=t.value==="true";s.prepared=false;render();return;}
  });
  root.addEventListener("input",event=>{
    const t=event.target,s=state();
    if(t.dataset.client && t.dataset.client!=="hasSite"){
      s[t.dataset.client]=t.value;
      s.errors=s.errors.filter(k=>k!==t.dataset.client);
      s.prepared=false;
    }
    if(t.dataset.note)s[t.dataset.note]=t.value;
  });
  root.addEventListener("submit",event=>{
    if(event.target.id!=="ens-lead-form")return;
    event.preventDefault();
    if(!validate()){render();const invalid=one('[aria-invalid="true"]');invalid?.focus();return;}
    state().prepared=true;render();
    one("#ens-preview")?.scrollIntoView({behavior:"smooth",block:"nearest"});
  });
  one("#ens-next").addEventListener("click",()=>navigate(current.price==null?FINAL_STEP:Math.min(FINAL_STEP,step+1)));
  one("#ens-prev").addEventListener("click",()=>navigate(current.price==null?0:Math.max(0,step-1)));
  one("#ens-close").addEventListener("click",close);
  one("#ens-overlay").addEventListener("click",event=>{if(event.target===one("#ens-overlay"))close();});
  root.addEventListener("toggle",event=>{
    if(!event.target.matches?.(".ens-card-details")||!event.target.open)return;
    all(".ens-card-details").forEach(el=>{if(el!==event.target)el.open=false;});
  },true);
  document.addEventListener("keydown",event=>{
    if(one("#ens-overlay").hidden)return;
    if(event.key==="Escape"){event.preventDefault();close();return;}
    if(event.key!=="Tab")return;
    const visible=all("#ens-overlay button:not([disabled]),#ens-overlay input:not([disabled]),#ens-overlay textarea:not([disabled]),#ens-overlay select:not([disabled])").filter(el=>el.getClientRects().length);
    if(!visible.length)return;
    const first=visible[0],last=visible[visible.length-1];
    if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
  });
  // Equalize the closed card heights while keeping expanded details independent.
  // A temporary closed copy is measured, so an opened card never stretches its neighbors.
  const equalizeClosedCardHeights = () => {
    const container = one("#ens-cards");
    if (!container || !container.style || typeof container.querySelectorAll !== "function") return;
    const cards = [...container.querySelectorAll(".ens-card")];
    container.style.removeProperty("--ens-card-height");
    if (cards.length < 2 || (typeof window.matchMedia === "function" && window.matchMedia("(max-width: 760px)").matches)) return;
    let max = 0;
    for (const card of cards) {
      const width = card.getBoundingClientRect().width;
      if (!width) return;
      const copy = card.cloneNode(true);
      const details = copy.querySelector(".ens-card-details");
      if (details) details.open = false;
      copy.style.position = "absolute";
      copy.style.visibility = "hidden";
      copy.style.pointerEvents = "none";
      copy.style.minHeight = "0";
      copy.style.height = "auto";
      copy.style.width = width + "px";
      copy.setAttribute("aria-hidden", "true");
      container.appendChild(copy);
      max = Math.max(max, copy.getBoundingClientRect().height);
      copy.remove();
    }
    if (max) container.style.setProperty("--ens-card-height", Math.ceil(max) + "px");
  };
  buildCards();
  equalizeClosedCardHeights();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(equalizeClosedCardHeights);
  if (typeof ResizeObserver !== "undefined") {
    let lastWidth = 0;
    const observer = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width || 0;
      if (width && Math.abs(width - lastWidth) > 1) {
        lastWidth = width;
        equalizeClosedCardHeights();
      }
    });
    observer.observe(one("#ens-cards"));
  } else if (typeof window.addEventListener === "function") {
    window.addEventListener("resize", equalizeClosedCardHeights);
  }
})();
