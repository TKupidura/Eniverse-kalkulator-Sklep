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
    standard: {
      id:"standard", name:"Standard", tag:"NA DOBRY POCZĄTEK", price:2800, tagline:"Rozpocznij sprzedaż online", description:"Dla firm, które chcą rozpocząć sprzedaż w sieci bez dużej inwestycji.",
      products:10, pages:2, revisions:1, warranty:"6 miesięcy", delivery:"2–4 tygodnie",
      benefits:["Sklep WordPress + WooCommerce","Gotowy motyw dopasowany do marki","Wprowadzenie 10 produktów prostych","Koszyk i płatności online","Podstawowa konfiguracja dostaw","Szkolenie z obsługi — 2 godz."],
      excluded:["Blog i integracja InPost — dodatkowo"],
      scope:["Dostosowanie do urządzeń mobilnych","Zmiana logo, kolorów, fontów i zdjęć","Do 2 podstron informacyjnych","Warianty produktów obsługiwane przez WooCommerce","Kody rabatowe i stany magazynowe","Google Analytics 4 — podstawowa konfiguracja","Podstawowe SEO techniczne","Konfiguracja cookies i mechanizmu Omnibus","1 runda poprawek","Gwarancja na wykonane prace — 6 miesięcy","Testy składania zamówienia"]
    },
    pro: {
      id:"pro", name:"PRO", tag:"DLA ROZWIJAJĄCEGO SIĘ BIZNESU", price:4500, featured:true,
      tagline:"Więcej możliwości sprzedaży", description:"Dla firm, które potrzebują bardziej dopracowanego sklepu i dodatkowych narzędzi.",
      products:20, pages:4, revisions:2, warranty:"12 miesięcy", delivery:"4–6 tygodni",
      benefits:["Wszystko z pakietu Standard","Rozszerzona personalizacja motywu","Wprowadzenie 20 produktów prostych","Integracja InPost w cenie wdrożenia","Blog i 4 podstrony informacyjne","Google Search Console + Analytics 4"],
      excluded:[],
      scope:["Responsywny sklep WooCommerce","Rozszerzone dopasowanie gotowych sekcji","Wygodniejsza nawigacja i prezentacja produktów","Konfiguracja jednej bramki płatności","Podstawowe strefy i koszty wysyłki","Kody rabatowe, magazyn i raporty WooCommerce","Podstawowe SEO techniczne","Konfiguracja cookies i mechanizmu Omnibus","Szkolenie 2 godziny + instrukcja PDF","2 rundy poprawek","Gwarancja na wykonane prace — 12 miesięcy","Testy procesu zakupowego"]
    },
    business: {
      id:"business", name:"Business", tag:"SKLEP DOPASOWANY DO FIRMY", price:null,
      tagline:"Sklep na miarę Twojego biznesu", description:"Dla firm wymagających integracji, automatyzacji i niestandardowych rozwiązań.",
      delivery:"Indywidualnie", revisions:null, warranty:"Do ustalenia",
      benefits:["Indywidualny zakres wdrożenia","Integracje z zewnętrznymi systemami","Procesy B2B i automatyzacje","Zaawansowana konfiguracja sprzedaży","Rozszerzone funkcjonalności","Dedykowana konsultacja projektu"],
      excluded:[],
      scope:["Wycena po poznaniu zakresu projektu","Możliwość integracji z Allegro lub Base","Integracje z ERP, hurtownią i magazynem","Rozbudowane warianty, filtry i cenniki","Możliwe rozwiązania B2B i automatyzacje","Zakres realizacji ustalany indywidualnie"]
    }
  };
  const addonDefs = [
    {key:"inpost",name:"Integracja InPost",hint:"Konfiguracja dostawy do paczkomatów; ewentualna licencja osobno",price:300,category:"func",pro:true},
    {key:"secondPayment",name:"Dodatkowa bramka płatności",hint:"Konfiguracja kolejnego operatora płatności",price:250,category:"func"},
    {key:"courier",name:"Dodatkowa integracja kurierska",hint:"Konfiguracja DPD lub DHL; licencja osobno",price:300,category:"func"},
    {key:"invoices",name:"Automatyczne wystawianie faktur",hint:"Konfiguracja standardowego modułu",price:250,category:"func"},
    {key:"allegro",name:"Integracja Allegro",hint:"Zakres i koszty dodatkowych usług wymagają potwierdzenia",price:800,category:"func",custom:true},
    {key:"blog",name:"Blog",hint:"Uruchomienie i przygotowanie podstawowej struktury",price:249,category:"content",pro:true},
    {key:"gsc",name:"Google Search Console",hint:"Konfiguracja usługi i weryfikacja domeny",price:99,category:"marketing",pro:true},
    {key:"seoExpanded",name:"Rozszerzone SEO e-commerce",hint:"Optymalizacja kategorii i produktów — zakres do wyceny",price:null,category:"marketing"},
    {key:"tracking",name:"Rozszerzony pomiar e-commerce",hint:"Zdarzenia zakupowe i ścieżki konwersji — zakres do wyceny",price:null,category:"marketing"},
    {key:"care",name:"Opieka techniczna",hint:"Aktualizacje, kontrola i wsparcie — koszt do ustalenia",price:null,category:"marketing",recurring:true}
  ];
  const customChoices = ["Zaawansowana personalizacja wyglądu","Integracja z Allegro / Base","Integracja z ERP / magazynem","Synchronizacja z hurtownią","Sprzedaż B2B / cenniki hurtowe","Automatyzacje zamówień","Migracja obecnego sklepu","Rozszerzona analityka"];
  const defaults = () => ({simple:0,variable:0,pages:0,revisions:0,extras:{},hosting:false,needs:[],businessNote:"",clientName:"",clientEmail:"",clientPhone:"",hasSite:false,clientSite:"",clientMessage:"",prepared:false,errors:[]});
  const states = {standard:defaults(),pro:defaults(),business:defaults()};
  let current = packages.standard, step = 0, direct = false, opener = null, originalBodyOverflow = "";
  const state = () => states[current.id];
  const isIncluded = (a) => !!(current.id === "pro" && a.pro);
  const selectedExtras = () => addonDefs.filter(a => state().extras[a.key] && !isIncluded(a));
  const isCustom = () => current.price == null || selectedExtras().some(a=>a.price==null || a.custom);
  const price = () => {
    const s=state();
    if(current.price==null) return {base:null,extras:null,project:null,annual:null,custom:true};
    const lineItems = [
      ...(s.simple ? [{name:"Dodatkowe produkty proste × "+s.simple,cost:s.simple*15}]:[]),
      ...(s.variable ? [{name:"Wprowadzane produkty wariantowe × "+s.variable,cost:s.variable*30}]:[]),
      ...(s.pages ? [{name:"Dodatkowe podstrony × "+s.pages,cost:s.pages*200}]:[]),
      ...(s.revisions ? [{name:"Dodatkowe rundy poprawek × "+s.revisions,cost:s.revisions*150}]:[]),
      ...selectedExtras().filter(a=>a.price!=null).map(a=>({name:a.name,cost:a.price}))
    ];
    const extras=lineItems.reduce((acc,item)=>acc+item.cost,0);
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
  const switchRow = (a) => {
    const included=isIncluded(a), checked=included||!!state().extras[a.key];
    return `<div class="ens-field-row"><div><div class="ens-field-name">${a.name}</div><p class="ens-field-help">${a.hint}</p></div>
      <div class="ens-field-end"><span class="ens-cost ${included?"included":""}">${included?"W cenie":a.price==null?"Do wyceny":money(a.price)}</span>
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
  function stepPane(){
    if(current.price==null) return businessPane();
    const p=current;
    if(step===0) return paneIntro("Co zawiera pakiet "+p.name+"?","Poniżej najważniejsze elementy zawarte w cenie Twojego sklepu. Dodatki możesz wybrać w kolejnych krokach.")+
      `<div class="ens-included-box"><strong>${p.name} · ${money(p.price)} netto</strong><ul class="ens-bullet-list">${p.benefits.map(x=>`<li>${x}</li>`).join("")}</ul></div>`+
      sec("Parametry realizacji",`<div class="ens-field-row"><div><div class="ens-field-name">Wprowadzenie produktów prostych</div><p class="ens-field-help">Produkty dostarczone przez klienta</p></div><span class="ens-pill">${p.products} w cenie</span></div><div class="ens-field-row"><div class="ens-field-name">Podstrony informacyjne</div><span class="ens-pill">${p.pages} w cenie</span></div><div class="ens-field-row"><div class="ens-field-name">Rundy poprawek</div><span class="ens-pill">${p.revisions} w cenie</span></div><div class="ens-field-row"><div class="ens-field-name">Szkolenie online</div><span class="ens-pill">2 godz. w cenie</span></div>`)+
      sec("Ważne informacje",'<p class="ens-field-help">Dostępne funkcje WooCommerce (np. kody rabatowe, warianty, konto klienta) nie są osobno płatne. Dodatkowa opłata dotyczy wyłącznie pracy, konfiguracji, wprowadzania danych lub rozszerzeń. Indywidualny projekt graficzny od zera nie jest wliczony w cenę.</p>');
    if(step===1) return paneIntro("Produkty i funkcjonalności","Podaj dodatkową liczbę produktów do wprowadzenia przez Eniverse oraz wybierz potrzebne integracje.")+
      sec("Produkty",counter("simple","Dodatkowe produkty proste","Ponad "+p.products+" produktów zawartych w pakiecie",15)+counter("variable","Produkty z wariantami","Wprowadzanie produktów wariantowych (od 30 zł/szt.); złożone warianty wycenimy osobno",30))+
      sec("Płatności, dostawy i integracje",addonDefs.filter(a=>a.category==="func").map(switchRow).join(""))+
      '<p class="ens-compact-note">Opłaty operatorów płatności, kurierów i licencje wtyczek nie są zawarte w cenie konfiguracji.</p>';
    if(step===2) return paneIntro("Wygląd i zawartość","Rozszerz zawartość sklepu. Bazowy zakres personalizacji gotowego motywu jest w cenie Twojego pakietu.")+
      sec("Treści i podstrony",counter("pages","Dodatkowe podstrony informacyjne","Ponad "+p.pages+" podstrony w pakiecie",200)+addonDefs.filter(a=>a.category==="content").map(switchRow).join(""))+
      sec("Poprawki",counter("revisions","Dodatkowa runda poprawek","Ponad "+p.revisions+" rundy ujęte w pakiecie",150))+
      sec("Zakres prac",'<p class="ens-field-help">Personalizacja motywu obejmuje dopasowanie elementów istniejących w jego układzie. Projekty indywidualne, dodatkowe języki i niestandardowe funkcjonalności wymagają osobnej wyceny.</p>');
    if(step===3) return paneIntro("SEO, marketing i opieka","Uzupełnij sklep o narzędzia analityczne, SEO i usługi po wdrożeniu.")+
      sec("Marketing i SEO",addonDefs.filter(a=>a.category==="marketing").map(switchRow).join(""))+
      sec("Hosting",`<div class="ens-field-row"><div><div class="ens-field-name">Hosting WooCommerce</div><p class="ens-field-help">399 zł netto / rok. Promocja z pierwszym rokiem hostingu i domeną do potwierdzenia w ofercie.</p></div><div class="ens-field-end"><span class="ens-cost">399 zł/rok</span><label class="ens-toggle"><input type="checkbox" data-hosting ${state().hosting?"checked":""} aria-label="Dodaj hosting"><span></span></label></div></div>`)+
      sec("Co już masz w cenie?",'<ul class="ens-bullet-list"><li>Podstawowe SEO techniczne</li><li>Podstawowa konfiguracja Google Analytics 4</li><li>Testy procesu składania zamówienia</li><li>Szkolenie z obsługi WooCommerce — 2 godziny</li></ul>');
    return "";
  }
  function summaryLines(){
    const s=state(), a=price();
    if(current.price==null) return `<div class="ens-summary-list"><div class="ens-summary-line"><span>Pakiet</span><strong>Business</strong></div><div class="ens-summary-line"><span>Sposób rozliczenia</span><strong>Wycena indywidualna</strong></div>${s.needs.map(i=>`<div class="ens-summary-line"><span>${customChoices[i]}</span><strong>Do wyceny</strong></div>`).join("")}</div>`;
    const included=`<div class="ens-summary-line"><span>Produkty w cenie</span><strong>${current.products} prostych</strong></div><div class="ens-summary-line"><span>Podstrony w cenie</span><strong>${current.pages}</strong></div>`;
    const extras=a.lineItems.map(x=>`<div class="ens-summary-line"><span>${x.name}</span><strong>${money(x.cost)}</strong></div>`).join("");
    const custom=selectedExtras().filter(x=>x.price==null||x.custom).map(x=>`<div class="ens-summary-line"><span>${x.name}</span><strong>Do potwierdzenia</strong></div>`).join("");
    return `<div class="ens-summary-list"><div class="ens-summary-line"><span>Pakiet ${current.name}</span><strong>${money(a.base)}</strong></div>${included}${extras}${custom}${s.hosting?`<div class="ens-summary-line"><span>Hosting — 1 rok</span><strong>${money(a.annual)}</strong></div>`:""}</div>`;
  }
  function summaryPane(){
    const s=state(), a=price(), isBiz=current.price==null;
    const total=isBiz?'<div class="ens-summary-total"><span>Wycena projektu</span><div><strong>Indywidualna</strong></div></div>':`<div class="ens-summary-total"><span>Projekt i dodatki jednorazowe</span><div><strong>${money(a.project)}</strong> netto</div>${a.annual?`<p class="ens-compact-note">Hosting na pierwszy rok: ${money(a.annual)} netto (osobno od projektu)</p>`:""}${a.custom?'<p class="ens-compact-note">Wybrane elementy wymagają doprecyzowania i mogą zmienić finalną wycenę.</p>':""}<p class="ens-compact-note">Zaliczka 50% za projekt: ${money(a.project/2)} · Pozostała kwota: ${money(a.project/2)}</p></div>`;
    return paneIntro(isBiz?"Zapytaj o wycenę Business":"Twoja wycena — "+current.name,isBiz?"Podsumuj potrzeby i prześlij dane kontaktowe. Przygotujemy ofertę po ustaleniu szczegółów.":"Sprawdź, co zawiera wybrany pakiet i jakie dodatki zostały naliczone.")+
      sec("Co wybrano",summaryLines()+`<p class="ens-change-link">${direct?'<button class="ens-action-link" type="button" data-action="configure">Potrzebujesz skonfigurować pakiet? Przejdź do konfiguratora ↗</button>':'<button class="ens-action-link" type="button" data-action="edit">Zmień konfigurację ↗</button>'}</p>`)+total+
      sec("Twoje dane kontaktowe",`<form id="ens-lead-form" novalidate><div class="ens-form-grid">
        ${field("clientName","Imię i nazwisko / nazwa firmy","text","Np. Jan Kowalski",true)}
        ${field("clientEmail","Adres e-mail","email","kontakt@firma.pl",true)}
        ${field("clientPhone","Telefon (opcjonalnie)","tel","+48 000 000 000")}
        <label class="ens-field">Masz już sklep internetowy?<select data-client="hasSite"><option value="false" ${!s.hasSite?"selected":""}>Nie</option><option value="true" ${s.hasSite?"selected":""}>Tak</option></select></label>
        ${s.hasSite?`<div class="ens-full">${field("clientSite","Adres obecnego sklepu","url","https://twojsklep.pl")}</div>`:""}
        <label class="ens-field ens-full">Opisz swoje potrzeby (opcjonalnie)<textarea data-client="clientMessage" rows="3" maxlength="3000" placeholder="Co chcesz sprzedawać? Czy masz jakieś wymagania?">${escapeHtml(s.clientMessage)}</textarea></label>
        </div>
        <p class="ens-demo-message">To demonstracyjny formularz. Po kliknięciu przycisku zobaczysz gotową treść zapytania do skopiowania. Wiadomość nie zostanie wysłana do Eniverse.</p>
        ${s.errors.length?'<p class="ens-error" role="alert">Uzupełnij wymagane pola i sprawdź poprawność adresu e-mail oraz adresu sklepu.</p>':""}
        <button type="submit" class="ens-btn ens-btn-primary ens-submit">Przygotuj podgląd zapytania <span aria-hidden="true">↗</span></button>
        ${s.prepared?`<div class="ens-success" id="ens-preview" role="status"><h3>Zapytanie przygotowane — nie wysłano wiadomości</h3><p>Możesz skopiować treść i przesłać ją do agencji wybranym sposobem.</p><textarea class="ens-preview-area" id="ens-quote-copy" readonly></textarea><button type="button" class="ens-btn ens-btn-outline" data-action="copy">Kopiuj treść zapytania</button></div>`:""}
      </form>`);
  }
  function renderAside(){
    const a=price(), s=state();
    one("#ens-aside").innerHTML=`<span class="ens-quote-kicker">TWOJA WYCENA</span><h3 class="ens-quote-plan">Sklep ${current.name}</h3>`+
      (current.price==null?`<hr><p class="ens-quote-total">Wycena indywidualna</p><p class="ens-quote-label">Oferta po poznaniu potrzeb i integracji</p><hr><div class="ens-quote-line"><span>Wybrane obszary</span><strong>${s.needs.length}</strong></div>`:
       `<div class="ens-quote-line"><span>Cena pakietu</span><strong>${money(a.base)}</strong></div><div class="ens-quote-line"><span>Dodatki jednorazowe</span><strong>${money(a.extras)}</strong></div><hr><span class="ens-quote-kicker">PROJEKT + DODATKI</span><p class="ens-quote-total">${money(a.project)}</p><p class="ens-quote-label">netto · jednorazowo</p>${a.annual?`<hr><div class="ens-quote-line"><span>Hosting roczny</span><strong>${money(a.annual)}</strong></div>`:""}${a.custom?'<hr><p class="ens-compact-note">Część wybranych opcji wymaga osobnej wyceny.</p>':""}`)+
      `<p class="ens-aside-note">Przedstawione ceny dodatków są orientacyjne. Finalny koszt i warunki zostaną potwierdzone po ustaleniu szczegółów.</p>`;
  }
  function render(){
    const biz=current.price==null;
    one("#ens-dialog-title").textContent=step===4?(biz?"Zapytanie o wycenę":"Podsumowanie — "+current.name):(biz?"Określ potrzeby — Business":"Konfigurator — "+current.name);
    one("#ens-dialog-subtitle").textContent=step===4?"Zobacz wybrany zakres i przygotuj zapytanie.":"Dopasuj zakres sklepu do swoich potrzeb.";
    one("#ens-steps").hidden=direct;
    const names=biz?["Zakres potrzeb","Podsumowanie"]:["Zakres pakietu","Funkcje","Wygląd","SEO i opieka","Podsumowanie"];
    const mapped=biz?(step===4?1:0):step;
    one("#ens-steps").innerHTML=names.map((n,i)=>`<div class="ens-step ${i===mapped?"is-active":i<mapped?"is-done":""}" ${i===mapped?'aria-current="step"':""}><span class="ens-step-num">${i<mapped?"✓":i+1}</span>${n}</div>`).join("");
    one("#ens-dialog-content").innerHTML=step===4?summaryPane():stepPane();
    one("#ens-dialog-foot").hidden=direct || step===4;
    one("#ens-prev").hidden=step===0;
    one("#ens-next").innerHTML=(biz||step===3?"Podsumowanie":"Dalej")+' <span aria-hidden="true">→</span>';
    renderAside();
    if(step===4 && state().prepared) setPreviewText();
  }
  function quoteText(){
    const s=state(),a=price();
    const lines=["ZAPYTANIE — SKLEP INTERNETOWY ENIVERSE","Pakiet: "+current.name,"","DANE KLIENTA","Nazwa / imię i nazwisko: "+s.clientName,"E-mail: "+s.clientEmail,"Telefon: "+(s.clientPhone||"Nie podano"),"Istniejący sklep: "+(s.hasSite?"Tak":"Nie")];
    if(s.clientSite)lines.push("Adres sklepu: "+s.clientSite);
    lines.push("","ZAKRES");
    if(current.price==null){
      s.needs.forEach(i=>lines.push("- "+customChoices[i]));
      if(s.businessNote)lines.push("Opis projektu: "+s.businessNote);
      lines.push("Cena: wycena indywidualna");
    }else{
      lines.push("Cena bazowa: "+money(a.base),"Produkty proste w pakiecie: "+current.products,"Podstrony w pakiecie: "+current.pages);
      a.lineItems.forEach(i=>lines.push("- "+i.name+": "+money(i.cost)));
      selectedExtras().filter(x=>x.price==null||x.custom).forEach(i=>lines.push("- "+i.name+": wymaga potwierdzenia"));
      lines.push("Dodatki: "+money(a.extras),"Projekt i dodatki jednorazowe: "+money(a.project),"Hosting roczny: "+(a.annual?money(a.annual):"Nie wybrano"),"Zaliczka 50% (propozycja): "+money(a.project/2));
    }
    lines.push("","WIADOMOŚĆ KLIENTA",s.clientMessage||"Nie podano","","Ceny orientacyjne netto. Wysłanie zapytania nie nastąpiło — podgląd demonstracyjny.");
    return lines.join("\n");
  }
  function setPreviewText(){const el=one("#ens-quote-copy");if(el)el.value=quoteText();}
  function open(id,mode,button){
    if(!packages[id])return;
    opener=button||null;
    current=packages[id];
    direct=mode==="direct";
    if(direct)states[id]=defaults();
    step=direct?4:0;
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
    const action=event.target.closest("[data-action]")?.dataset.action;
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
  one("#ens-next").addEventListener("click",()=>navigate(current.price==null?4:Math.min(4,step+1)));
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
  buildCards();
})();
