const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync("app.js","utf8");
const nodes = new Map(), handlers = {}, rootHandlers = {};
function node(key){
  if (!nodes.has(key)) {
    const n = {innerHTML:"",value:"",hidden:key==="#ens-overlay",style:{overflow:""},scrollTop:0,
      focus(){},select(){},scrollIntoView(){},
      addEventListener(name,fn){handlers[key+":"+name]=fn;},
      getClientRects(){return [1];}};
    nodes.set(key,n);
  }
  return nodes.get(key);
}
const root={
  querySelector:node,
  querySelectorAll:()=>[],
  addEventListener:(name,fn)=>{rootHandlers[name]=fn;}
};
const document={
  body:{style:{overflow:""}},
  getElementById:(id)=>id==="enishop"?root:null,
  addEventListener:()=>{},
  execCommand:()=>true
};
vm.runInNewContext(source,{document,window:{isSecureContext:false},navigator:{},Intl,Set,console});
const card=node("#ens-cards").innerHTML;
assert.match(card,/Standard/);
assert.match(card,/Business/);
assert.match(card,/Wycena<br>indywidualna/);
assert.match(card,/POLECANY/);
assert.doesNotMatch(card,/8[ \u00a0\u202f]?990/);
function click(selector,element){
  rootHandlers.click({target:{closest:(looked)=>looked===selector?element:null}});
}
function choose(id,mode){
  click("[data-plan][data-mode]",{dataset:{plan:id,mode},focus(){}});
}
function next(){handlers["#ens-next:click"]();}
function changeAddon(key,checked){rootHandlers.change({target:{dataset:{addon:key},checked}});}
function counter(key,delta){click("[data-counter][data-delta]",{dataset:{counter:key,delta:String(delta)}});}
function digits(s){return String(s).replace(/\D/g,"");}
choose("standard","configure");
assert.equal(node("#ens-overlay").hidden,false);
assert.match(node("#ens-dialog-content").innerHTML,/10 w cenie/);
assert.match(node("#ens-aside").innerHTML,/2[\u00a0\u202f ]?800/);
next();
counter("simple",1);
assert.match(node("#ens-dialog-content").innerHTML,/output aria-live="polite">1<\/output>/);
assert.match(node("#ens-aside").innerHTML,/2[\u00a0\u202f ]?815/);
changeAddon("inpost",true);
assert.match(node("#ens-aside").innerHTML,/3[\u00a0\u202f ]?115/);
next();next();next();
assert.match(node("#ens-dialog-content").innerHTML,/3[\u00a0\u202f ]?115/);
assert.match(node("#ens-dialog-content").innerHTML,/Zaliczka 50%/);
choose("pro","configure");
next();
assert.match(node("#ens-dialog-content").innerHTML,/InPost/);
assert.match(node("#ens-dialog-content").innerHTML,/W cenie/);
assert.match(node("#ens-aside").innerHTML,/4[\u00a0\u202f ]?500/);
choose("business","direct");
assert.match(node("#ens-dialog-content").innerHTML,/Wycena/);
assert.doesNotMatch(node("#ens-dialog-content").innerHTML,/8[ \u00a0\u202f]?990/);
const nameInput={dataset:{client:"clientName"},value:"Firma Testowa"};
const emailInput={dataset:{client:"clientEmail"},value:"test@example.com"};
rootHandlers.input({target:nameInput});
rootHandlers.input({target:emailInput});
rootHandlers.submit({target:{id:"ens-lead-form"},preventDefault(){}});
assert.match(node("#ens-dialog-content").innerHTML,/Zapytanie przygotowane/);
assert.match(node("#ens-quote-copy").value,/Firma Testowa/);
console.log("PASS: 3 packages, standard pricing, paid add-ons, included PRO options, Business lead and demo quote");
