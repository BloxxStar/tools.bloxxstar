(()=>{
  const script=document.createElement('script');
  const current=document.currentScript?.src||'';
  script.src=new URL('i18n.js',current||location.href).href;
  script.defer=true;
  document.head.append(script);
})();

(()=>{
  const root=document.documentElement;
  const themeButtons=[...document.querySelectorAll('[data-theme-toggle]')];
  const saved=localStorage.getItem('bloxxstar-theme');
  const preferred=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
  const t=value=>window.BloxxI18n?.t(value)||value;
  const applyTheme=theme=>{
    root.dataset.theme=theme;
    themeButtons.forEach(btn=>{
      const dark=theme==='dark';
      const label=t(dark?'Helles Farbschema aktivieren':'Dunkles Farbschema aktivieren');
      btn.setAttribute('aria-label',label);
      btn.setAttribute('title',label);
      const icon=btn.querySelector('.theme-icon'); if(icon) icon.textContent=dark?'☀':'☾';
    });
    document.querySelectorAll('meta[name="theme-color"]').forEach(m=>m.content=theme==='dark'?'#0d1218':'#ffffff');
  };
  applyTheme(saved||preferred);
  themeButtons.forEach(btn=>btn.addEventListener('click',()=>{const next=root.dataset.theme==='dark'?'light':'dark';localStorage.setItem('bloxxstar-theme',next);applyTheme(next)}));
  window.addEventListener('bloxxstar:languagechange',()=>applyTheme(root.dataset.theme||'light'));

  const b=document.querySelector('.menu-btn'),d=document.querySelector('.drawer'),c=document.querySelector('.drawer-close'),s=document.querySelector('.scrim');
  if(!b||!d)return;
  let previousFocus=null;
  const focusable=()=>[...d.querySelectorAll('a[href],button:not([disabled])')];
  const open=()=>{previousFocus=document.activeElement;d.classList.add('open');s?.classList.add('show');d.setAttribute('aria-hidden','false');b.setAttribute('aria-expanded','true');document.body.classList.add('menu-open');focusable()[0]?.focus()};
  const close=()=>{d.classList.remove('open');s?.classList.remove('show');d.setAttribute('aria-hidden','true');b.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open');previousFocus?.focus()};
  b.addEventListener('click',()=>b.getAttribute('aria-expanded')==='true'?close():open());c?.addEventListener('click',close);s?.addEventListener('click',close);
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&d.classList.contains('open'))close();
    if(e.key==='Tab'&&d.classList.contains('open')){const f=focusable();if(!f.length)return;const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
  });
})();

// Bezugsquellen: Logos, Suche, Filter, Rabattcodes und Weiterleitung
(()=>{
  document.querySelectorAll('.partner-logo img').forEach(img=>img.addEventListener('error',()=>img.closest('.partner-logo')?.classList.add('logo-fallback')));

  document.querySelectorAll('[data-copy]').forEach(button=>button.addEventListener('click',async()=>{
    const original=button.textContent;
    try{await navigator.clipboard.writeText(button.dataset.copy||'');button.textContent=window.BloxxI18n?.t('Kopiert ✓')||'Kopiert ✓'}
    catch{button.textContent=window.BloxxI18n?.t('Code markieren')||'Code markieren';const strong=button.parentElement?.querySelector('strong');if(strong){const range=document.createRange();range.selectNodeContents(strong);const sel=getSelection();sel?.removeAllRanges();sel?.addRange(range)}}
    setTimeout(()=>button.textContent=original,1800);
  }));

  const search=document.querySelector('#partner-search');
  const cards=[...document.querySelectorAll('.partner-card')];
  const filters=[...document.querySelectorAll('[data-filter]')];
  const count=document.querySelector('#partner-count');
  const empty=document.querySelector('#no-partners');
  let active='all';
  const update=()=>{
    const locale=window.BloxxI18n?.language||'de';
    const term=(search?.value||'').trim().toLocaleLowerCase(locale);let visible=0;
    cards.forEach(card=>{const haystack=`${card.dataset.name||''} ${card.dataset.tags||''} ${card.textContent||''}`.toLocaleLowerCase(locale);const category=active==='all'||(card.dataset.tags||'').split(' ').includes(active);const show=category&&(!term||haystack.includes(term));card.hidden=!show;if(show)visible++});
    if(count)count.textContent=String(visible);if(empty)empty.hidden=visible!==0;
  };
  search?.addEventListener('input',update);
  window.addEventListener('bloxxstar:languagechange',update);
  filters.forEach(button=>button.addEventListener('click',()=>{active=button.dataset.filter||'all';filters.forEach(item=>{const selected=item===button;item.classList.toggle('active',selected);item.setAttribute('aria-pressed',String(selected))});update()}));

  const dialog=document.querySelector('#support-dialog');
  const continueLink=document.querySelector('#dialog-continue');
  let timer=0;
  document.querySelectorAll('.shop-link').forEach(link=>link.addEventListener('click',event=>{
    if(!dialog||typeof dialog.showModal!=='function')return;
    event.preventDefault();const url=link.href;if(continueLink)continueLink.href=url;dialog.showModal();clearTimeout(timer);timer=window.setTimeout(()=>{if(dialog.open)location.href=url},1300);
  }));
  document.querySelector('[data-dialog-cancel]')?.addEventListener('click',()=>{clearTimeout(timer);dialog?.close()});
  continueLink?.addEventListener('click',()=>clearTimeout(timer));
  dialog?.addEventListener('cancel',()=>clearTimeout(timer));
})();