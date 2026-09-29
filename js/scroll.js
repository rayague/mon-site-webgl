/* scroll.js — révélations au scroll : apparaitions en œil, fentes,
   titres mot par mot, compteurs. CSS scroll-driven quand supporté,
   repli IntersectionObserver sinon. */

export const SCROLL_OK = (() => {
  try { return CSS.supports('animation-timeline', 'view()') || 'animationTimeline' in document.documentElement.style; }
  catch (e) { return false; }
})();

const ioOptions = { rootMargin: '0px 0px -12% 0px', threshold: 0 };
let io = null;
function ensureIO(){
  if (io) return io;
  io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      io.unobserve(el);
      if (el.classList.contains('reveal-title')) titleIn(el);
      else if (el.classList.contains('fente')) el.classList.add('in');
      else if (el.classList.contains('counter')) countUp(el);
      else el.classList.add('in');
    });
  }, ioOptions);
  return io;
}

/* Découpe un titre en mots pour l'apparition lettre/mot par mot */
function splitWords(el){
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute('aria-label', el.textContent.trim());
  el.textContent = '';
  const frag = document.createDocumentFragment();
  words.forEach((w, i) => {
    const s = document.createElement('span');
    s.className = 'wd';
    s.style.transitionDelay = (i * 28) + 'ms';
    s.textContent = w + (i < words.length - 1 ? ' ' : '');
    frag.appendChild(s);
  });
  el.appendChild(frag);
}

function titleIn(el){
  el.classList.add('in');
  el.querySelectorAll('.wd').forEach(w => {
    w.classList.add('boom');
    setTimeout(() => w.classList.add('fade'), 420);
  });
}

/* Compteurs animés qui défilent à l'entrée */
function countUp(card){
  card.classList.add('in');
  const val = card.querySelector('.val');
  if (!val || card.dataset.done) return;
  card.dataset.done = '1';
  const target = parseFloat(val.dataset.target);
  const suffix = val.dataset.suffix || '';
  const t0 = performance.now();
  const tick = now => {
    const k = Math.min(1, (now - t0) / 1300);
    const eased = 1 - Math.pow(1 - k, 3);
    val.textContent = Math.round(target * eased) + suffix;
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* Balaye un conteneur et enregistre les éléments à révéler.
   Tous les reveals passent par IntersectionObserver (fiable partout) :
   titres mot par mot, compteurs, cartes et fentes. */
export function scan(root = document){
  const obs = ensureIO();
  root.querySelectorAll('.reveal-title').forEach(el => { splitWords(el); obs.observe(el); });
  root.querySelectorAll('.counter').forEach(el => obs.observe(el));
  root.querySelectorAll('.wake, .fente').forEach(el => obs.observe(el));
}