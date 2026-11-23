const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync("app.js","utf8");
const css = fs.readFileSync("styles.css","utf8");
const nodes = new Map(), handlers = {}, rootHandlers = {};
function node(key) {
  if(!nodes.has(key)){
    const value={innerHTML:"",value:"",hidden:key==="#ens-overlay",style:{overflow:""},scrollTop:0,
      focus(){},select(){},scrollIntoView(){},
      addEventListener(name,fn){handlers[key+":"+name]=fn;},
      getClientRects(){return [1];}};
    nodes.set(key,value);
  }
  return nodes.get(key);
}
const root={querySelector:node,querySelectorAll:()=>[],addEventListener:(name,fn)=>rootHandlers[name]=fn};
const document={
  body:{style:{overflow:""}},
  getElementById:(id)=>id==="enishop"?root:null,
  addEventListener:()=>{},execCommand:()=>true
};
vm.runInNewContext(source,{document,window:{isSecureContext:false},navigator:{},Intl,Set,console});
const card=node("#ens-cards").innerHTML;
for(const name of ["Start e-Commerce","Standard","PRO","Business"])assert.ok(card.includes(name),name);
assert.equal((card.match(/class="ens-card ens-/g)||[]).length,4);
assert.match(card,/2[\u00a0\u202f ]?290/);
assert.match(card,/Wycena<br>indywidualna/);
assert.doesNotMatch(card,/8[ \u00a0\u202f]?990/);
assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
assert.match(css,/align-items:start/);
const click=(selector,element)=>rootHandlers.click({target:{closest:(looking)=>looking===selector?element:null}});
function choose(id,mode){click("[data-plan][data-mode]",{dataset:{plan:id,mode},focus(){}});}
function next(){handlers["#ens-next:click"]();}
function switchExtra(key,checked){rootHandlers.change({target:{dataset:{addon:key},checked}});}
function counter(key,n){click("[data-counter][data-delta]",{dataset:{counter:key,delta:String(n)}});}
function setPrimary(code){rootHandlers.change({target:{dataset:{},hasAttribute:(a)=>a==="data-primary-payment",value:code}});}
function addLanguage(name){node("#ens-language-select").value=name;click("[data-action]",{dataset:{action:"add-language"}});}
function asideHasPrice(n){assert.match(node("#ens-aside").innerHTML,new RegExp(String(n).replace(/\B(?=(\d{3})+(?!\d))/g,"[ \\u00a0\\u202f]?")));}
choose("start","configure");
assert.equal(node("#ens-overlay").hidden,false);
assert.match(node("#ens-dialog-content").innerHTML,/5 w cenie/);
assert.match(node("#ens-dialog-content").innerHTML,/Envato Market/);
assert.match(node("#ens-dialog-content").innerHTML,/1 godzina/);
asideHasPrice(2290);
next(); // 1 products
assert.match(node("#ens-dialog-content").innerHTML,/Komplet typowych podstron/);
counter("simple",1);asideHasPrice(2305);
next(); // 2 payments & deliveries
assert.match(node("#ens-dialog-content").innerHTML,/Klarna/);
assert.match(node("#ens-dialog-content").innerHTML,/fulfillment/i);
setPrimary("stripe");
assert.match(node("#ens-dialog-content").innerHTML,/Stripe/);
assert.match(node("#ens-dialog-content").innerHTML,/W cenie/);
asideHasPrice(2305);
switchExtra("paypal",true);asideHasPrice(2555);
next(); // 3 integrations
for(const label of ["iFirma","Fakturownia","Allegro","BaseLinker","SellAssist","Subiekt GT","Comarch ERP Optima","Logowanie przez Facebook"])assert.ok(node("#ens-dialog-content").innerHTML.includes(label),label);
switchExtra("ifirma",true);asideHasPrice(2805);
next(); // 4 marketing
for(const label of ["Google Analytics 4","Google Search Console","Porzucone koszyki","Sklep na Facebooku"])assert.ok(node("#ens-dialog-content").innerHTML.includes(label),label);
switchExtra("ga4",true);asideHasPrice(3005);
next(); // 5 languages
assert.match(node("#ens-dialog-content").innerHTML,/Wybierz język/);
addLanguage("Niemiecki");
assert.match(node("#ens-dialog-content").innerHTML,/Niemiecki/);
assert.match(node("#ens-aside").innerHTML,/dodatkow/);
next(); // 6 summary
assert.match(node("#ens-dialog-content").innerHTML,/3[\u00a0\u202f ]?005/);
assert.match(node("#ens-dialog-content").innerHTML,/Niemiecki/);
assert.match(node("#ens-dialog-content").innerHTML,/Do wyceny/);
choose("standard","configure");
next();next(); // payments
switchExtra("inpost",true);asideHasPrice(3100);
choose("pro","configure");
next();next();
assert.match(node("#ens-dialog-content").innerHTML,/InPost/);
assert.match(node("#ens-dialog-content").innerHTML,/W cenie/);
asideHasPrice(4500);
choose("business","direct");
assert.match(node("#ens-dialog-content").innerHTML,/Wycena indywidualna/);
assert.doesNotMatch(node("#ens-dialog-content").innerHTML,/8[ \u00a0\u202f]?990/);
rootHandlers.input({target:{dataset:{client:"clientName"},value:"Firma Testowa"}});
rootHandlers.input({target:{dataset:{client:"clientEmail"},value:"test@example.com"}});
rootHandlers.submit({target:{id:"ens-lead-form"},preventDefault(){}});
assert.match(node("#ens-dialog-content").innerHTML,/Zapytanie przygotowane/);
assert.match(node("#ens-quote-copy").value,/Firma Testowa/);
console.log("PASS: four packages, seven steps, payment logic, integrations, languages, pricing and Business enquiry");
