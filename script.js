'use strict';
const waNumber = '918309982456';
let language = 'en';
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelector('[data-year]')?.replaceChildren(String(new Date().getFullYear()));
const splash = document.querySelector('.splash');
if (splash) setTimeout(() => splash.remove(), reducedMotion ? 0 : 1800);
const menu = document.querySelector('.menu');
const nav = document.querySelector('#nav');
const closeMenu = () => { nav?.classList.remove('open'); menu?.setAttribute('aria-expanded','false'); menu?.setAttribute('aria-label','Open navigation'); };
menu?.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; nav.classList.toggle('open',open); menu.setAttribute('aria-expanded',String(open)); menu.setAttribute('aria-label',open ? 'Close navigation' : 'Open navigation'); });
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
const reveals = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); reveals.unobserve(entry.target); } }), {threshold:.08});
document.querySelectorAll('.reveal').forEach(element => reveals.observe(element));
// Visible-tab autoplay. Hover and focus never leave the full-screen carousel stuck.
const hero = document.querySelector('.hero');
if (hero) {
  const slides = [...hero.querySelectorAll('.hero-slide')];
  const pause = hero.querySelector('[data-pause]');
  let active = 0, paused = reducedMotion, timer;
  const paint = delta => {
    active = (active + delta + slides.length) % slides.length;
    slides.forEach((slide,i) => { slide.classList.toggle('active',i === active); slide.inert = i !== active; slide.setAttribute('aria-hidden',String(i !== active)); });
    hero.querySelector('[data-slide-count]').textContent = `${String(active + 1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
  };
  const run = () => { clearInterval(timer); if (!paused && !document.hidden) timer = setInterval(() => paint(1),7000); };
  const paintPause = () => { pause.setAttribute('aria-pressed',String(paused)); pause.setAttribute('aria-label',paused ? 'Play slideshow' : 'Pause slideshow'); pause.textContent = paused ? '▷' : 'Ⅱ'; };
  hero.querySelector('[data-prev]').addEventListener('click',() => { paint(-1); run(); });
  hero.querySelector('[data-next]').addEventListener('click',() => { paint(1); run(); });
  pause.addEventListener('click',() => { paused = !paused; paintPause(); run(); });
  hero.addEventListener('keydown',event => { if (['ArrowLeft','ArrowRight'].includes(event.key)) { event.preventDefault(); paint(event.key === 'ArrowLeft' ? -1 : 1); run(); } });
  document.addEventListener('visibilitychange',run);paint(0);paintPause();run();
}
// Region extents provide geographic context, not an offer or survey boundary.
const areas = {
  thullur:{name:'Thullur',te:'తుళ్లూరు',bbox:[80.36,16.46,80.55,16.61],en:'Explore the wider capital-city setting. Verify the individual plot’s land-use classification, approach road and sanctioned layout before proceeding.',telugu:'రాజధాని ప్రాంతాన్ని పరిశీలించండి. ముందుగా ప్రతి ప్లాట్ భూ వినియోగం, రవాణా మార్గం, ఆమోదిత లేఅవుట్ వివరాలను ధృవీకరించండి.'},
  velagapudi:{name:'Velagapudi',te:'వెలగపూడి',bbox:[80.46,16.46,80.60,16.58],en:'Explore the administrative-capital setting. Check the exact survey number, zoning, road access and development status of any property being considered.',telugu:'పరిపాలనా రాజధాని పరిసరాలను తెలుసుకోండి. సర్వే నంబర్, జోనింగ్, రవాణా, అభివృద్ధి స్థితిని విడిగా పరిశీలించండి.'},
  mangalagiri:{name:'Mangalagiri',te:'మంగళగిరి',bbox:[80.50,16.37,80.68,16.53],en:'Consider the broader urban context and connections within the region. Confirm the property’s jurisdiction, actual access and surrounding amenities on site.',telugu:'ప్రాంతీయ రవాణా, నగర పరిసరాలను పరిశీలించండి. ఆస్తి పరిధి, రవాణా, స్థానిక సౌకర్యాలను సైట్ వద్ద ధృవీకరించండి.'},
  tadepalli:{name:'Tadepalli',te:'తాడేపల్లి',bbox:[80.54,16.43,80.70,16.56],en:'Explore the Vijayawada-facing regional setting. Verify river and drainage exposure, land-use permissions and the legal status of the specific plot.',telugu:'విజయవాడ వైపు ఉన్న ప్రాంతాన్ని పరిశీలించండి. నది, డ్రైనేజీ ప్రభావం, భూ వినియోగ అనుమతులు, ఆస్తి చట్టబద్ధ స్థితిని ధృవీకరించండి.'}
};
let selectedArea = 'thullur';
function renderArea(updateMap = false) {
  const area = areas[selectedArea];
  document.querySelector('[data-area-title]').textContent = language === 'te' ? area.te : area.name;
  document.querySelector('[data-area-note]').textContent = language === 'te' ? area.telugu : area.en;
  document.querySelector('[data-area-plan]').textContent = language === 'te' ? `${area.te} కోసం లెక్కలు చూడండి ↗` : `Model a scenario for ${area.name} ↗`;
  document.querySelector('[data-plan-area]').textContent = `${language === 'te' ? 'ఆసక్తి ఉన్న ప్రాంతం' : 'AREA OF INTEREST'} · ${language === 'te' ? area.te : area.name.toUpperCase()}`;
  if (updateMap) document.querySelector('#region-map').src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(area.bbox.join(','))}&layer=mapnik`;
  document.querySelectorAll('[data-area]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.area === selectedArea)));
}
document.querySelectorAll('[data-area]').forEach(button => button.addEventListener('click',() => { selectedArea = button.dataset.area; renderArea(true); }));
const langButton = document.querySelector('[data-language]');
langButton?.addEventListener('click',() => {
  language = language === 'en' ? 'te' : 'en';
  document.documentElement.lang = language;
  document.querySelectorAll('[data-en][data-te]').forEach(element => { element.innerHTML = element.dataset[language]; });
  langButton.innerHTML = language === 'en' ? 'తెలుగు <b>EN</b>' : 'English <b>తె</b>';
  langButton.setAttribute('aria-label',language === 'en' ? 'Switch website to Telugu' : 'Switch website to English');
  if (document.querySelector('[data-area-title]')) renderArea();
});
// All appreciation rates and costs are visitor-controlled assumptions.
const planner = document.querySelector('.planner-controls');
function modelScenario(priceLakh, years, annualRate, entryPercent, exitPercent) {
  const price = priceLakh * 100000;
  const outlay = price * (1 + entryPercent / 100);
  const gross = price * (1 + annualRate / 100) ** years;
  const proceeds = gross * (1 - exitPercent / 100);
  return {price, outlay, gross, proceeds, gain:proceeds-outlay, roi:(proceeds-outlay)/outlay*100};
}
const money = rupees => `${rupees < 0 ? '−' : ''}₹${(Math.abs(rupees)/100000).toFixed(2)} lakh`;
let latestScenario;
function renderPlanner() {
  const get = id => Number(document.getElementById(id).value);
  const price = get('investment'), years = get('years'), rate = get('growth');
  const entry = Math.min(30,Math.max(0,get('entry-cost'))), exit = Math.min(20,Math.max(0,get('exit-cost')));
  const result = modelScenario(price,years,rate,entry,exit);
  latestScenario = {price,years,rate,entry,exit,...result};
  document.querySelector('[data-budget-label]').textContent = `₹${price} lakh`;
  document.querySelector('[data-years-label]').textContent = `${years} ${years === 1 ? 'year' : 'years'}`;
  document.querySelector('[data-growth-label]').textContent = `${rate}%`;
  document.querySelector('[data-selected-rate]').textContent = `${rate}%`;
  document.querySelector('[data-resale]').textContent = money(result.proceeds);
  document.querySelector('[data-outlay]').textContent = money(result.outlay);
  document.querySelector('[data-gain]').textContent = money(result.gain);
  document.querySelector('[data-roi]').textContent = `${result.roi.toFixed(1)}%`;
  const rates = [-5,0,rate,12], colors = ['#ae6b58','#94a3a8','#168f87','#d49a38'];
  const max = Math.max(...rates.map(r => price*(1+r/100)**years)) * 1.08;
  const left=52,right=620,top=20,bottom=255;
  const x = year => left+(right-left)*year/years;
  const y = value => bottom-(bottom-top)*value/max;
  document.querySelector('[data-chart-grid]').innerHTML = Array.from({length:5},(_,i) => { const value=max*i/4;return `<line x1="${left}" y1="${y(value)}" x2="${right}" y2="${y(value)}" stroke="#dfe6e4"/><text x="${left-8}" y="${y(value)+3}" text-anchor="end">₹${value.toFixed(0)}L</text>`; }).join('');
  document.querySelector('[data-chart-paths]').innerHTML = rates.map((r,index) => `<path d="${Array.from({length:years*12+1},(_,i) => { const t=i/12;return `${i ? 'L' : 'M'}${x(t).toFixed(2)},${y(price*(1+r/100)**t).toFixed(2)}`; }).join(' ')}" fill="none" stroke="${colors[index]}" stroke-width="${index === 2 ? 3.5 : 2}" ${index === 2 ? '' : 'stroke-dasharray="5 4"'}/>`).join('');
  document.querySelector('[data-chart-labels]').innerHTML = Array.from({length:years+1},(_,i) => `<text x="${x(i)}" y="278" text-anchor="middle">${i === 0 ? 'Today' : 'Yr '+i}</text>`).join('');
}
if (planner) { planner.querySelectorAll('input').forEach(input => input.addEventListener('input',renderPlanner));renderPlanner(); }
function openWhatsApp(lines) { window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(lines.join('\n'))}`,'_blank','noopener,noreferrer'); }
document.querySelector('[data-share-scenario]')?.addEventListener('click',() => {
  const s=latestScenario;
  openWhatsApp(['Hello Amaravathi Infra Projects, I would like to discuss this illustrative scenario:',`Area of interest: ${areas[selectedArea].name}`,`Purchase price: ${money(s.price)}`,`Holding period: ${s.years} years`,`Assumed annual price change: ${s.rate}%`,`Assumed entry / exit costs: ${s.entry}% / ${s.exit}%`,`Modelled net proceeds: ${money(s.proceeds)}`,`Modelled total return: ${s.roi.toFixed(1)}%`,'I understand this is a mathematical scenario, not a guaranteed return.']);
});
document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click',() => { document.querySelector('#service-choice').value=link.dataset.service; }));
document.querySelector('[data-enquiry]')?.addEventListener('submit',event => {
  event.preventDefault();
  const lines=['Hello Amaravathi Infra Projects, I would like to discuss my requirements:'];
  new FormData(event.currentTarget).forEach((value,key)=>{if(String(value).trim())lines.push(`${key}: ${String(value).trim()}`);});
  lines.push(`Preferred website language: ${language === 'te' ? 'Telugu' : 'English'}`);
  openWhatsApp(lines);
});
