
const $=id=>document.getElementById(id);
const deNum=v=>{let s=String(v||'').trim().replaceAll(' ','').replaceAll('€','').replace(/[^0-9,.]/g,'');if(!s)return 0;const c=s.lastIndexOf(','),d=s.lastIndexOf('.');if(c>d)s=s.replaceAll('.','').replace(',','.');else if(d>-1)s=s.replaceAll(',','');const n=parseFloat(s);return Number.isFinite(n)?n:0};
const money=n=>new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(n||0);
const num=(n,d=2)=>new Intl.NumberFormat('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d}).format(n||0);
function calc(){
 const price=Math.max(0,deNum($('price').value)), weight=Math.max(0,deNum($('weight').value)), discount=Math.max(0,deNum($('discount').value));
 const rebate=price*discount/100,total=Math.max(0,price-rebate),per100=weight>0?total/weight*100:0,perKg=weight>0?total/weight*1000:0;
 let label='Keine Bewertung',desc='Bitte Preis und Gewicht eintragen.';
 if(total>0&&weight>0){if(per100<2){label='Sehr günstig';desc='Unter 2 € pro 100 g ist ein sehr niedriger Kilopreis.'}
 else if(per100<4){label='Günstig';desc='Zwischen 2 € und 4 € pro 100 g ist preislich attraktiv.'}
 else if(per100<7){label='Mittlerer Preis';desc='Zwischen 4 € und 7 € pro 100 g liegt das Set im mittleren Bereich.'}
 else{label='Hoher Gewichtspreis';desc='Über 7 € pro 100 g ist vergleichsweise teuer. Figuren, Prints, Lizenz und Spezialteile können das erklären.'}}
 $('rebate').textContent=money(rebate);$('total').textContent=money(total);$('per100').textContent=total>0&&weight>0?money(per100):'—';$('perKg').textContent=total>0&&weight>0?money(perKg):'—';
 $('label').textContent=label;$('desc').textContent=desc;
 $('review').textContent=total>0&&weight>0?`Preis pro 100 g: ${money(per100)}. Kilopreis: ${money(perKg)}. Berechnet mit ${money(total)} bei ${num(weight,0)} g. Bewertung: ${label}.`:'Preis pro 100 g: Bitte Setpreis und Gewicht eintragen.';
}
['price','weight','discount'].forEach(id=>$(id).addEventListener('input',calc));calc();

let deferredPrompt;
const installBtn=document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;installBtn.style.display='block';});
installBtn?.addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;installBtn.style.display='none';});
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js'));}
