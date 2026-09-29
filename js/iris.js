/* iris.js — boucle rAF unique du site : halo qui suit la souris,
   regard de l'iris, et repli des animations scroll-driven (--eclipse,
   barre de progression, parallaxe, rail des catégories).
   La boucle se met en pause quand l'onglet est masqué. */

import { SCROLL_OK } from './scroll.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- suivi de souris pour les halos ---- */
const mouse = { x: 0, y: 0 };
let hovered = null;
addEventListener('pointermove', e => {
  mouse.x = (e.clientX / innerWidth - .5) * 2;
  mouse.y = (e.clientY / innerHeight - .5) * 2;
  const t = e.target.closest && e.target.closest('.card, .btn');
  if (t !== hovered) {
    hovered = t;
    if (t) {
      const r = t.getBoundingClientRect();
      t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      t.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }
  } else if (t) {
    const r = t.getBoundingClientRect();
    t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    t.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }
}, { passive: true });

/* ---- éléments qui « regardent » la souris (iris du hero) ---- */
const gazes = [...document.querySelectorAll('[data-gaze]')];

/* ---- replis de scroll (navigateurs sans animation-timeline) ---- */
const body = document.body;
const progress = document.querySelector('.scrollbar');
const nav = document.querySelector('.nav');
const parallax = [...document.querySelectorAll('.hero-layer')];

let raf = 0, running = false;
function loop(now){
  if (document.hidden) { running = false; return; }
  step();
  raf = requestAnimationFrame(loop);
}
function start(){
  if (running) return;
  running = true;
  raf = requestAnimationFrame(loop);
}
document.addEventListener('visibilitychange', () => (document.hidden ? (running = false) : start()));

function step(){
  /* regard de l'iris */
  if (!reduced) {
    for (const g of gazes) {
      const s = parseFloat(g.dataset.gaze || '12');
      g.style.transform = `translate3d(${(mouse.x * s).toFixed(1)}px, ${(mouse.y * s * .55).toFixed(1)}px, 0)`;
    }
  }

  if (SCROLL_OK) return;

  /* --- repli : --eclipse, barre, navigation, parallaxe --- */
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const p = Math.min(1, Math.max(0, scrollY / max));
  body.style.setProperty('--eclipse', p.toFixed(4));
  if (progress) progress.style.transform = `scaleX(${p.toFixed(4)})`;
  if (nav) nav.classList.toggle('scrolled', scrollY > 8);

  if (parallax.length) {
    const rel = Math.min(1, scrollY / (innerHeight * .9));
    for (const el of parallax) {
      const k = parseFloat(el.dataset.para || '0');
      el.style.transform = `translate3d(0, ${(-rel * k * 180).toFixed(1)}px, 0)`;
    }
  }
}

start();