
const qualities=[
{id:'gold',name:'Goldstandard: LEGO, COBI',factor:1,description:'Sehr hohe Klemmkraft, hervorragende Toleranzen, hohe Farbkonstanz und ein sehr verlässliches Bauerlebnis.'},
{id:'high',name:'Hohe Qualität: GoBricks, Mould King, Pantasy, LumiBricks',factor:.92,description:'Sehr gute Steinequalität mit hoher Klemmkraft und guter Farbtreue, nahe am Premium-Bereich.'},
{id:'upper',name:'Gute Mittelklasse: CaDA, Qman, Panlos',factor:.85,description:'Meist gute Qualität, aber je nach Set, Charge oder Zulieferer mit leichten Schwankungen.'},
{id:'casual',name:'Casual: BlueBrixx, BlueBrixx Specials, Modbrix, Qunlong, Xingbao',factor:.7,description:'Solide Budget- bis Alltagsklasse mit möglichen Schwankungen.'},
{id:'specials',name:'Budget/Casual: Sluban, WOMA, JieStar',factor:.65,description:'Stärker schwankende Klemmkraft und Toleranz.'},
{id:'budget',name:'Günstig / No-Name-China-Hersteller',factor:.5,description:'Hit-or-miss: sehr günstig, aber mit erhöhtem Risiko bei Farbtreue, Graten, Klemmkraft und Passgenauigkeit.'}
];
const $=id=>document.getElementById(id);
const deNum=v=>{let s=String(v||'').trim().replaceAll(' ','').replaceAll('€','').replace(/[^0-9,.]/g,'');if(!s)return 0;const c=s.lastIndexOf(','),d=s.lastIndexOf('.');if(c>d)s=s.replaceAll('.','').replace(',','.');else if(d>-1)s=s.replaceAll(',','');const n=parseFloat(s);return Number.isFinite(n)?n:0};
const money=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(n||0);
const num=(n,d=2)=>new Intl.NumberFormat('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d}).format(n||0);
qualities.forEach(q=>{const o=document.createElement('option');o.value=q.id;o.textContent=q.name;$('quality').appendChild(o)});
function calc(){
 const p=Math.max(0,deNum($('price').value)), t=parseInt(String($('parts').value).replace(/\D/g,''),10)||0, r=Math.max(0,deNum($('discount').value));
 const q=qualities.find(x=>x.id===$('quality').value)||qualities[0];
 const rabatt=p*r/100,total=Math.max(0,p-rabatt),c=t>0?total/t*100:0,premium=q.factor>0?c/q.factor:c;
 let label='Keine Bewertung',desc='Bitte gib einen Setpreis und eine Teileanzahl ein.';
 if(t>0&&total>0){if(premium<5){label='Sehr guter Preis';desc='Unter fünf Cent pro Stein ist stark – vor allem ohne große Abstriche bei Qualität oder Druckteilen.'}
 else if(premium<8){label='Fairer Preis';desc='Zwischen fünf und acht Cent pro Stein ist für viele Klemmbaustein-Sets ein solider Bereich.'}
 else if(premium<12){label='Eher teuer';desc='Hier sollte das Set mit Lizenz, Figuren, Prints, Formteilen oder besonderer Qualität punkten.'}
 else{label='Teuer';desc='Über zwölf Cent pro Stein ist happig – außer es gibt starke Gründe wie Lizenz, Limitierung oder Spezialteile.'}}
 $('qualityHelp').textContent=q.description;$('rebate').textContent=money(rabatt);$('total').textContent=money(total);$('factor').textContent=String(q.factor).replace('.',',');
 $('cents').textContent=t>0&&total>0?num(c):'—';$('perPart').textContent=t>0&&total>0?`${money(total/t)} pro Teil`:'Noch keine gültige Berechnung';
 $('premium').textContent=t>0&&total>0?num(premium):'—';$('label').textContent=label;$('desc').textContent=desc;
 $('review').textContent=t>0&&total>0?`Preis pro Stein: ca. ${num(c)} Cent. Qualitätsbereinigt: ca. ${num(premium)} Cent Premium-Vergleichswert. Herstellerklasse: ${q.name}. Gesamt gerechnet mit ${money(total)} bei ${t.toLocaleString('de-DE')} Teilen. Bewertung: ${label}.`:'Preis pro Stein: Bitte Setpreis und Teileanzahl eintragen.';
}
['price','parts','discount','quality'].forEach(id=>$(id).addEventListener(id==='quality'?'change':'input',calc));calc();

let deferredPrompt;
const installBtn=document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;installBtn.style.display='block';});
installBtn?.addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;installBtn.style.display='none';});
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));}
