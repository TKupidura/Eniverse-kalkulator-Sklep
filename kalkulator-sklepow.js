(() => {
        const root = document.getElementById("eni-shop-calc");
        if (!root || root.dataset.eniInitialized) return;
        root.dataset.eniInitialized = "true";
        const production = root.dataset.mode === "production";
        let modalPortal=null;
        const q = (s) => root.querySelector(s) || modalPortal?.querySelector(s) || null,
          all = (s) => [...root.querySelectorAll(s), ...(modalPortal ? modalPortal.querySelectorAll(s) : [])],
          money = (n) => new Intl.NumberFormat("pl-PL", {useGrouping:"always"}).format(n) + " zł";
        // Jedno źródło oferty: walidacja struktury i normalizacja danych.
        function validatePricing(c) {
          if (!c || typeof c !== "object") throw Error("Brak cennika");
          const idOK = x => typeof x==="string" && /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(x) && !["constructor","prototype","__proto__"].includes(x) && !(x in Object.prototype);
          const nameOK = x => typeof x==="string" && !!x.trim() && !/[<>]/.test(x);
          const priceOK = n => typeof n==="number" && Number.isFinite(n) && n>=0 && Number.isSafeInteger(Math.round(n*100)) && Math.abs(n*100-Math.round(n*100))<1e-6;
          const list = (key, ordered=false) => {
            if(!Array.isArray(c[key])) throw Error("Niepoprawna lista: "+key);
            const ids=new Set();
            for(const x of c[key]){
              if(!x || !idOK(x.id) || ids.has(x.id) || (key!=="pakiety"&&!nameOK(x.nazwa)) || !(key==="pakiety"&&(x.id==="mini"||(x.wycenaIndywidualna===true&&x.cena===null))?true:priceOK(x.cena))) throw Error("Niepoprawna pozycja: "+key);
              ids.add(x.id);
            }
            if(ordered && c[key].some((x,i)=>i && x.cena<c[key][i-1].cena)) throw Error("Warianty muszą być uporządkowane wg ceny: "+key);
          };
          for(const k of ["pakiety","dodatki","marketing","uslugiRoczne"])list(k);
          for(const k of ["seo","kontakt","szkolenia"])list(k,true);
          for(const p of c.pakiety){
            if(!Number.isInteger(p.revisions) || p.revisions<0 || !["subscription","optional","year"].includes(p.hosting)) throw Error("Niepoprawny zakres pakietu: "+p.id);
            if(p.id==="mini"){
              const a=p.platnosc;
              if(p.id!=="mini" || !a || !priceOK(a.miesiecznie)||!Number.isInteger(a.miesiecznie)||!priceOK(a.roczniePromocja)||!priceOK(a.rocznieRegularna)||a.roczniePromocja>a.rocznieRegularna) throw Error("Niepoprawne stawki abonamentu");
            }
          }
          const reserved=new Set(["training","sections","pages","seo","contact","revisions","billing","hosting","care","languages","templateId","annual"]);
          for(const x of [...c.dodatki,...c.marketing]){
            if(reserved.has(x.id)) throw Error("Powtórzone lub zarezerwowane id: "+x.id);
            reserved.add(x.id);
          }
          for(const x of [...c.dodatki,...c.marketing,...c.uslugiRoczne]){
            for(const key of ["wPakietach","dostepneWPakietach"])
              if(x[key]!==undefined&&(!Array.isArray(x[key])||x[key].some(id=>!idOK(id))))throw Error("Niepoprawne "+key+": "+x.id);
            if(x.dostepneWPakietach&&x.wPakietach?.some(id=>!x.dostepneWPakietach.includes(id)))throw Error("Usługa w cenie musi być dostępna: "+x.id);
          }
          if(!c.rozbudowa || typeof c.rozbudowa!=="object") throw Error("Brak rozbudowy");
          for(const [key,x] of Object.entries(c.rozbudowa))if(!["dodatkowaSekcja","dodatkowaPodstrona","dodatkowyJezyk","dodatkowaRundaPoprawek"].includes(key)||!x||!nameOK(x.nazwa)||!priceOK(x.cena))throw Error("Niepoprawna rozbudowa: "+key+"; nowe usługi dodawaj do dodatki");
          const u=c.ustawienia;
          if(!u||!Number.isInteger(u.okresAbonamentu)||u.okresAbonamentu<1||u.okresAbonamentu>120||
             typeof u.zaliczkaProcent!=="number"||!Number.isFinite(u.zaliczkaProcent)||u.zaliczkaProcent<0||u.zaliczkaProcent>100||
             typeof u.zaokraglanieRat!=="boolean"||typeof u.progZaokraglania!=="number"||!Number.isFinite(u.progZaokraglania)||u.progZaokraglania<0||u.progZaokraglania>1||
             Math.abs(u.progZaokraglania*100-Math.round(u.progZaokraglania*100))>1e-6)throw Error("Niepoprawne ustawienia rozliczeń");
          return c;
        }
        let cennik;
        try { cennik=validatePricing(window.ENIVERSE_CENNIK_SKLEPY); }
        catch(error) {
          console.error("Eniverse: sprawdź cennik-sklepow.js.",error);
          root.innerHTML='<p role="alert" class="ec-pricing-error">Kalkulator jest chwilowo niedostępny. Skontaktuj się z nami w sprawie wyceny.</p>';
          return;
        }
        const cardElements=all("#ec-catalog [data-ec-plan]");
        const cardIds=new Set(cardElements.map(c=>c.dataset.ecPlan));
        const activePricing=cennik.pakiety.filter(p=>cardIds.has(p.id));
        if(!activePricing.length){
          root.innerHTML='<p class="ec-pricing-error">Aktualnie brak dostępnych pakietów.</p>';
          return;
        }
        // Wspólna warstwa wszystkich modali, poza kontenerami Elementor/WordPress.
        const gallery=root.querySelector("#ec-template-modal"), wizard=root.querySelector("#ec-modal-stage");
        if(gallery && wizard){
          modalPortal=document.createElement("dialog");
          modalPortal.id="eni-shop-calc-portal";
          modalPortal.dataset.build = "20261127-shop-15";
            modalPortal.setAttribute("aria-label","Konfigurator Eniverse");
            modalPortal.addEventListener("cancel",event=>{
              event.preventDefault();
              if(!q("#ec-template-modal").hidden)closeTemplateDialog();
              else if(!q("#ec-modal-stage").hidden)close();
            });
          modalPortal.hidden=true;
          document.body.append(modalPortal);
          modalPortal.append(wizard,gallery);
        }
        function syncModalPortal(){
          if(!modalPortal)return;
          const closed=q("#ec-modal-stage").hidden && q("#ec-template-modal").hidden;
          if(closed){
            if(modalPortal.open && typeof modalPortal.close==="function")modalPortal.close();
            modalPortal.hidden=true;
            modalPortal.dataset.layer="closed";
            return;
          }
          modalPortal.hidden=false;
          if(typeof modalPortal.showModal==="function" && !modalPortal.open){
            try{modalPortal.showModal();}catch(error){console.error("Eniverse: nie udało się otworzyć natywnego modala",error);}
          }
          modalPortal.dataset.layer=modalPortal.matches(":modal")?"top-layer":"fallback";
        }
        const settings=cennik.ustawienia;
        const months=settings.okresAbonamentu;
        const depositPercent=settings.zaliczkaProcent;
        const remainingPercent=Number((100-depositPercent).toFixed(10));
        const monthLabel=n=>n===1?"1 miesiąc":n%10>=2&&n%10<=4&&!(n%100>=12&&n%100<=14)?n+" miesiące":n+" miesięcy";
        const contractPeriod=monthLabel(months);
        const annualPeriods=Array.from({length:Math.ceil(months/12)},(_,i)=>Math.min(12,months-i*12));
        const annualUnit=months<12?" / "+contractPeriod:" / rok";
        const prorate=(rate,n)=>Math.round(rate*100*n/12);
        const annualBaseCents=(regular=false)=>annualPeriods.reduce((sum,n,i)=>sum+prorate(regular||i>0?aboPricing.regularAnnual:aboPricing.annual,n),0);
        const contractBase=(billing,regular=false)=>billing==="annual"?annualBaseCents(regular)/100:Math.round(aboPricing.monthly*100)*months/100;
        const variants=(items,emptyLabel)=>{
          const result=items.map(x=>({...x}));
          if(!result.length || result[0].cena!==0)result.unshift({id:"__none",nazwa:emptyLabel,opis:"Brak w bazie pakietu",cena:0});
          return result;
        };
        const seoConfig=variants(cennik.seo,"Bez dodatkowego SEO");
        const contactConfig=variants(cennik.kontakt,"Bez dodatkowego kontaktu");
        const trainingConfig=variants(cennik.szkolenia,"Brak szkolenia");
        const indexOfVariant=(list,id)=>Math.max(0,list.findIndex(x=>x.id===id));
        const seo=seoConfig.map(x=>[x.nazwa,x.opis||"",x.cena]);
        const contacts=contactConfig.map(x=>[x.nazwa,x.opis||"",x.cena]);
        const trainingOptions=trainingConfig.map(x=>[x.nazwa,x.cena]);
        const abo=cennik.pakiety.find(p=>p.id==="mini")?.platnosc;
        const aboPricing={monthly:abo?.miesiecznie??0,annual:abo?.roczniePromocja??0,regularAnnual:abo?.rocznieRegularna??0};
        // Treści i zakres opisowy pochodzą z boxa HTML. Cennik zawiera tylko dane ofertowe.
        const packages=activePricing.map(p=>{
          const card=cardElements.find(x=>x.dataset.ecPlan===p.id),d=card.dataset;
          const recurring=p.id==="mini";
          return {
            ...p,recurring,name:card.querySelector("[data-card-name]").textContent.trim(),
            price:recurring?aboPricing.monthly:(p.wycenaIndywidualna?0:p.cena), individual:p.wycenaIndywidualna===true,
            structure:d.scopeStructure||"",chips:(d.scopeChips||"").split("|").filter(Boolean),
            tech:d.scopeTech||"",design:d.scopeDesign||"",content:d.scopeContent||"",
            panel:d.scopePanel==="true",rights:d.scopeRights||"",nav:d.scopeNav==="true",
            days:Number(d.scopeDays)||0,terms:(d.scopeTerms||"")+(recurring?" na "+contractPeriod:""),
            galeria:!!card.querySelector("[data-templates-open]"),
            seo:indexOfVariant(seoConfig,p.seo),contact:indexOfVariant(contactConfig,p.kontakt),
            trainingIndex:indexOfVariant(trainingConfig,p.szkolenie),
            training:recurring?"Brak szkolenia":trainingOptions[indexOfVariant(trainingConfig,p.szkolenie)][0],
            includedAddons:Object.fromEntries(cennik.dodatki.map(x=>[x.id,(x.wPakietach||[]).includes(p.id)]))
          };
        });
        // Wyświetlana nazwa SEO tylko w pakietach One Page i Wizytówka.
        // Ceny oraz zakres wariantów pozostają niezmienione.
        function seoName(p, index) {
          const name = seo[index][0];
          return (p.id === "one" || p.id === "wiz")
            ? name.replace(/ na start$/, "")
            : name;
        }
        const hostingText = p => {
          const base=annualServices.filter(x=>annualIncluded(p,x.id));
          if(base.length) return base.map(x=>x.nazwa).join(" + ")+(p.recurring?" na okres abonamentu":" w cenie na pierwszy rok");
          return annualServices.some(x=>annualAvailable(p,x.id))?"Usługi roczne opcjonalne, płatne z góry":"";
        };
        // Ceny dodatków: stawki robocze netto, do potwierdzenia przed wdrożeniem.
        const extraServices=cennik.dodatki.map(x=>[x.id,x.nazwa,x.cena,Array.isArray(x.wPakietach)]);
        const seoServices=cennik.marketing.map(x=>[x.id,x.nazwa,x.cena,x.opis||""]);
        const serviceConfigs=new Map([...cennik.dodatki,...cennik.marketing].map(x=>[x.id,x]));
        const serviceIncluded=(p,id)=>!!serviceConfigs.get(id)?.wPakietach?.includes(p.id);
        const serviceAvailable=(p,id)=>serviceIncluded(p,id)||!serviceConfigs.get(id)?.dostepneWPakietach||serviceConfigs.get(id).dostepneWPakietach.includes(p.id);
        const annualServices=cennik.uslugiRoczne;
        const annualHosting=annualServices.find(x=>x.id==="hosting")?.cena??0;
        const annualCare=annualServices.find(x=>x.id==="care")?.cena??0;
        const annualIncluded=(p,id)=>!!annualServices.find(x=>x.id===id)?.wPakietach?.includes(p.id)||(annualServices.some(x=>x.id===id)&&(id==="hosting"?p.hosting!=="optional":id==="care"&&p.hosting==="year"));
        const annualAvailable=(p,id)=>annualIncluded(p,id)||!annualServices.find(x=>x.id===id)?.dostepneWPakietach||annualServices.find(x=>x.id===id).dostepneWPakietach.includes(p.id);
        const annualSelected=(p,st,id)=>annualAvailable(p,id)&&(annualIncluded(p,id)||!!st.annual[id]);
        const annualExtras=(p,st)=>annualServices.filter(x=>annualSelected(p,st,x.id)&&!annualIncluded(p,x.id));
        const annualName=(id,fallback)=>annualServices.find(x=>x.id===id)?.nazwa||fallback;
        const expansion=cennik.rozbudowa;
        const languagePrice=expansion.dodatkowyJezyk?.cena??0;
        const sectionPrice=expansion.dodatkowaSekcja?.cena??0;
        const pagePrice=expansion.dodatkowaPodstrona?.cena??0;
        const revisionPrice=expansion.dodatkowaRundaPoprawek?.cena??0;
        // Etykiety statycznego HTML korzystają z tego samego źródła cen co wycena.
        const displayPrices = {...aboPricing, hostingWithCare:annualHosting + annualCare};
        all("[data-contract-period]").forEach(el=>el.textContent=contractPeriod);
        all("[data-cennik]").forEach(el => {
          el.textContent = money(displayPrices[el.dataset.cennik]) + (el.dataset.cennikSuffix || "");
        });
        q("#ec-mini-monthly-price").textContent = money(aboPricing.monthly);
        q("#ec-mini-annual-price").textContent = money(aboPricing.annual);
        q("#ec-monthly-rate").textContent = money(aboPricing.monthly) + " / mies.";
        q("#ec-annual-rate").textContent = money(aboPricing.annual) + " / rok · promocja";
        const languageChoices = [
          "Angielski","Niemiecki","Ukraiński","Francuski","Hiszpański",
          "Włoski","Czeski","Niderlandzki","Portugalski","Szwedzki",
          "Norweski","Rosyjski","Chiński","Arabski"
        ];
        const revisionText = (n) =>
          n === 0
            ? "Brak sesji poprawek"
            : n === 1
              ? "1 sesja poprawek w cenie"
              : n + " sesje poprawek w cenie";
        function fixed(p) {
          if(p.individual) return [["Zakres, integracje i harmonogram do indywidualnego ustalenia",true]];
          const a = [
            [p.structure,true],
            ["Koszyk, płatności i podstawowa dostawa",true],
            ["Sklep dopasowany do urządzeń mobilnych", true],
            [p.tech, true],
            [p.design, true],
            [p.content, true],
            ["Panel administracyjny", p.panel],
            [
              p.panel
                ? "Samodzielna edycja tekstów i zdjęć"
                : "Brak edycji treści",
              p.panel,
            ],
            [p.rights, true],
            [
              p.days ? `Czas realizacji: do ${p.days} dni roboczych od otrzymania kompletu materiałów` : "Czas realizacji: do zatwierdzenia w wycenie",
              true,
            ],
            [p.terms, true],
            ...(p.recurring ? [[p.training, false]] : []),
          ];
          if (p.nav)
            a.push([
              "Zaplanowanie nawigacji i ścieżki kontaktu dopasowanej do celów firmy",
              true,
            ]);
          return a;
        }
        // Boxy są kompletnym HTML. Nie tworzymy ani nie zastępujemy ich struktury.
        function hasTemplateLibrary(p) { return !!p && !!packages.find(x=>x.id===p.id)?.galeria; }
        function bindCards(){
          const known=new Map(packages.map(p=>[p.id,p])),seen=new Set();
          cardElements.forEach(card=>{
            const p=known.get(card.dataset.ecPlan);
            card.hidden=!p||seen.has(card.dataset.ecPlan);
            if(card.hidden)return;
            seen.add(p.id);
            const fields={
              price:p.individual?"Wycena indywidualna":money(p.price).replace(" zł",""),
              monthly:String(aboPricing.monthly),annual:String(aboPricing.annual),
              regularAnnual:money(aboPricing.regularAnnual),
              revisions:p.individual?"Do ustalenia":p.revisions?p.revisions+" w cenie":"Brak w cenie"
            };
            card.querySelectorAll("[data-card-field]").forEach(el=>{
              const key=el.dataset.cardField;
              if(Object.hasOwn(fields,key))el.textContent=fields[key];
              if(key==="regularAnnual")el.setAttribute("aria-label","Poprzednia cena: "+fields[key]+" netto za rok");
            });
            card.querySelectorAll("[data-card-hosting]").forEach(el=>el.hidden=!annualServices.some(x=>x.id==="hosting"&&annualIncluded(p,x.id)));
            card.querySelectorAll("[data-card-training-reference]").forEach(el=>{
              el.hidden=!cennik.szkolenia.length;
              if(p.training!==el.dataset.cardTrainingReference)el.textContent=p.training;
            });
            const annual=annualServices.filter(x=>annualAvailable(p,x.id));
            const serviceFields={
              hosting:[hostingText(p),annual.some(x=>annualIncluded(p,x.id)),!!annual.length],
              seo:[seoName(p,p.seo),p.seo!==0,!!cennik.seo.length],
              contact:[contacts[p.contact][0],true,!!cennik.kontakt.length],
              revisions:[revisionText(p.revisions),p.revisions!==0,true],
              training:[p.training,true,!!cennik.szkolenia.length&&p.training!=="Brak szkolenia"]
            };
            card.querySelectorAll("[data-card-service],[data-card-addon]").forEach(el=>{
              let value;
              if(el.hasAttribute("data-card-addon")){
                const id=el.dataset.cardAddon,addon=serviceConfigs.get(id);
                value=[addon?.nazwa||"",true,!!addon&&serviceIncluded(p,id)];
              }else value=serviceFields[el.dataset.cardService];
              if(!value)return;
              const [label,included,visible]=value;
              el.hidden=!visible;
              const text=el.querySelector("[data-card-label]");
              if(text)text.textContent=label;
              el.classList.toggle("ec-off",!included);
              const tick=el.querySelector(".ec-tick");
              if(tick)tick.textContent=included?"":"−";
            });
          });
          q(".ec-package-group--entry").hidden=!cardElements.some(c=>!c.hidden&&c.closest("#ec-entry-packages"));
          q(".ec-package-group--main").hidden=!cardElements.some(c=>!c.hidden&&c.closest("#ec-packages"));
        }
        bindCards();

        // Poglądowe makiety: docelowe miniatury i projekty można podmienić tutaj.
        // Siedem projektów demonstracyjnych z ZIP-ów użytkownika. Grafiki są osadzone lokalnie
        // w kodzie kalkulatora, więc galeria działa również bez WordPress API.
        const bundledTemplateSamples = [];
        // Demo ZIP-y działają jako pełne strony HTML bez instalacji wtyczki.
        const bundledPreviewFiles = Object.freeze({
          "zip-foto-01":"demos/fotograf.html",
          "zip-med-02":"demos/medycyna.html",
          "zip-rest-03":"demos/restauracja.html",
          "zip-fach-07":"demos/fachowcy.html",
          "zip-beauty-06":"demos/salon-spa.html",
          "zip-trener-08":"demos/trener-personalny.html",
          "zip-agent-04":"demos/agent-nieruchomosci.html"
        });
        bundledTemplateSamples.forEach(t=>{t.previewPath=bundledPreviewFiles[t.id]||"";});
        let templateSamples = production ? [] : [...bundledTemplateSamples];
        // Teksty wszystkich pięciu sekcji są przykładowe i można je podmienić
        // na gotowe szablony bez zmiany mechanizmu galerii oraz konfiguratora.
        const templateDetails = {
          foto: {
            eyebrow:"Fotografia z emocjami",aboutTitle:"Wasza historia. Moje spojrzenie.",
            about:"Każda sesja to inne emocje i historia. Tworzę fotografie bez sztucznych póz, z uwagą na gesty, relacje i prawdziwe chwile.",
            cards:[["Portrety","Naturalne zdjęcia w Twoim stylu."],["Sesje rodzinne","Wspólne momenty, które warto zachować."],["Reportaże","Autentyczna historia ważnego dnia."]],
            proofTitle:"Kadry, do których się wraca.",proof:"„Atmosfera sesji była swobodna, a zdjęcia dokładnie takie, jak marzyliśmy.”",
            contactTitle:"Opowiedz mi o swoim pomyśle.",contact:"Napisz, jaką sesję planujesz. Razem stworzymy coś osobistego."
          },
          food: {
            eyebrow:"Nasza restauracja",aboutTitle:"Smak zaczyna się od pasji.",
            about:"Gotujemy z sezonowych składników i w dobrym towarzystwie. Nasze menu łączy proste receptury z nieoczywistymi pomysłami.",
            cards:[["Przystawki","Mały początek wielkich smaków."],["Dania główne","Sezonowa kuchnia pełna charakteru."],["Desery","Słodkie zakończenie spotkania."]],
            proofTitle:"Miejsce na dobre spotkania.",proof:"„Pyszne jedzenie, świetna atmosfera. Wracamy przy każdej okazji!”",
            contactTitle:"Zarezerwuj miejsce przy stole.",contact:"Zapraszamy na lunch, kolację i wspólne świętowanie."
          },
          beauty: {
            eyebrow:"Poznaj nasz salon",aboutTitle:"Pielęgnacja z uważnością.",
            about:"Tworzymy przestrzeń, w której można zwolnić i zatroszczyć się o siebie. Łączymy sprawdzone zabiegi z indywidualnym podejściem.",
            cards:[["Pielęgnacja twarzy","Naturalny blask i odnowa."],["Stylizacja","Detale, które robią różnicę."],["Rytuały relaksu","Chwila tylko dla Ciebie."]],
            proofTitle:"Twoje dobre samopoczucie.",proof:"„Przepiękne miejsce i cudowna atmosfera. Wrócę na pewno!”",
            contactTitle:"Znajdź chwilę dla siebie.",contact:"Zadzwoń lub napisz i wybierz dogodny termin wizyty."
          },
          trade: {
            eyebrow:"Poznaj Voltix",aboutTitle:"Solidność w każdym połączeniu.",
            about:"Zapewniamy wsparcie przy instalacjach, modernizacjach i awariach. Stawiamy na jasne zasady, porządną pracę i terminowość.",
            cards:[["Instalacje","Nowe i modernizowane instalacje elektryczne."],["Naprawy","Sprawna diagnostyka i usuwanie usterek."],["Pomiary","Kontrole i niezbędna dokumentacja."]],
            proofTitle:"Fachowo, terminowo, bez niespodzianek.",proof:"„Kontakt był szybki, wszystko wykonane starannie. Polecam!”",
            contactTitle:"Potrzebujesz elektryka?",contact:"Opisz zlecenie i zostaw numer telefonu. Oddzwonimy."
          }
        };
        function escapeTemplateText(value) {
          return String(value==null?"":value).replace(/[&<>"']/g,ch=>({
            "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
          })[ch]);
        }
        function templateHttpsUrl(value) {
          if(typeof value!=="string"||!value)return "";
          try {
            const url=new URL(value);
            return url.protocol==="https:"&&!url.username&&!url.password?url.href:"";
          } catch {return "";}
        }
        function hasEmbeddedTemplateBadge(t) {
          return t.isBundled && ["zip-foto-01","zip-med-02","zip-rest-03","zip-fach-07","zip-beauty-06","zip-agent-04"].includes(t.id);
        }
        function templateNewTabLink(t) {
          const url=t.isBundled?t.previewPath:templateHttpsUrl(t.preview_url);
          if(!url)return "";
          return '<a class="ec-template-new-tab" href="'+escapeTemplateText(url)+'" target="_blank" rel="noopener noreferrer" aria-label="Otwórz szablon '+escapeTemplateText(t.name)+' w nowej karcie">Podgląd demo <span aria-hidden="true">↗</span></a>';
        }
        function templateScene(t, full = false) {
          if(t.isBundled || t.isRemote) {
            const image=t.isBundled?t.image:templateHttpsUrl(t.thumbnail_url);
            const preview=t.isBundled?t.previewPath:templateHttpsUrl(t.preview_url);
            if(!full) return image
              ? '<img class="ec-template-real-thumbnail" loading="lazy" src="'+escapeTemplateText(image)+'" alt="Miniatura szablonu '+escapeTemplateText(t.name)+'">'
              : '<span class="ec-template-real-placeholder">'+escapeTemplateText(t.name)+'</span>';
            if(preview) return '<iframe class="ec-template-project-frame" src="'+escapeTemplateText(preview)+'" title="Podgląd projektu '+escapeTemplateText(t.name)+'" loading="lazy" sandbox="'+(t.isBundled?'allow-scripts allow-forms allow-popups':'allow-scripts')+'" referrerpolicy="no-referrer"></iframe>';
            if(image) return '<img class="ec-template-project-image" src="'+escapeTemplateText(image)+'" alt="Podgląd szablonu '+escapeTemplateText(t.name)+'">';
            return '<p class="ec-template-unavailable">Podgląd tego projektu nie został jeszcze opublikowany.</p>';
          }
          const d=templateDetails[t.id];
          const hero='<section class="ec-template-scene ec-template-scene--'+t.id+(full?' ec-template-scene--full':'')+'">' +
            '<div class="ec-template-site-nav"><strong>'+t.brand+'</strong><span>O nas &nbsp; Oferta &nbsp; Kontakt</span></div>' +
            '<div class="ec-template-hero"><div class="ec-template-copy"><small>'+t.type+'</small><div class="ec-template-headline">'+t.headline+'</div><p>'+t.sub+'</p><span class="ec-template-cta">'+t.cta+' &nbsp;↗</span></div>' +
            '<div class="ec-template-art" aria-hidden="true"><span></span><i></i></div></div>' +
            '<div class="ec-template-site-footer"><span>'+t.footer+'</span><span>01 / 05</span></div></section>';
          if (!full) return hero;
          const services=d.cards.map((card,i)=>'<article class="ec-template-demo-card"><span>0'+(i+1)+'</span><div class="ec-template-demo-card-art" aria-hidden="true"></div><h4>'+card[0]+'</h4><p>'+card[1]+'</p></article>').join('');
          return '<div class="ec-template-fullpage ec-template-scene--'+t.id+'">' + hero +
            '<section class="ec-template-demo-section ec-template-demo-about"><div class="ec-template-demo-index">02 / O NAS</div><div class="ec-template-demo-about-grid"><div><small>'+d.eyebrow+'</small><h2>'+d.aboutTitle+'</h2><p>'+d.about+'</p></div><div class="ec-template-demo-image" aria-hidden="true"><span></span></div></div></section>' +
            '<section class="ec-template-demo-section ec-template-demo-offer"><div class="ec-template-demo-index">03 / OFERTA</div><h2>Co możemy dla Ciebie zrobić?</h2><div class="ec-template-demo-cards">'+services+'</div></section>' +
            '<section class="ec-template-demo-section ec-template-demo-proof"><div class="ec-template-demo-index">04 / OPINIE</div><h2>'+d.proofTitle+'</h2><blockquote>'+d.proof+'</blockquote><div class="ec-template-demo-stars" aria-hidden="true">★★★★★</div></section>' +
            '<section class="ec-template-demo-section ec-template-demo-contact"><div class="ec-template-demo-index">05 / KONTAKT</div><h2>'+d.contactTitle+'</h2><p>'+d.contact+'</p><span class="ec-template-demo-contact-button">'+t.cta+' &nbsp;↗</span><div class="ec-template-demo-contact-end">'+t.brand+' <span>Przykładowy szablon / Eniverse</span></div></section>' +
            '</div>';
        }
        function templateSelectionName(id) {
          if(id==="later")return "Szablon wybiorę później";
          const found=templateSamples.find(t=>t.id===id);
          return found ? found.name+" — "+found.type : "Jeszcze nie wybrano";
        }
        let visibleTemplateIndex=0;
        function renderTemplateSelection() {
          const section=q("#ec-template-section");
          if(!section)return;
          section.hidden=!hasTemplateLibrary(current);
          q("#ec-template-options").setAttribute("aria-label","Wybór szablonu pakietu "+current.name);
          if(section.hidden)return;
          const selected=states[current.id].templateId||"";
          q("#ec-template-options").innerHTML =
            (templateSamples.length?"":'<p class="ec-template-unavailable">Aktualnie brak opublikowanych szablonów. Możesz zaznaczyć „Szablon wybiorę później”.</p>')+
            templateSamples.map(t=>
              '<div class="ec-template-select-card">' +
                '<label class="ec-template-select-option"><input type="radio" name="ec-template-choice" value="'+t.id+'" '+(selected===t.id?'checked ':'')+'>' +
                '<span class="ec-template-select-dot ec-template-select-dot--'+t.id+(hasEmbeddedTemplateBadge(t)?' ec-template-crop-badge':'')+'" aria-hidden="true">'+(t.isBundled?'<img src="'+t.image+'" alt="">':t.isRemote&&templateHttpsUrl(t.thumbnail_url)?'<img src="'+escapeTemplateText(templateHttpsUrl(t.thumbnail_url))+'" alt="">':'')+'</span>'+
                '<span class="ec-template-tile-text"><strong>'+escapeTemplateText(t.name)+'</strong><small>'+escapeTemplateText(t.type)+'</small>'+
                '<span class="ec-template-select-description">'+escapeTemplateText(t.details)+'</span></span></label>' +
                '<div class="ec-template-select-actions"><button class="ec-template-preview-action" type="button" data-template-preview="'+t.id+'" aria-label="Zobacz podgląd szablonu '+escapeTemplateText(t.name)+'">Zobacz podgląd</button>'+'</div>' +
              '</div>'
            ).join('') +
            '<label class="ec-template-select-option ec-template-select-empty ec-template-select-later">' +
              '<input type="radio" name="ec-template-choice" value="later" '+(selected==="later"?'checked ':'')+'>' +
              '<span><strong>Szablon wybiorę później</strong><small>Wybierz tę opcję świadomie, jeśli decyzję podejmiesz później. Formularz zostanie odblokowany.</small></span></label>';
          q("#ec-template-selected").textContent=selected
            ? (selected==="later" ? "Wybrano: szablon wybiorę później." : "Wybrany szablon: "+templateSelectionName(selected))
            : "Nie wskazano jeszcze szablonu ani opcji wyboru później.";
        }
        let templateOpener=null, templatePreviousScroll=false, templateDialogPlanId="mini";
        function showTemplate(index) {
          const t=templateSamples[index];
          if(!t){
            visibleTemplateIndex=-1;
            q("#ec-template-viewport").innerHTML='<p class="ec-template-unavailable">Aktualnie brak opublikowanych szablonów. Wybierz opcję „Szablon wybiorę później”.</p>';
            q("#ec-template-configure").hidden=true;
            q("#ec-template-external").innerHTML="";
            q("#ec-template-external").hidden=true;
            return;
          }
          q("#ec-template-configure").hidden=false;
          const external=q("#ec-template-external");
          external.innerHTML=templateNewTabLink(t);
          external.hidden=!external.firstElementChild;
          visibleTemplateIndex=index;
          q("#ec-template-viewport").innerHTML=templateScene(t,true);
          q("#ec-template-viewport").scrollTop=0;

          
          all("#ec-template-gallery .ec-template-choice").forEach((button,i)=>{
            button.classList.toggle("is-active",i===index);
            button.setAttribute("aria-pressed",String(i===index));
          });
        }
        function renderTemplateGallery() {
          q("#ec-template-gallery").innerHTML=templateSamples.map((t,i)=>
            '<div class="ec-template-gallery-item"><button type="button" class="ec-template-choice" data-template-index="'+i+'" aria-pressed="'+(i===0)+'"><span class="ec-template-thumb'+(hasEmbeddedTemplateBadge(t)?' ec-template-crop-badge':'')+'">'+templateScene(t)+'</span><span class="ec-template-choice-label"><strong>'+escapeTemplateText(t.name)+'</strong><small>'+escapeTemplateText(t.type)+'</small></span></button></div>'
          ).join("");
          showTemplate(0);
        }
        renderTemplateGallery();
        // Publiczny katalog WordPress: bez tokenów i adresów archiwów ZIP.
        // Niedostępne / puste API -> lokalna biblioteka 7 podglądów ZIP.
        async function loadWordPressTemplates() {
          const apiUrl=root.dataset.templatesApi ||
            window.ENIVERSE_TEMPLATES_API ||
            "https://eniverse.pl/wp-json/eniverse/v1/templates";
          const resolvedApi = new URL(apiUrl, document.baseURI).href;
          if(!templateHttpsUrl(resolvedApi))return;
          const controller=new AbortController();
          const timeout=setTimeout(()=>controller.abort(),6000);
          try {
            const response=await fetch(resolvedApi,{method:"GET",mode:"cors",credentials:"omit",cache:"no-store",signal:controller.signal});
            if(!response.ok)throw new Error("API WordPress HTTP "+response.status);
            const payload=await response.json();
            const data=Array.isArray(payload)?payload:payload?.templates;
            if(!Array.isArray(data))throw new Error("Niepoprawny format API szablonów");
            const next=data.slice(0,100)
              .filter(t=>t&&typeof t.id==="string"&&/^wp-\d+$/.test(t.id)&&typeof t.name==="string"&&t.name.trim())
              .map(t=>({
                id:t.id,
                name:t.name.trim().slice(0,120),
                type:String(t.type||"Strona internetowa").slice(0,100),
                details:String(t.details||"Szablon z biblioteki Eniverse.").slice(0,500),
                thumbnail_url:templateHttpsUrl(t.thumbnail_url),
                preview_url:templateHttpsUrl(t.preview_url),
                isRemote:true
              }));
            // Publikacja szablonu z WordPress zastępuje jego lokalną wersję demo.
            const published=new Set(next.map(t=>t.name.trim().toLocaleLowerCase("pl-PL")));
            templateSamples=production ? next : [...next,...bundledTemplateSamples.filter(t=>!published.has(t.name.trim().toLocaleLowerCase("pl-PL")))];
            packages.filter(hasTemplateLibrary).map(p=>p.id).forEach(planId=>{
              const selected=states[planId].templateId;
              if(selected&&selected!=="later"&&!templateSamples.some(t=>t.id===selected))
                states[planId].templateId="";
            });
            renderTemplateGallery();
            if(hasTemplateLibrary(current)&&!q("#ec-modal-stage").hidden){
              renderTemplateSelection();
              if(!q("#ec-final").hidden)summary(directSummaryMode);
            }
          } catch(error) {
            console.warn("Eniverse: nie udało się pobrać szablonów z WordPress.",error);
          } finally {clearTimeout(timeout);}
        }
        // Galeria szablonów WWW nie jest aktywna dla sklepów.
        function openTemplateDialog(button) {
          templateOpener=button||null;
          const requestedPlan=!q("#ec-modal-stage").hidden
            ? current.id
            : (button?.dataset.templatePlan || button?.closest("[data-ec-plan]")?.dataset.ecPlan || current.id);
          if(!states[requestedPlan]||!hasTemplateLibrary(packages.find(p=>p.id===requestedPlan)))return;
          templateDialogPlanId=requestedPlan;
          templatePreviousScroll=document.body.classList.contains("eni-shop-calc-scroll-locked");
          document.body.classList.add("eni-shop-calc-scroll-locked");
          q("#ec-template-modal").hidden=false;
          syncModalPortal();
          const selectedId=states[templateDialogPlanId].templateId;
          const selectedIndex=templateSamples.findIndex(t=>t.id===selectedId);
          showTemplate(selectedIndex>=0?selectedIndex:visibleTemplateIndex);
          q("#ec-template-defer").classList.toggle("is-selected",selectedId==="later");
          q("#ec-template-defer").setAttribute("aria-pressed",String(selectedId==="later"));
          q("#ec-template-configure").textContent=
            (!q("#ec-modal-stage").hidden && !q("#ec-final").hidden)
              ? "Wybierz ten szablon i wróć do podsumowania ↗"
              : "Wybierz ten szablon i konfiguruj ↗";
          q("#ec-template-close").focus({preventScroll:true});
        }
        function closeTemplateDialog() {
          q("#ec-template-modal").hidden=true;
          syncModalPortal();
          document.body.classList.toggle("eni-shop-calc-scroll-locked",templatePreviousScroll);
          templateOpener?.focus({preventScroll:true});
        }
        q("#ec-template-gallery").addEventListener("click",event=>{
          const button=event.target.closest("[data-template-index]");
          if(button)showTemplate(+button.dataset.templateIndex);
        });
        q("#ec-template-close").addEventListener("click",closeTemplateDialog);
        q("#ec-template-modal").addEventListener("click",event=>{
          if(event.target===q("#ec-template-modal"))closeTemplateDialog();
        });
        function confirmTemplateChoice(id) {
          // "" oznacza brak decyzji; "later" jej świadome odłożenie.
          states[templateDialogPlanId].templateId=id;
          const wizardVisible=!q("#ec-modal-stage").hidden;
          const originalOpener=templateOpener;
          closeTemplateDialog();
          if(wizardVisible && current.id===templateDialogPlanId){
            renderTemplateSelection();
            update();
            if(!q("#ec-final").hidden){
              summary(directSummaryMode);
              q("#ec-summary").scrollTop=0;
            }else{
              q("#ec-template-options input:checked")?.focus();
            }
          }else{
            open(templateDialogPlanId,false,originalOpener);
            renderTemplateSelection();
          }
        }
        q("#ec-template-configure").addEventListener("click",()=>{
          const t=templateSamples[visibleTemplateIndex];
          if(t)confirmTemplateChoice(t.id);
        });
        q("#ec-template-defer").addEventListener("click",()=>{
          confirmTemplateChoice("later");
        });
        document.addEventListener("keydown",event=>{
          if(q("#ec-template-modal").hidden)return;
          if(event.key==="Escape"){event.preventDefault();closeTemplateDialog();return;}
          if(event.key!=="Tab")return;
          const buttons=all("#ec-template-modal button:not([disabled])").filter(el=>el.getClientRects().length>0);
          const first=buttons[0],last=buttons[buttons.length-1];
          if(!first||!last)return;
          if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
          else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
        });
        q("#ec-catalog").addEventListener("click",event=>{
          const button=event.target.closest("[data-templates-open]");
          if(button)openTemplateDialog(button);
        });
// Ujednolicenie wysokości wszystkich pięciu kart w stanie zwiniętym.
        // Otwarty szczegół nadal zwiększa tylko wysokość wybranej karty.
        let equalizeFrame = null;
        function equalizePackageHeights() {
          const catalog = q("#ec-catalog");
          if (q("#ec-demo-page").hidden) return;
          const cards = all("#ec-packages .ec-package").filter(card=>!card.hidden);
          if (!cards.length) return;
          const opened = all("#ec-catalog .ec-card-details[open]");
          catalog.style.removeProperty("--ec-equal-card-height");
          opened.forEach(details => { details.open = false; });
          // Osobna karta Abonament ma poziomy układ i nie uczestniczy w wyrównywaniu.
          const height = Math.ceil(Math.max(...cards.map(card => card.getBoundingClientRect().height)));
          catalog.style.setProperty("--ec-equal-card-height", height + "px");
          // Po wyrównaniu wysokości zapamiętaj faktyczny pusty odstęp NAD metadanymi.
          // Przy otwieraniu szczegółów nie może on się zmniejszyć i podciągać przycisków.
          cards.forEach(card => {
            const meta = card.querySelector(".ec-card-meta");
            const preceding = meta?.previousElementSibling;
            if (!meta || !preceding) return;
            const freeSpace = Math.max(0,
              meta.getBoundingClientRect().top - preceding.getBoundingClientRect().bottom);
            card.style.setProperty("--ec-meta-fixed-gap", freeSpace.toFixed(2) + "px");
          });
          opened.forEach(details => { details.open = true; });
        }
        function scheduleEqualizePackageHeights() {
          if (equalizeFrame !== null) cancelAnimationFrame(equalizeFrame);
          equalizeFrame = requestAnimationFrame(() => {
            equalizeFrame = null;
            equalizePackageHeights();
          });
        }
        scheduleEqualizePackageHeights();
        window.addEventListener("resize", scheduleEqualizePackageHeights, { passive: true });
        window.addEventListener("load", scheduleEqualizePackageHeights);
        if (document.fonts?.ready) document.fonts.ready.then(scheduleEqualizePackageHeights);
        // Dodatkowe zabezpieczenie: tylko jeden zakres jest otwarty naraz.
        // Po kliknięciu poza rozwiniętą listą Abonament zamknij ją bez zmiany rozmiaru karty.
        q("#ec-catalog").addEventListener("click", event => {
          const details=q("#ec-entry-packages .ec-card-details");
          if(details?.open && !details.contains(event.target)) details.open=false;
        });
        // Escape zamyka podpowiedź; ponowne najechanie lub fokus ją przywraca.
        q("#ec-catalog").addEventListener("keydown", event => {
          const tip=event.target.closest(".ec-meta-tip");
          if(tip && event.key==="Escape"){tip.classList.add("ec-tip-dismissed");event.stopPropagation();}
        });
        all("#ec-catalog .ec-meta-tip").forEach(tip=>{
          tip.addEventListener("pointerenter",()=>tip.classList.remove("ec-tip-dismissed"));
          tip.addEventListener("focusin",()=>tip.classList.remove("ec-tip-dismissed"));
        });
        q("#ec-catalog").addEventListener("toggle", event => {
          const opened = event.target;
          if (!opened.matches?.(".ec-card-details") || !opened.open) return;
          all(".ec-card-details").forEach(other => { if (other !== opened) other.open = false; });
        }, true);
        function trainingBase(p) { return p.trainingIndex; }
        function trainingLabel() {
          return trainingOptions[states[current.id].training][0];
        }
        function trainingCharge() {
          const p = current;
          return Math.max(
            0,
            trainingOptions[states[p.id].training][1] -
              trainingOptions[trainingBase(p)][1],
          );
        }
        function fillTraining() {
          const p = current,
            state = states[p.id],
            base = trainingBase(p);
          q("#ec-training-section").hidden = !cennik.szkolenia.length;
          q("#ec-training-base").textContent = p.recurring
            ? p.name + ": brak szkolenia w bazie. Możesz wybrać dostępny wariant."
            : "W cenie pakietu: " + trainingOptions[base][0] +
              ". Możesz wybrać inny wariant — dopłata dotyczy tylko wyższej opcji.";
          q("#ec-training").innerHTML = trainingOptions
            .map((option, i) => {
              const price = option[1],
                extra = Math.max(0, price - trainingOptions[base][1]),
                selected = i === state.training,
                isBase = i === base,
                label = isBase
                  ? (p.recurring ? "Domyślnie · bezpłatnie" : "W cenie pakietu")
                  : i < base
                    ? "Wariant krótszy · bez obniżenia ceny pakietu"
                    : "Cena: " + money(price) + " · dopłata za rozszerzenie";
              const badge = isBase
                ? (p.recurring ? "0 zł" : "W cenie")
                : extra ? "+" + money(extra) : "Bez dopłaty";
              return `<label class="ec-option ec-interactive"><input type="radio" name="ec-training" value="${i}" ${selected ? "checked" : ""}><span><strong>${escapeTemplateText(option[0])}</strong><small>${label}</small></span><span class="ec-tag">${badge}</span></label>`;
            })
            .join("");
        }

        const defaults = (p) => ({
          training: trainingBase(p),
          sections: 0,
          pages: 0,
          seo: p.seo,
          contact: p.contact,
          revisions: 0,
          billing: "monthly",
          hosting: false,
          care: annualServices.some(x=>x.id==="care") && p.hosting === "year",
          languages: [],
          templateId: "",
          annual:{},
          ...Object.fromEntries(extraServices.map(([key,,,included])=>[key,!!(included&&p.includedAddons[key])])),
          ...Object.fromEntries(seoServices.map(([key])=>[key,serviceIncluded(p,key)])),
        });
        const states = Object.fromEntries(
          packages.map((p) => [p.id, defaults(p)]),
        );
        let current = packages[0],
          opener = null;
        function optionGroup(id, name, items, base, selected) {
          q(id).innerHTML = items
            .map((x, i) => {
              const disabled = i < base,
                extra = x[2] - items[base][2];
              return `<label class="ec-option ec-interactive ${disabled ? "ec-dim" : ""}"><input type="radio" name="${name}" value="${i}" ${i === selected ? "checked" : ""} ${disabled ? "disabled" : ""}><span><strong>${escapeTemplateText(x[0])}</strong><small>${disabled ? "Wariant poniżej bazy pakietu" : escapeTemplateText(x[1])}</small></span><span class="ec-tag">${disabled ? "—" : extra > 0 ? "+" + money(extra) : "W cenie"}</span></label>`;
            })
            .join("");
        }
        function renderLanguages() {
          const selected = states[current.id].languages || [];
          // Gdy lista jest pusta, pokazujemy pierwszy wyłączony przełącznik.
          const rows = selected.length ? selected : [null];
          q("#ec-language-rows").innerHTML = rows.map((language, index) => {
            const enabled = !!language;
            const chosen = enabled ? language : languageChoices[0];
            const choices = languageChoices.filter(name => name === chosen || !selected.includes(name));
            const options = choices.map(name =>
              '<option value="' + name + '"' + (name === chosen ? ' selected' : '') + '>' + name + '</option>'
            ).join('');
            return '<div class="ec-language-row" data-language-index="' + index + '">' +
              '<label class="ec-language-switch-label ec-interactive">' +
              '<input type="checkbox" role="switch" class="ec-language-toggle" aria-label="Dodaj język numer ' +
              (index + 1) + '" ' + (enabled ? 'checked ' : '') + '>' +
              '<span class="ec-toggle-track" aria-hidden="true"></span>' +
              '<span>' + (index ? escapeTemplateText(expansion.dodatkowyJezyk?.nazwa||'Dodaj język')+' '+(index+1) : escapeTemplateText(expansion.dodatkowyJezyk?.nazwa||'Dodaj język')) + '</span></label>' +
              '<select class="ec-language-select ec-language-choice" aria-label="Wybierz język numer ' +
              (index + 1) + '"' + (enabled ? '' : ' disabled') + '>' + options + '</select>' +
              '</div>';
          }).join('');
          const addButton = q("#ec-add-language");
          addButton.disabled = !selected.length || selected.length === languageChoices.length;
          addButton.textContent = selected.length === languageChoices.length
            ? "Dodano wszystkie dostępne języki" : "+ Dodaj kolejny język";
        }
        function fill() {
          const p = current,
            s = states[p.id];
          q("#ec-shop-needs-wrap").hidden=!p.individual;
          q("#ec-shop-needs").value=s.needs||"";
          fillTraining();
          q("#ec-badge").textContent = "Wybrany pakiet: " + p.name;
          q("#ec-title").textContent = "Dopasuj pakiet " + p.name + ".";
          q("#ec-subtitle").textContent =
            p.individual?"Zakres i ceny zostaną ustalone po konsultacji.":"Zakres bazowy jest już uwzględniony w cenie.";
          q("#ec-scope").innerHTML = fixed(p)
            .filter((x) => x[1])
            .map(
              (x) =>
                `<label><input type="checkbox" checked disabled><span>${x[0]}</span></label>`,
            )
            .join("");
          q("#ec-excluded").textContent =
            "Poza bazą: " +
            fixed(p)
              .filter((x) => !x[1])
              .map((x) => x[0])
              .join(", ") +
            (fixed(p).some((x) => !x[1])
              ? "."
              : "brak dodatkowych wyłączeń w tej sekcji.");
          renderTemplateSelection();
          q("#ec-billing-section").hidden = !p.recurring;
          q("#ec-structure").textContent =
            p.structure + ". Dodatki naliczane ponad zakres bazowy.";
          q("#ec-chips").innerHTML = p.chips
            .map((x) => `<span class="ec-chip">✓ ${x}</span>`)
            .join("");
          q("#ec-sections").value = s.sections;
          q("#ec-pages").value = s.pages;
          all('[name="ec-billing"]').forEach(
            (e) => (e.checked = e.value === s.billing),
          );
          optionGroup("#ec-seo", "ec-seo", seo.map((variant,i) => [seoName(p,i), variant[1], variant[2]]), p.seo, s.seo);
          const availableMarketing=seoServices.filter(([key])=>serviceAvailable(p,key));
          q("#ec-seo-extras").closest(".ec-seo-services").hidden=!availableMarketing.length;
          q("#ec-seo").hidden=!cennik.seo.length;
          q("#ec-seo").closest(".ec-section").hidden=!cennik.seo.length&&!availableMarketing.length;
          q("#ec-contact").closest(".ec-section").hidden=!cennik.kontakt.length;
          q("#ec-seo-extras").innerHTML = availableMarketing.map(([key,label,price,description]) =>
            '<label class="ec-addon ec-seo-addon ec-interactive">' +
            '<span class="ec-addon-content"><strong>' + escapeTemplateText(label) + '</strong><small>' + escapeTemplateText(description) +
            (serviceIncluded(p,key)?' · W cenie pakietu':' · +' + money(price)) + '</small></span>' +
            '<input class="ec-toggle" type="checkbox" role="switch" id="ec-seo-addon-' + key +
            '" aria-label="' + escapeTemplateText(label) + '" ' + (s[key]||serviceIncluded(p,key) ? 'checked ' : '') + (serviceIncluded(p,key)?'disabled ':'') + '>' +
            '<span class="ec-toggle-track" aria-hidden="true"></span></label>'
          ).join("");
          optionGroup(
            "#ec-contact",
            "ec-contact",
            contacts,
            p.contact,
            s.contact,
          );
          q("#ec-revisions-base").textContent =
            revisionText(p.revisions) +
            ". Jedna sesja = jeden zbiorczy zestaw uwag.";
          q("#ec-revisions").innerHTML = [0, 1, 2, 3]
            .map(
              (n) =>
                `<label class="ec-option ec-interactive"><input type="radio" name="ec-revisions" value="${n}" ${n === s.revisions ? "checked" : ""}><span><strong>${n === 0 ? "Bez dodatkowych sesji" : n === 1 ? "+1 sesja" : n === 2 ? "+2 sesje" : "+3 sesje"}</strong><small>${n ? "+" + money(n * revisionPrice) + " · łącznie " + (p.revisions + n) + " sesji" : "Zakres bazowy · " + p.revisions + " sesji"}</small></span></label>`,
            )
            .join("");
          // Dodatki po prawej stronie listy elementów objętych pakietem.
          const availableExtras=extraServices.filter(([key])=>serviceAvailable(p,key));
          q("#ec-addons").parentElement.hidden=!availableExtras.length;
          q("#ec-addons").innerHTML = availableExtras.map(([key,label,price,mayBeIncluded]) => {
            const included = mayBeIncluded && !!p.includedAddons[key];
            const checked = included || !!s[key];
            return '<label class="ec-addon ec-interactive"><span class="ec-addon-content"><strong>' +
              escapeTemplateText(label) + '</strong><small>' + (included ? 'W cenie pakietu' : '+' + money(price)) +
              '</small></span><input class="ec-toggle" type="checkbox" role="switch" id="ec-addon-' +
              key + '" ' + (checked ? 'checked ' : '') + (included ? 'disabled ' : '') +
              '><span class="ec-toggle-track" aria-hidden="true"></span></label>';
          }).join("");
          renderLanguages();
          const availableAnnual=annualServices.filter(x=>annualAvailable(p,x.id));
          q("#ec-hosting").closest(".ec-section").hidden=!availableAnnual.length;
          q("#ec-hosting").innerHTML='<div class="ec-service-list">'+availableAnnual.map(x=>{
            const included=annualIncluded(p,x.id),checked=annualSelected(p,s,x.id);
            return '<label class="ec-checkbox ec-interactive"><input type="checkbox" id="ec-annual-'+x.id+'" '+(checked?'checked ':'')+(included?'disabled ':'')+'><span><strong>'+escapeTemplateText(x.nazwa)+'</strong><small>'+(included?(p.hosting==="year"?"W cenie przez pierwszy rok":"W cenie pakietu"):money(x.cena)+" / rok"+(p.recurring?" · za okres umowy w abonamencie":""))+'</small></span></label>';
          }).join("")+'</div>';
          for(const [key,id] of [["dodatkowaSekcja","sections"],["dodatkowaPodstrona","pages"]]){
            const row=q("#ec-"+id).closest(".ec-counter-row");
            row.hidden=!expansion[key];
            row.querySelector("[data-expansion-label]").textContent=expansion[key]?.nazwa||"";
          }
          q("#ec-revisions").closest(".ec-section").hidden=!expansion.dodatkowaRundaPoprawek;
          q("#ec-revisions").closest(".ec-section").querySelector("h3").textContent=expansion.dodatkowaRundaPoprawek?.nazwa||"";
          q("#ec-language-rows").closest(".ec-section").hidden=!expansion.dodatkowyJezyk;
          q("#ec-language-rows").closest(".ec-section").querySelector("h3").textContent=expansion.dodatkowyJezyk?.nazwa==="Dodaj język"?"Języki obce na stronie":(expansion.dodatkowyJezyk?.nazwa||"");
          update();
        }
        function count(id) {
          let n = Math.floor(Number(q(id).value));
          n = Number.isFinite(n) ? Math.max(0, Math.min(99, n)) : 0;
          q(id).value = n;
          return n;
        }
        const val = (name) => q(`[name="${name}"]:checked`).value;
        function calculate() {
          const p = current, s = states[p.id], items = [];
          if (expansion.dodatkowaSekcja && s.sections)
            items.push([expansion.dodatkowaSekcja.nazwa+" × "+s.sections,s.sections*sectionPrice]);
          if (expansion.dodatkowaPodstrona && s.pages)
            items.push([expansion.dodatkowaPodstrona.nazwa+" × "+s.pages,s.pages*pagePrice]);
          if (s.seo > p.seo)
            items.push([seoName(p,s.seo), seo[s.seo][2] - seo[p.seo][2]]);
          if (s.contact > p.contact)
            items.push([contacts[s.contact][0], contacts[s.contact][2] - contacts[p.contact][2]]);
          if (expansion.dodatkowaRundaPoprawek && s.revisions)
            items.push([expansion.dodatkowaRundaPoprawek.nazwa+" × "+s.revisions,s.revisions*revisionPrice]);
          if (trainingCharge())
            items.push(["Zmiana szkolenia: " + trainingLabel(), trainingCharge()]);
          if(expansion.dodatkowyJezyk)(s.languages||[]).forEach(language=>items.push([expansion.dodatkowyJezyk.nazwa+": "+language,languagePrice]));
          extraServices.forEach(([key,label,price,mayBeIncluded]) => {
            if (serviceAvailable(p,key) && s[key] && !serviceIncluded(p,key))
              items.push([label, price]);
          });
          seoServices.forEach(([key,label,price]) => {
            if (serviceAvailable(p,key) && s[key] && !serviceIncluded(p,key)) items.push([label, price]);
          });
          // W pakiecie Abonament opieka jest opłacana za 12 miesięcy w ramach abonamentu.
          if(p.recurring)annualExtras(p,s).forEach(x=>items.push([x.nazwa+" / "+contractPeriod,annualPeriods.reduce((sum,n)=>sum+prorate(x.cena,n),0)/100]));
          const extra = items.reduce((sum,item) => sum + item[1], 0);
          const year = p.recurring ? contractBase(s.billing) : p.price;
          const host=p.recurring?0:annualExtras(p,s).reduce((sum,x)=>sum+x.cena,0);
          const total = p.recurring
            ? installmentPlan(extra, s.billing).contract
            : year + extra + host;
          return {
            items, extra, year, host, total,
            contract: p.recurring ? total : null
          };
        }
        function read() {
          const p = current,
            s = states[p.id];
          s.training = +val("ec-training");
          if(hasTemplateLibrary(p)) s.templateId=q('#ec-template-options input[name="ec-template-choice"]:checked')?.value||"";
          s.sections=expansion.dodatkowaSekcja?count("#ec-sections"):0;
          s.pages=expansion.dodatkowaPodstrona?count("#ec-pages"):0;
          s.seo = +val("ec-seo");
          s.contact = +val("ec-contact");
          s.revisions=expansion.dodatkowaRundaPoprawek?+val("ec-revisions"):0;
          s.billing = val("ec-billing");
          s.annual=Object.fromEntries(annualServices.map(x=>[x.id,!!q("#ec-annual-"+x.id)?.checked]));
          s.hosting=!!s.annual.hosting&&!annualIncluded(p,"hosting");
          s.care=!!s.annual.care;
          s.languages = !expansion.dodatkowyJezyk?[]:all("#ec-language-rows .ec-language-row").filter(row =>
            row.querySelector(".ec-language-toggle").checked
          ).map(row => row.querySelector(".ec-language-choice").value)
           .filter((language, index, languages) => language && languages.indexOf(language) === index);
          extraServices.forEach(([key,, ,mayBeIncluded]) => {
            s[key] = serviceAvailable(p,key) && (serviceIncluded(p,key) || !!q("#ec-addon-" + key)?.checked);
          });
          seoServices.forEach(([key]) => {
            s[key] = serviceAvailable(p,key) && (serviceIncluded(p,key) || !!q("#ec-seo-addon-" + key)?.checked);
          });
        }
        function baseUpdate() {
          read();
          const p = current,
            s = states[p.id],
            a = calculate();
          q("#ec-base").textContent = money(
            p.recurring ? (s.billing === "annual" ? aboPricing.annual : aboPricing.monthly) : p.price,
          );
          q("#ec-period").textContent = p.recurring
            ? s.billing === "annual"
              ? "rocznie, płatne z góry"
              : "miesięcznie"
            : "jednorazowo za wykonanie";
          q("#ec-base-label").textContent = p.recurring
            ? "Abonament / rok"
            : "Cena bazowa";
          q("#ec-base-cost").textContent = money(a.year);
          q("#ec-extra").textContent = money(a.extra);
          q("#ec-project-subtotal-label").textContent = "Projekt + dodatki";
          q("#ec-project-subtotal").textContent = money(p.price + a.extra);
          q("#ec-host-row").hidden = !a.host;
          q("#ec-host-label").textContent=annualCostLabel(p);
          q("#ec-host-cost").textContent = money(a.host);
          q("#ec-total-label").textContent =
            p.recurring || a.host
              ? "Łącznie w pierwszym roku"
              : "Łącznie jednorazowo";
          q("#ec-total").textContent = money(a.total);
          q("#ec-paynote").textContent = p.recurring
            ? s.billing === "annual"
              ? money(aboPricing.annual) + " / rok promocyjnie + dodatki rozłożone na raty."
              : months + " × " + money(aboPricing.monthly) + " + dodatki rozłożone na raty."
            : a.host
              ? "Projekt, dodatki i wybrane usługi roczne płatne z góry."
              : p.hosting === "year"
                ? "Hosting i opieka w cenie na pierwszy rok."
                : "Hosting i opieka techniczna nie są doliczone.";
          q("#ec-contract").textContent = p.recurring
            ? "Koszt umowy na "+contractPeriod+" z dodatkami: " +
              money(a.contract) +
              "."
            : p.hosting === "year"
              ? "Cena hostingu po pierwszym roku do ustalenia."
              : "";
          q("#ec-items").innerHTML = a.items.length
            ? a.items
                .map(
                  (x) =>
                    `<div class="ec-line"><span>${escapeTemplateText(x[0])}</span><span>${money(x[1])}</span></div>`,
                )
                .join("")
            : "Brak dodatków jednorazowych.";
          all("[data-counter]").forEach((b) => {
            const n = s[b.dataset.counter];
            b.disabled = b.dataset.delta === "-1" ? n === 0 : n === 99;
          });
        }
        function baseSummary(baseChoice) {
          const p = current, s = states[p.id], a = calculate();
          if(p.individual){
            const selected=a.items.map(x=>x[0]);const annual=annualServices.filter(x=>annualSelected(p,s,x.id)).map(x=>x.nazwa);
            q("#ec-summary").innerHTML='<h3>Business — wycena indywidualna</h3><p>Zakres, harmonogram i płatności ustalimy po konsultacji.</p><div class="ec-line"><span>Wybrane potrzeby</span><span>'+escapeTemplateText([...selected,...annual].join(", ")||"Do ustalenia")+'</span></div>'+(directSummaryMode?'<div class="ec-direct-summary-switch"><button type="button" id="ec-direct-summary-configure" class="ec-direct-summary-configure">Przejdź do konfiguratora ↗</button></div>':"");return;
          }
          const project = p.price + a.extra;
          const simpleRows = [
            ["Pakiet", p.name],
            ["Zakres", p.structure],
            ...(p.recurring && !directSummaryMode && s.billing==="annual" ? [["Promocja pakietu "+p.name, money(aboPricing.annual) + "/rok zamiast " + money(aboPricing.regularAnnual) + "/rok"]] : []),
            ...(cennik.seo.length?[["SEO",seoName(p,s.seo)]]:[]),
            ["Dodatkowe usługi SEO", seoServices.filter(([key]) => serviceAvailable(p,key)&&s[key])
              .map(([,label]) => label).join(", ") || "Bez dodatkowych usług"],
            ...(cennik.kontakt.length?[["Kontakt",contacts[s.contact][0]]]:[]),
            ...(expansion.dodatkowyJezyk?[[expansion.dodatkowyJezyk.nazwa,(s.languages||[]).join(", ")||"Bez dodatkowych języków"]]:[]),
            ["Wybrane dodatki", a.items.length ? a.items.map(([name])=>escapeTemplateText(name)).join(", ") : "Bez dodatków"],
            ...(annualServices.length?[["Hosting / opieka",hostingDescription(p)]]:[])
          ];
          const row = (label,value) =>
            '<div class="ec-line' + (label==="Hosting / opieka" ? ' ec-summary-hosting-line' : '') +
            '"><span>' + label + '</span><span>' + value + '</span></div>';
          const templateRow = hasTemplateLibrary(p)
            ? '<div class="ec-line ec-summary-template-line">' +
                '<span>Szablon pakietu ' + escapeTemplateText(p.name) + '</span>' +
                '<button type="button" class="ec-summary-template-name ' +
                  (s.templateId ? 'is-selected' : 'is-required') +
                  '" data-ec-summary-template-browse aria-label="' +
                  (s.templateId ? 'Zmień wybrany szablon pakietu ' : 'Wybierz szablon pakietu ') + escapeTemplateText(p.name) +
                  '">' +
                  (s.templateId ? templateSelectionName(s.templateId) : 'Wybierz szablon') +
                '</button>' +
                '<span class="ec-summary-template-validation" role="alert" hidden>Pole wymagane — wybierz szablon lub zaznacz „Szablon wybiorę później”.</span>' +
              '</div>'
            : '';
          const lines = simpleRows.map(([label,value]) =>
            row(label,value) + (label==="Pakiet" ? templateRow : "")
          ).join("");
          const total = p.recurring ? a.contract : a.total;
          const billingSwitch = p.recurring && directSummaryMode
            ? '<label class="ec-summary-billing ec-existing-toggle" for="ec-summary-installments">' +
                '<span class="ec-summary-billing-copy"><strong>Płatność w ratach</strong></span>' +
                '<input id="ec-summary-installments" type="checkbox" role="switch" aria-label="Płatność w ratach miesięcznych"' + (s.billing==="monthly" ? ' checked' : '') + '>' +
                '<span class="ec-switch-track" aria-hidden="true"></span></label>'
            : '';
          const totalValue = p.recurring && directSummaryMode && s.billing === "annual"
            ? '<del class="ec-summary-regular-price">' + money(contractBase("annual",true)+a.extra) + '</del> <strong class="ec-summary-promo-price">' + money(total) + '</strong> <small class="ec-summary-promo-label">· promocja</small>'
            : money(total);
          const totalBlock = '<div class="ec-summary-total">' + billingSwitch +
            row(p.recurring ? "Łącznie za "+contractPeriod : "Projekt i usługi łącznie",totalValue) +
            (p.recurring ? row("Suma dodatków",money(a.extra)) + row("Rata pakietu i dodatków",directSummaryMode ? directMiniSchedule() : miniSchedule()) :
              row("Wartość projektu z dodatkami",money(project)) +
              (a.host ? row("Usługi roczne z góry",money(a.host)) : "")) +
            '</div>';
          const compactConfigureLink = directSummaryMode
            ? '<div class="ec-direct-summary-switch">' +
                '<span class="ec-direct-summary-prompt">Potrzebujesz skonfigurować pakiet?</span> ' +
                '<button type="button" id="ec-direct-summary-configure" class="ec-direct-summary-configure">Przejdź do konfiguratora ↗</button>' +
              '</div>'
            : '';
          const detailsHeading = '<h3>' + (directSummaryMode ? 'Co wybrano — ' : 'Twoja konfiguracja: ') + p.name + '</h3>';
          // Podsumowanie po „Wybieram pakiet”: najpierw pełne „Co wybrano”
          // (w tym klikalny wybór szablonu Abonament), następnie niewielki
          // link do konfiguratora i na końcu blok rozliczenia.
          // Standardowe podsumowanie zachowuje swoją dotychczasową strukturę.
          q("#ec-summary").innerHTML = (directSummaryMode
              ? detailsHeading + lines + compactConfigureLink + totalBlock
              : detailsHeading + lines + totalBlock) +
            '<p class="ec-note">Ceny netto. Dodatki i usługi oznaczone jako robocze wymagają potwierdzenia w ofercie.</p>';
        }
        let wizardStep = 0;
        let directSummaryMode = false;
        let wizardPanes = [];
        function setupWizardLayout() {
          const fields = q("#ec-config .ec-fields");
          const sections = [...fields.children].filter(el => el.classList.contains("ec-section"));
          if (sections.length !== 8) throw new Error("Nieprawidłowe sekcje konfiguratora");
          wizardPanes = Array.from({ length: 4 }, (_, i) => {
            const pane = document.createElement("div");
            pane.className = "ec-pane";
            pane.dataset.ecStep = i;
            fields.append(pane);
            return pane;
          });
          // Rozliczenie pakietu Abonament w prawej kolumnie; pozostałe pakiety ukrywa fill().
          wizardPanes[0].append(sections[0]);
          // Jeden wybór rozliczenia, dostępny od pierwszego kroku w prawej kolumnie.
          q("#ec-config .ec-aside > [aria-live]").before(sections[1]);
          wizardPanes[1].append(sections[2], sections[3]);
          wizardPanes[2].append(sections[4], sections[5]);
          // Szkolenia przeniesione z kroku 3 do kroku 4, za hostingiem i opieką.
          wizardPanes[3].append(sections[7], sections[6]);
          // Moduły zostały przeniesione do dodatków w kroku 1.

          const bundle = document.createElement("div");
          bundle.className = "ec-bundle-grid";
          sections[0].querySelector("h3").textContent = "W cenie Twojego projektu";
          const scope = q("#ec-scope");
          scope.before(bundle);
          const included = document.createElement("div");
          const title = document.createElement("h4");
          title.textContent = "Elementy zawarte w pakiecie";
          included.append(title,scope);
          bundle.append(included);
          const extras = document.createElement("div");
          const extrasTitle = document.createElement("h4");
          extrasTitle.textContent = "Dodatki do projektu";
          const toggles = document.createElement("div");
          toggles.id = "ec-addons";
          extras.append(extrasTitle,toggles);
          bundle.append(extras);

          // Ten sam pierwszy krok wyboru szablonu dla Abonament i Start.
          const templatePane=document.createElement("div");
          templatePane.id="ec-mini-template-pane";
          templatePane.className="ec-pane ec-template-pane";
          templatePane.dataset.ecStep="template";
          fields.insertBefore(templatePane,wizardPanes[0]);
          // Jeden katalog szablonów dla obu pakietów, z osobnym zapisem wyboru.
          const templateSection=document.createElement("section");
          templateSection.className="ec-section ec-template-section";
          templateSection.id="ec-template-section";
          templateSection.hidden=true;
          templateSection.innerHTML=
            '<h3>Wybierz szablon swojej strony</h3>'+
            '<p class="ec-muted">Wybierz projekt z biblioteki Eniverse i zobacz pełny podgląd. Wybór szablonu nie zmienia ceny pakietu.</p>'+
            '<p id="ec-template-required" class="ec-template-required" role="alert" tabindex="-1" hidden>Wybierz szablon lub zaznacz „Szablon wybiorę później”, aby przejść dalej.</p>'+
            '<div class="ec-template-select-options" id="ec-template-options" role="group" aria-label="Wybór szablonu strony"></div>'+
            '<div class="ec-template-select-footer"><span id="ec-template-selected"></span></div>';
          templatePane.append(templateSection);

          const lang = document.createElement("section");
          lang.className = "ec-section";
          lang.innerHTML =
            '<h3>Języki obce na stronie</h3>' +
            '<p class="ec-muted">Włącz język i wybierz go z listy. Możesz dodać kilka wersji językowych. Cena robocza: ' + money(languagePrice) + ' za każdy język jednorazowo. Tłumaczenie treści jest wyceniane osobno.</p>' +
            '<div class="ec-language-list" id="ec-language-rows"></div>' +
            '<button class="ec-language-add ec-interactive" type="button" id="ec-add-language">+ Dodaj kolejny język</button>';
          wizardPanes[3].insertBefore(lang,sections[7]);
          sections[7].querySelector("h3").textContent = "Hosting i opieka techniczna";

          const final = document.createElement("div");
          final.className = "ec-final";
          final.id = "ec-final";
          final.hidden = true;
          final.append(q("#ec-summary"),q("#ec-contact-section"));
          q("#ec-window").insertBefore(final,q("#ec-window .ec-foot"));
        }
        setupWizardLayout();
        q("#ec-template-options").addEventListener("click",event=>{
          const preview=event.target.closest("[data-template-preview]");
          if(!preview)return;
          read();
          openTemplateDialog(preview);
          const index=templateSamples.findIndex(t=>t.id===preview.dataset.templatePreview);
          if(index>=0)showTemplate(index);
        });
        function step(index = 0, baseChoice = false) {
          const withTemplate=hasTemplateLibrary(current);
          const lastIndex=withTemplate?5:4;
          wizardStep=Math.max(0,Math.min(lastIndex,index));
          const last=wizardStep===lastIndex;
          const oldStep=withTemplate?wizardStep-1:wizardStep;
          q("#ec-config").hidden=last;
          q("#ec-final").hidden=!last;
          q("#ec-summary").hidden=!last;
          q("#ec-contact-section").hidden=!last;
          q("#ec-mini-template-pane").classList.toggle("is-active",withTemplate&&wizardStep===0);
          wizardPanes.forEach((pane,i)=>pane.classList.toggle("is-active",!last&&i===oldStep));
          const templateNav=q("[data-ec-nav-template]");
          templateNav.hidden=!withTemplate;
          templateNav.classList.toggle("active",withTemplate&&wizardStep===0);
          if(withTemplate&&wizardStep===0)templateNav.setAttribute("aria-current","step");
          else templateNav.removeAttribute("aria-current");
          all("[data-ec-nav-step]").forEach((el,i)=>{
            const active=oldStep===i;
            el.classList.toggle("active",active);
            el.querySelector("span").textContent=String(i+1+(withTemplate?1:0));
            if(active)el.setAttribute("aria-current","step");
            else el.removeAttribute("aria-current");
          });
          const labels=["Zakres w cenie i dodatki","Struktura sklepu i SEO","Kontakt i poprawki","Języki, usługi i szkolenia","Podsumowanie"];
          const directOnly=directSummaryMode && last;
          q("#ec-title").textContent=directOnly
            ? "Podsumowanie"
            : (withTemplate&&wizardStep===0?"Wybór szablonu":labels[oldStep])+" — "+current.name;
          q("#ec-subtitle").textContent=directOnly
            ? "Wybrany pakiet: "+current.name
            : "Krok "+(wizardStep+1)+" z "+(lastIndex+1);
          q("#ec-window .ec-head .ec-kicker").textContent=directOnly
            ? "Eniverse / Podsumowanie"
            : "Eniverse / Konfigurator sklepu";
          q("#ec-window .ec-steps").hidden=directOnly;
          q("#ec-window .ec-foot").hidden=directOnly;
          q("#ec-next").hidden=last;
          q("#ec-next").textContent=wizardStep===lastIndex-1?"Podsumowanie →":"Dalej →";
          q("#ec-back").hidden=directSummaryMode||wizardStep===0;
          q("#ec-back").textContent="← Wstecz";
          q("#ec-footer-note").textContent=last
            ? "Podgląd wyceny. Formularz demonstracyjny."
            : current.recurring?"Abonament: umowa na "+contractPeriod+".":"Sklep i dodatki jednorazowo; usługi roczne płatne z góry.";
          q("#ec-config .ec-fields").scrollTop=0;
          if(last)summary(baseChoice);
        }
        // Galeria Abonament w podsumowaniu jest częścią trybu wyboru pakietu.
        // Nie przełączamy kroków po wybraniu szablonu z tej galerii.
        q("#ec-summary").addEventListener("click",event=>{
          const configure=event.target.closest("#ec-direct-summary-configure");
          if(configure && directSummaryMode){
            directSummaryMode=false;
            step(0);
            return;
          }
          const templateLink=event.target.closest("[data-ec-summary-template-browse]");
          if(templateLink && hasTemplateLibrary(current)){
            openTemplateDialog(templateLink);
          }
        });
        q("#ec-summary").addEventListener("change", event => {
          if (!event.target.matches("#ec-summary-installments") || !current.recurring || !directSummaryMode) return;
          const billing = event.target.checked ? "monthly" : "annual";
          states[current.id].billing = billing;
          all('[name="ec-billing"]').forEach(input => input.checked = input.value === billing);
          update();
          summary(true);
          q("#ec-summary-installments")?.focus({preventScroll:true});
        });
        let scrollBeforeModal = false;
        function open(id, baseChoice, button) {
          const target = packages.find((p) => p.id === id);
          if (!target) return;
          current = target;
          opener = button || null;
          directSummaryMode=!!baseChoice;
          if (baseChoice) {
            states[id] = defaults(current);
            if (current.recurring) states[id].billing = "annual";
          }
          scrollBeforeModal = document.body.classList.contains("eni-shop-calc-scroll-locked");
          document.body.classList.add("eni-shop-calc-scroll-locked");
          q("#ec-modal-stage").hidden = false;
          syncModalPortal();
          fill();
          clearTemplateRequired();
          step(baseChoice ? (hasTemplateLibrary(current)?5:4) : 0, baseChoice);
          q("#ec-modal-stage").scrollTop = 0;
          q("#ec-close").focus({preventScroll:true});
        }
        function close() {
          q("#ec-modal-stage").hidden = true;
          syncModalPortal();
          document.body.classList.toggle("eni-shop-calc-scroll-locked",scrollBeforeModal);
          opener?.focus({preventScroll:true});
        }
        q("#ec-catalog").addEventListener("click", (e) => {
          const b = e.target.closest("[data-configure],[data-choose]");
          if (b)
            open(
              b.dataset.configure || b.dataset.choose,
              !!b.dataset.choose,
              b,
            );
        });
        q("#ec-close").addEventListener("click", close);
        function clearTemplateRequired() {
          q("#ec-template-required").hidden=true;
          q("#ec-template-options").removeAttribute("aria-invalid");
          q("#ec-template-options").removeAttribute("aria-describedby");
        }
        q("#ec-next").addEventListener("click", () => {
          update();
          if(hasTemplateLibrary(current) && wizardStep===0 && !states[current.id].templateId) {
            const error=q("#ec-template-required");
            error.hidden=false;
            q("#ec-template-options").setAttribute("aria-invalid","true");
            q("#ec-template-options").setAttribute("aria-describedby","ec-template-required");
            error.focus();
            return;
          }
          clearTemplateRequired();
          step(wizardStep + 1);
          if(wizardStep===(hasTemplateLibrary(current)?5:4)) q("#ec-client-name").focus();
        });
        q("#ec-back").addEventListener("click", () => {
          step(wizardStep - 1);
          q("#ec-next").focus();
        });
        q("#ec-config").addEventListener("change", (event) => {
          update();
          // Natychmiastowe odświeżenie podpisu po wyborze szablonu Abonament.
          if (event.target.closest("#ec-template-options")) {
            const id=states[current.id].templateId;
            if(id) clearTemplateRequired();
            q("#ec-template-selected").textContent=id
              ? "Wybrany szablon: "+templateSelectionName(id)
              : "Nie wybrano jeszcze szablonu ani opcji wyboru później.";
          }
          // Aktualizacja list po zmianie języka lub stanu przełącznika.
          if (event.target.closest("#ec-language-rows")) renderLanguages();
        });
        q("#ec-add-language").addEventListener("click", () => {
          // Najpierw zachowaj pozostałe ustawienia; nie resetuj konfiguracji.
          read();
          const selected = states[current.id].languages;
          const nextLanguage = languageChoices.find(language => !selected.includes(language));
          if (!selected.length || !nextLanguage) return;
          selected.push(nextLanguage);
          renderLanguages();
          update();
        });
        all("[data-counter]").forEach((b) =>
          b.addEventListener("click", () => {
            const el = q("#ec-" + b.dataset.counter);
            el.value = Number(el.value) + Number(b.dataset.delta);
            update();
          }),
        );
        q("#ec-modal-stage").addEventListener("click", (e) => {
          if (e.target === q("#ec-modal-stage")) close();
        });
        document.addEventListener("keydown", (e) => {
          if (q("#ec-modal-stage").hidden || !q("#ec-template-modal").hidden) return;
          if (e.key === "Escape") {
            e.preventDefault();
            close();
          }
          if (e.key === "Tab") {
            const focusables = all('#ec-modal-stage button:not([disabled]):not([hidden]), #ec-modal-stage input:not([disabled]):not([type="hidden"]), #ec-modal-stage summary, #ec-modal-stage a[href]')
              .filter(el => el.getClientRects().length > 0);
            const first = focusables[0], last = focusables[focusables.length - 1];
            if (!first || !last) return;
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
          }
        });
        // Elementor: wykorzystujemy gotowe karty, a nie odtwarzamy ich w drugim miejscu.
        // Żaden istniejący link CTA nie jest podmieniany lub blokowany.
        function integrateWithElementor() {
          const holder = document.querySelector('#enp-cennik.eniverse-pricing, .eniverse-pricing');
          if (!holder || holder.closest('#eni-shop-calc')) return;
          const liveCards = [...holder.querySelectorAll('.enp-card')];
          if (!liveCards.length) return;
          const byName = name => {
            const n = (name || '').toLocaleLowerCase('pl-PL');
            if (n.includes('wizytówk')) return 'wiz';
            if (n.includes('one page')) return 'one';
            if (n.includes('strona firmowa') || n.includes('firmowy')) return 'firm';
            if (n.includes('mini start') || n.startsWith('abo')) return 'mini';
            if (n.includes('start')) return 'start';
            return null;
          };
          const matched = [];
          liveCards.forEach(card => {
            const title = card.querySelector('h3, h2');
            const plan = byName(title?.textContent || card.getAttribute('aria-labelledby'));
            if (!plan) return;
            card.dataset.eniPlan = plan;
            matched.push(card);
            if (hasTemplateLibrary({id:plan}) && !card.querySelector("[data-templates-open]")) {
              const button=document.createElement("button");
              button.type="button";
              button.className="ec-elementor-configure ec-elementor-templates";
              button.textContent=plan==="start"?"Przejrzyj szablony Start ↗":"Przejrzyj szablony pakietu Abonament ↗";
              button.dataset.templatePlan=plan;
              button.dataset.templatesOpen="";
              card.append(button);
              button.addEventListener("click",()=>openTemplateDialog(button));
            }
            const existing = card.querySelector('.ec-elementor-configure:not(.ec-elementor-templates)');
            if (existing) return;
            const link = card.querySelector('.enp-btn, a[data-enp-package]');
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'ec-elementor-configure';
            button.textContent = 'Skonfiguruj pakiet ↗';
            button.dataset.configure = plan;
            button.setAttribute('aria-label', 'Skonfiguruj pakiet ' + (title?.textContent || ''));
            if (link) link.insertAdjacentElement('afterend', button);
            else card.append(button);
            button.addEventListener('click', () => open(plan, false, button));
          });
          if (!matched.length) return;
          q('#ec-demo-page').hidden = true;
          root.classList.add('ec-elementor-mode');
          // Zmiana wyróżnienia tylko przez oznaczenia klas/atrybutów na oryginalnych boksach.
          const oldFeatured = matched.filter(c => c.dataset.eniPlan !== 'wiz');
          oldFeatured.forEach(card => {
            card.classList.remove('enp-card--featured', 'enp-card--highlight', 'is-featured');
            card.dataset.eniFeatured = 'false';
            card.querySelectorAll('.enp-badge, .enp-card-badge, .enp-featured-badge').forEach(b => b.hidden = true);
          });
          const wizCard = matched.find(c => c.dataset.eniPlan === 'wiz');
          if (wizCard) {
            wizCard.dataset.eniFeatured = 'true';
            wizCard.classList.add('enp-card--featured');
            let badge = wizCard.querySelector('.ec-elementor-badge');
            if (!badge) {
              badge = document.createElement('span');
              badge.className = 'ec-elementor-badge';
              badge.textContent = 'Wyróżniony pakiet';
              wizCard.append(badge);
            }
          }
        }
        // W Elementorze kod w widżecie HTML wykonuje się po stworzeniu kart na stronie.
        // Jeśli widget ładuje się wcześniej, DOMContentLoaded uruchomi próbę ponownie.
        // Boxy w index.html powiązane z ID w cennik-sklepow.js są jedynym źródłem oferty. Usuń stare karty Elementora przy wdrożeniu.
        const decimalMoney = (n) =>
          new Intl.NumberFormat("pl-PL", {
            useGrouping: "always",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(n) + " zł";
        function hostingDescription(p=current){
          const st=states[p.id];
          const parts=annualServices.filter(x=>annualSelected(p,st,x.id)).map(x=>x.nazwa+": "+(annualIncluded(p,x.id)?"W cenie pakietu":money(x.cena)+"/rok"));
          return parts.length?parts.join("; "):"Bez dodatkowych usług rocznych";
        }
        function annualCostLabel(p=current){
          const selected=annualExtras(p,states[p.id]);
          return selected.length===1?selected[0].nazwa+" / rok":"Usługi roczne / rok";
        }
        function paymentInfo() {
          const p = current, a = calculate();
          const principal = p.price + a.extra;
          const deposit = Math.round(Math.round(principal*100)*depositPercent/100)/100;
          return {
            eligible: !p.recurring&&!p.individual,
            principal,
            deposit,
            remaining: (Math.round(principal*100)-Math.round(deposit*100))/100,
            hostInitial: a.host,
            initial: deposit + a.host,
            total: a.total
          };
        }
        function paymentDescription() {
          const b = paymentInfo();
          if (!b.eligible) return "";
          return "Zaliczka "+depositPercent+"% za projekt i dodatki: " + decimalMoney(b.deposit) +
            (b.hostInitial ? " + roczne usługi płatne z góry: " + money(b.hostInitial) : "") + ".";
        }
        function remainingPaymentDescription() {
          const b = paymentInfo();
          if(!b.eligible) return "";
          return "Pozostałe "+remainingPercent+"% projektu: " + decimalMoney(b.remaining) +
            ". Termin zapłaty zgodnie z umową.";
        }
        function singlePaymentUpdate() {
          baseUpdate();
          const b = paymentInfo();
          q("#ec-payment-aside").hidden = !b.eligible;
          if(b.eligible) {
            q("#ec-host-label").textContent=annualCostLabel();
            q("#ec-host-cost").textContent = money(b.hostInitial);
            q("#ec-total").textContent = money(b.initial);
            q("#ec-total-label").textContent = "Zaliczka "+depositPercent+"% + usługi na start";
            q("#ec-payment-aside").innerHTML =
              '<span>Do zapłaty na start</span><strong>' + decimalMoney(b.initial) +
              '</strong><p class="ec-muted">Pozostałe '+remainingPercent+'% projektu: ' + decimalMoney(b.remaining) + '</p>';
            q("#ec-paynote").textContent = paymentDescription();
          }
          q("#ec-items").removeAttribute("aria-label");
          if(current.individual){
            ["#ec-base","#ec-base-cost","#ec-project-subtotal","#ec-extra","#ec-host-cost","#ec-total"].forEach(id=>q(id).textContent="Do ustalenia");
            q("#ec-period").textContent="Wycena indywidualna";q("#ec-total-label").textContent="Cena po konsultacji";q("#ec-paynote").textContent="Wybrane opcje stanowią potrzeby do wyceny.";q("#ec-items").textContent=calculate().items.map(x=>x[0]).join(", ")||"Brak dodatkowych potrzeb.";
          }
        }
        function singlePaymentSummary(baseChoice) {
          baseSummary(baseChoice);
          const b = paymentInfo();
          if (b.eligible) {
            const block = document.createElement("section");
            block.className = "ec-payment-summary";
            const h = document.createElement("h3");
            h.textContent = "Zaliczka "+depositPercent+"% wartości projektu";
            const first = document.createElement("p");
            first.textContent = depositPercent+"% za projekt i dodatki: " + decimalMoney(b.deposit);
            const second = document.createElement("p");
            second.textContent = "Usługi roczne płatne z góry: " + money(b.hostInitial);
            const amount = document.createElement("p");
            amount.classList.add("ec-amount-bold");
            amount.textContent = "Do zapłaty na start: " + decimalMoney(b.initial);
            const note = document.createElement("p");
            note.className = "ec-muted";
            note.textContent = remainingPaymentDescription();
            block.append(h,first,second,amount,note);
            q("#ec-summary").append(block);
          }
          q("#ec-send-result").hidden = true;
          q("#ec-form-error").hidden = true;
          all("#ec-lead-form [aria-invalid]").forEach(el => el.removeAttribute("aria-invalid"));
          q("#ec-quote-payload").value = quoteText();
        }
        function quoteText() {
          const p = current,
            s = states[p.id],
            a = calculate(),
            b = paymentInfo();
          if(p.individual) return ["ZAPYTANIE O SKLEP — ENIVERSE","Pakiet: Business","Wycena indywidualna — bez ustalonej ceny i zaliczki","Wybrane potrzeby: "+(a.items.map(x=>x[0]).join(", ")||"Do ustalenia"),"Usługi roczne: "+(annualServices.filter(x=>annualSelected(p,s,x.id)).map(x=>x.nazwa).join(", ")||"Do ustalenia"),"Opis projektu: "+q("#ec-shop-needs").value.trim()].join("\n");
          const lines = [
            "ZAPYTANIE O SKLEP — ENIVERSE",
            "Pakiet: " + p.name,
            ...(hasTemplateLibrary(p) ? ["Szablon pakietu "+p.name+": "+templateSelectionName(s.templateId)] : []),
            "Zakres: " +
              p.structure +
              (p.chips.length ? " — " + p.chips.join(", ") : ""),
            ...(expansion.dodatkowaSekcja?[expansion.dodatkowaSekcja.nazwa+": "+s.sections]:[]),
            ...(expansion.dodatkowaPodstrona?[expansion.dodatkowaPodstrona.nazwa+": "+s.pages]:[]),
            ...(cennik.seo.length?["SEO: "+seoName(p,s.seo)]:[]),
            ...seoServices.filter(([key])=>serviceAvailable(p,key)).map(([key,label,price]) =>
              label + ": " + (s[key] ? (serviceIncluded(p,key)?"W cenie pakietu":"Dodane, " + money(price)) : "Nie")),
            ...(cennik.kontakt.length?["Kontakt: "+contacts[s.contact][0]]:[]),
            ...(cennik.szkolenia.length?["Szkolenie: "+trainingLabel(),"Dopłata za zmianę szkolenia: "+money(trainingCharge())]:[]),
            (expansion.dodatkowaRundaPoprawek?.nazwa||"Sesje poprawek w pakiecie")+": " +
              (p.revisions + s.revisions) +
              " (" +
              p.revisions +
              " w cenie, " +
              s.revisions +
              " dodatkowych)",
            ...(annualServices.length?["Usługi roczne: "+hostingDescription(p)]:[]),
            ...(expansion.dodatkowyJezyk?[expansion.dodatkowyJezyk.nazwa+": "+((s.languages||[]).join(", ")||"Nie")]:[]),
            ...extraServices.filter(([key])=>serviceAvailable(p,key)).map(([key,label,price,mayBeIncluded]) =>
              label + ": " + (s[key] ? ((mayBeIncluded && p.includedAddons[key]) ? "W cenie pakietu" : "Dodane, " + money(price)) : "Nie")),
            "Czy ma stronę/sklep: " + (q("#ec-existing-check").checked ? "Tak" : "Nie"),
            "Link do istniejącej strony: " + (q("#ec-existing-check").checked ? q("#ec-existing-url").value.trim() : "Brak"),
            "",
            "POZOSTAŁY ZAKRES BAZOWY",
            ...fixed(p).filter((x) => x[1]).map((x) => "W cenie: " + x[0]),
            "",
            "WYCENA",
            "Cena bazowa: " +
              money(a.year) +
              (p.recurring ? " / "+contractPeriod : " za wykonanie"),
            ...a.items.map((x) => x[0] + ": " + money(x[1])),
            (p.recurring
              ? "Dodatki — wartość za całą umowę: "
              : "Suma dodatków: ") + money(a.extra),
            "Dodatkowe usługi roczne (hosting/opieka): " + money(a.host),
            (p.recurring?"Łącznie za "+contractPeriod:"Łącznie w pierwszym roku")+": "+money(a.total),
            "",
          ];
          if (p.recurring)
            lines.push(
              "Łączna płatność za pakiet i dodatki: " + (directSummaryMode ? directMiniSchedule() : miniSchedule()),
              "Umowa: "+contractPeriod,
              "Cała umowa z dodatkami: " + money(a.contract),
              "Dodatki są rozłożone na cały okres umowy; brak osobnej opłaty jednorazowej.",
            );
          else
            lines.push(
              "Płatność: " +
                (b.eligible
                  ? paymentDescription()
                  : money(b.principal) + " jednorazowo"),
            );
          if (b.eligible)
            lines.push(
              "Zaliczka "+depositPercent+"% wartości projektu: " + decimalMoney(b.deposit),
              "Hosting i opieka za rok z góry: " + money(b.hostInitial),
              "Do zapłaty na start: " + decimalMoney(b.initial),
              remainingPaymentDescription(),
            );
          if (p.hosting === "year")
            lines.push("Hosting po pierwszym roku: cena do ustalenia.");
          lines.push(
            "Ceny dodatków są przykładowe. Sesje poprawek i modyfikacje od " + money(revisionPrice) + "; w makiecie " + money(revisionPrice) + "/sesję. Kwoty netto; VAT według właściwej stawki.",
          );
          return lines.join(String.fromCharCode(10));
        }
        // Use CF7's native form submission so its validation, spam controls and mail settings remain active.
        function sendToCF7(values) {
          return new Promise((resolve,reject)=>{
            const form=document.querySelector("#eniverse-shop-quote-form form.wpcf7-form");
            if(!form||typeof form.requestSubmit!=="function"||!window.wpcf7){
              reject(new Error("Formularz wysyłkowy jest niedostępny. Skontaktuj się z agencją."));return;
            }
            const wrapper=form.closest(".wpcf7");
            if(!wrapper){reject(new Error("Nie znaleziono formularza Contact Form 7."));return;}
            for(const [id,value] of Object.entries(values)){
              const input=form.elements.namedItem(id);
              if(!input||typeof input.value==="undefined"){
                reject(new Error("Formularz wysyłkowy nie jest poprawnie skonfigurowany."));return;
              }
              input.value=value;
              input.dispatchEvent(new Event("input",{bubbles:true}));
              input.dispatchEvent(new Event("change",{bubbles:true}));
            }
            let timer,settled=false;
            const errors={
              wpcf7invalid:"Formularz odrzucił dane. Sprawdź wymagane pola.",
              wpcf7spam:"Zgłoszenie zostało zatrzymane przez zabezpieczenia antyspamowe.",
              wpcf7mailfailed:"Nie udało się wysłać wiadomości. Spróbuj ponownie lub skontaktuj się z agencją.",
              wpcf7unaccepted:"Brak wymaganej akceptacji.",
              wpcf7aborted:"Wysyłka została przerwana."
            };
            const events=["wpcf7mailsent","wpcf7submit",...Object.keys(errors)];
            function finish(error){
              if(settled)return;settled=true;clearTimeout(timer);
              events.forEach(type=>wrapper.removeEventListener(type,onResult));
              error?reject(error):resolve();
            }
            function onResult(event){
              if(event.target!==wrapper && !wrapper.contains(event.target))return;
              if(event.type==="wpcf7mailsent"){finish();return;}
              if(errors[event.type]){finish(new Error(errors[event.type]));return;}
              if(event.type==="wpcf7submit"){
                if(event.detail?.status==="mail_sent")finish();
                else finish(new Error("Contact Form 7 nie potwierdził wysłania wiadomości."));
              }
            }
            events.forEach(type=>wrapper.addEventListener(type,onResult));
            timer=setTimeout(()=>finish(new Error("Brak potwierdzenia wysyłki. Przed ponowną próbą skontaktuj się z agencją.")),45000);
            try{form.requestSubmit();}catch(error){finish(new Error("Nie udało się uruchomić wysyłki Contact Form 7."));}
          });
        }
        if (production) {
          q("#ec-form-demo").textContent="Dane wykorzystamy do kontaktu w sprawie wybranego pakietu.";
          q(".ec-pricing-note").textContent="Ceny dodatków są przykładowe, a końcowy zakres i termin realizacji wymagają zatwierdzenia.";
          q("#ec-send-result details").hidden=true;
        }
        q("#ec-lead-form").addEventListener("submit", async (event) => {
          event.preventDefault();
          if (q("#ec-lead-form button[type=submit]").disabled) return;
          if(hasTemplateLibrary(current) && !states[current.id].templateId){
            // Przycisk Wyślij jest aktywny, lecz nie pozwalamy wysłać bez
            // świadomego wyboru szablonu lub opcji "później".
            const templateLine=q("#ec-summary .ec-summary-template-line");
            if(templateLine){
              templateLine.classList.add("is-invalid");
              const message=templateLine.querySelector(".ec-summary-template-validation");
              if(message)message.hidden=false;
              const browse=templateLine.querySelector("[data-ec-summary-template-browse]");
              browse?.setAttribute("aria-invalid","true");
              templateLine.scrollIntoView({block:"center",behavior:"smooth"});
              browse?.focus({preventScroll:true});
            }
            q("#ec-form-error").textContent="Pole wymagane: wybierz szablon pakietu "+current.name+" lub opcję „Szablon wybiorę później”.";
            q("#ec-form-error").hidden=false;
            q("#ec-mini-template-required").hidden=false;
            q("#ec-send-result").hidden=true;
            return;
          }
          const name = q("#ec-client-name"),
            email = q("#ec-client-email"),
            phone = q("#ec-client-phone"),
            existing = q("#ec-existing-check"),
            site = q("#ec-existing-url");
          name.value = name.value.trim();
          email.value = email.value.trim();
          phone.value = phone.value.trim();
          site.value = site.value.trim();
          site.required = existing.checked;
          site.setCustomValidity(
            existing.checked && !/^https?:\/\/[^\s.]+\.[^\s]+/i.test(site.value)
              ? "Podaj pełny adres strony zaczynający się od https://."
              : ""
          );
          name.setCustomValidity(
            name.value ? "" : "Podaj imię i nazwisko lub nazwę firmy.",
          );
          phone.setCustomValidity(
            phone.value &&
              (!/^[+0-9 ()-]+$/.test(phone.value) ||
                phone.value.replace(/[^0-9]/g, "").length < 7)
              ? "Podaj poprawny numer telefonu lub pozostaw to pole puste."
              : "",
          );
          const fields = existing.checked ? [name,email,phone,site] : [name,email,phone],
            invalid = fields.filter((e) => !e.checkValidity());
          fields.forEach((e) => {
            if (!e.checkValidity()) e.setAttribute("aria-invalid", "true");
            else e.removeAttribute("aria-invalid");
          });
          q("#ec-send-result").hidden = true;
          if (invalid.length) {
            q("#ec-form-error").textContent =
              "Uzupełnij wymagane dane i sprawdź poprawność adresu e-mail" +
              (invalid.includes(phone) ? " oraz telefonu." : ".");
            q("#ec-form-error").hidden = false;
            invalid[0].focus();
            return;
          }
          q("#ec-form-error").hidden = true;
          if (!production) {
          const nl = String.fromCharCode(10),
            quote = quoteText();
          q("#ec-quote-payload").value = quote;
          const message = [
            "Odbiorca: adres agencji do wskazania przy wdrożeniu",
            "Temat: Zapytanie — " + current.name,
            "",
            "DANE KONTAKTOWE",
            "Imię i nazwisko / Firma: " + name.value,
            "E-mail: " + email.value,
            "Telefon: " + (phone.value || "Nie podano"),
            "Czy posiada stronę/sklep: " + (existing.checked ? "Tak" : "Nie"),
            "Link: " + (existing.checked ? site.value : "Nie dotyczy"),
            "",
            quote,
          ].join(nl);
          q("#ec-message-preview").textContent = message;
          q("#ec-send-status").textContent =
            "Dane są poprawne. To podgląd wiadomości — makieta nie wysłała e-maila.";
          q("#ec-send-result").hidden = false;

            return;
          }
          const quote=quoteText();
          q("#ec-quote-payload").value=quote;
          const button=q("#ec-lead-form button[type=submit]");
          if(button.disabled)return;
          button.disabled=true;
          const original=button.innerHTML;
          button.textContent="Wysyłanie…";
          try {
            await sendToCF7({
              client_name:name.value, client_email:email.value,
              client_phone:phone.value, has_site:existing.checked?"Tak":"Nie",
              existing_site_url:existing.checked?site.value:"",
              quote_summary:quote, package_name:current.name
            });
            q("#ec-send-status").textContent="Dziękujemy. Zapytanie zostało przyjęte.";
            q("#ec-send-result").hidden=false;
          } catch(error) {
            q("#ec-form-error").textContent=error.message;
            q("#ec-form-error").hidden=false;
          } finally {
            button.disabled=false;button.innerHTML=original;
          }
        });
        q("#ec-existing-check").addEventListener("change", () => {
          const active = q("#ec-existing-check").checked;
          q("#ec-existing-url-wrap").hidden = !active;
          q("#ec-existing-url").required = active;
          q("#ec-existing-url").setCustomValidity("");
          q("#ec-existing-url").removeAttribute("aria-invalid");
          q("#ec-send-result").hidden = true;
        });
        all('#ec-lead-form input:not([type="hidden"])').forEach((e) =>
          e.addEventListener("input", () => {
            e.setCustomValidity("");
            e.removeAttribute("aria-invalid");
            q("#ec-send-result").hidden = true;
            q("#ec-form-error").hidden = true;
          }),
        );

        function installmentPlan(extra, billing) {
          const annual=billing==="annual", extraCents=Math.round(extra*100);
          let payments, bases;
          if(annual){
            bases=annualPeriods.map((n,i)=>prorate(i===0?aboPricing.annual:aboPricing.regularAnnual,n));
            let elapsed=0,allocated=0;
            payments=annualPeriods.map((n,i)=>{
              elapsed+=n;
              const cumulative=Math.round(extraCents*elapsed/months);
              const amount=bases[i]+cumulative-allocated;
              allocated=cumulative;
              return amount;
            });
          }else{
            const base=Math.round(aboPricing.monthly*100), total=base*months+extraCents;
            bases=Array(months).fill(base);
            if(settings.zaokraglanieRat){
              const full=Math.floor(total/(months*100));
              const remainder=total-full*months*100;
              const rate=(full+(remainder>Math.round(settings.progZaokraglania*100)*months?1:0))*100;
              payments=Array(months).fill(rate);
            }else{
              const rate=Math.floor(total/months);
              payments=Array(months).fill(rate);
              payments[months-1]=total-rate*(months-1);
            }
          }
          return {annual,count:payments.length,regular:payments[0]/100,last:payments[payments.length-1]/100,
            extraPart:(payments[0]-bases[0])/100,baseFirst:bases[0]/100,contract:payments.reduce((sum,n)=>sum+n,0)/100,
            payments:payments.map(n=>n/100)};
        }
        function miniPlan(billing=states[current.id].billing){return installmentPlan(calculate().extra,billing);}
        function directMiniSchedule(billing=states[current.id].billing){
          const b=miniPlan(billing);
          if(b.annual){
            if(b.count===1)return "Jednorazowa płatność "+money(b.regular)+(months===12?"/rok":" / "+contractPeriod);
            return b.payments.map((amount,i)=>(i+1)+". okres ("+monthLabel(annualPeriods[i])+"): "+money(amount)).join("; ");
          }
          if(b.count===1)return "1 rata "+money(b.regular)+" / mc";
          if(b.regular===b.last)return b.count+" rat po "+money(b.regular)+" / mc";
          return (b.count-1)+" rat po "+money(b.regular)+" / mc i ostatnia "+money(b.last);
        }
        function miniSchedule(billing=states[current.id].billing){
          const b=miniPlan(billing);
          if(b.annual&&b.count===1)return (months===12?"1 płatność roczna":"1 płatność za "+contractPeriod)+" w wysokości "+decimalMoney(b.regular);
          if(!b.annual&&b.regular===b.last)return b.count+" raty miesięczne po "+money(b.regular);
          return directMiniSchedule(billing);
        }
        function update() {
          singlePaymentUpdate();
          const mini = current.recurring;
          q("#ec-base").hidden = mini;
          q("#ec-period").hidden = mini;
          q("#ec-mini-rate-comparison").hidden = true;
          q("#ec-mini-rate-footnote").hidden = !mini;
          q("#ec-total-label").hidden = mini;
          q("#ec-total").hidden = mini;
          q("#ec-paynote").hidden = mini;
          q("#ec-extra-label").textContent = mini
            ? "Dodatki / " +
              (states[current.id].billing === "annual" ? (months<12?contractPeriod:"rok") : "ratę")
            : "Dodatki jednorazowe";
          q("#ec-items-title").textContent = mini
            ? "Dodatki — wartość za całą umowę"
            : "Wybrane dodatki";
          all("[data-extra-cost]").forEach((e) => {
            e.textContent =
              "+" + money(e.dataset.extraCost === "section" ? sectionPrice : pagePrice) + e.dataset.extraUnit +
              " · " +
              (mini ? "wliczone w raty" : "jednorazowo");
          });
          if (!mini) return;
          const a = calculate(),
            b = miniPlan();
          q("#ec-base").textContent = b.annual ? decimalMoney(b.regular) : money(b.regular);
          q("#ec-period").textContent = b.annual
            ? (months<12?"za "+contractPeriod+" — pakiet i dodatki":months>12?"pierwsza płatność roczna za pakiet i dodatki":"rocznie za pakiet i dodatki")
            : "miesięcznie za pakiet i dodatki";
          q("#ec-base-label").textContent = b.annual
            ? "Baza / "+(months<12?contractPeriod:"rok")
            : "Rata bazowa";
          q("#ec-base-cost").textContent = money(b.baseFirst);
          q("#ec-extra").textContent = b.annual ? decimalMoney(b.extraPart) : money(b.extraPart);
          q("#ec-project-subtotal-label").textContent = b.annual ? "Pakiet + dodatki / "+(months<12?contractPeriod:"rok") : "Pakiet + dodatki / mies.";
          q("#ec-project-subtotal").textContent = b.annual ? decimalMoney(b.regular) : money(b.regular);
          q("#ec-contract").textContent =
            "Dodatki o wartości " +
            money(a.extra) +
            " są rozłożone na cały okres umowy, bez osobnej płatności na start.";
          const monthly = miniPlan("monthly"),
            annual = miniPlan("annual");
          const ratePrice = amount => Number.isInteger(amount) ? money(amount) : decimalMoney(amount);
          q("#ec-mini-monthly-price").textContent = ratePrice(monthly.regular);
          q("#ec-mini-annual-price").textContent = ratePrice(annual.regular);
          q("#ec-mini-monthly-variant").classList.toggle("is-selected", !b.annual);
          q("#ec-mini-annual-variant").classList.toggle("is-selected", b.annual);
          q("#ec-monthly-rate").textContent =
            money(monthly.regular) + " / mies.";
          q("#ec-monthly-detail").textContent =
            miniSchedule("monthly") + " za pakiet i dodatki.";
          q("#ec-annual-rate").textContent =
            decimalMoney(annual.regular) + annualUnit;
          q("#ec-annual-rate").classList.toggle("ec-promo-price", a.extra === 0);
          q("#ec-annual-detail").textContent =
            miniSchedule("annual") + " za pakiet i dodatki.";
          if (!a.items.length) q("#ec-items").textContent = "Brak dodatków.";
          q("#ec-items").setAttribute(
            "aria-label",
            "Łączna wartość dodatków rozłożonych na cały okres umowy",
          );
        }
        function syncMiniTemplateSubmit() {
          // Aktywne Wyślij we wszystkich pakietach. Walidacja szablonu następuje
          // przy próbie wysłania, nie przez blokadę przycisku.
          // Stan przycisku w czasie wysyłki kontroluje wyłącznie obsługa submit.
          q("#ec-mini-template-required").hidden=true;
          q("#ec-mini-template-required").textContent="Aby wysłać zapytanie dotyczące pakietu "+current.name+", wybierz szablon albo zaznacz opcję „Szablon wybiorę później” w galerii.";
          const templateLine=q("#ec-summary .ec-summary-template-line");
          if(templateLine && hasTemplateLibrary(current) && states[current.id].templateId){
            templateLine.classList.remove("is-invalid");
            templateLine.querySelector(".ec-summary-template-validation")?.setAttribute("hidden","");
            templateLine.querySelector("[data-ec-summary-template-browse]")?.removeAttribute("aria-invalid");
          }
          // Po dokonaniu wyboru usuń poprzedni komunikat z formularza.
          if(hasTemplateLibrary(current) && states[current.id].templateId)q("#ec-form-error").hidden=true;
        }
        q("#ec-shop-needs").addEventListener("input",()=>{if(current.individual){states[current.id].needs=q("#ec-shop-needs").value;q("#ec-quote-payload").value=quoteText();}});
        function summary(baseChoice) {
          singlePaymentSummary(baseChoice);
          q("#ec-quote-payload").value = quoteText();
          syncMiniTemplateSubmit();
        }
      })();
