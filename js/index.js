/* index.js — accueil : rubriques, à la une, derniers bulletins, compteurs. */
import { load, CATEGORIES, decade } from './data.js';
import { mount, card } from './card.js';
import { scan, SCROLL_OK } from './scroll.js';
import './iris.js';
import { wireModals } from './ui.js';

const data = await load();

/* --- rubriques : trilogie décomptée + liens --- */
const byCat = c => data.filter(a => a.categorie === c);
const track = document.getElementById('catsTrack');
track.innerHTML = CATEGORIES.map((c, i) => `
  <a class="cat wake" style="--i:${i}" href="annonces.html?c=${encodeURIComponent(c)}">
    <span class="cat-ico" aria-hidden="true"><span class="num">${String(i + 1).padStart(2, '0')}</span></span>
    <h3>${c}</h3>
    <p class="cat-count">${byCat(c).length} bulletins</p>
    <span class="cat-arrow">→</span>
  </a>`).join('');
scan(track);

/* --- à la une : la première en « lead », puis trois --- */
const une = data.filter(a => a.featured);
const gridUne = document.getElementById('gridUne');
gridUne.innerHTML = une.slice(0, 4).map((a, i) =>
  i === 0 ? card(a, i, 'lead') : card(a, i)).join('');
scan(gridUne);

/* --- derniers bulletins (les plus récentes d'abord) --- */
const recent = [...data].sort((a, b) => (b.date_pub || '').localeCompare(a.date_pub || ''));
const gridRecent = document.getElementById('gridRecent');
mount(gridRecent, recent.slice(0, 8));

/* --- compteurs --- */
const nonElucides = data.filter(a => a.statut === 'Non élucidé').length;
const temoins = new Set(data.map(a => a.source)).size;
const nouveaux = data.filter(a => a.nouveau).length;
const counters = document.getElementById('counters');
counters.innerHTML = [
  { n: data.length, l: 'bulletins en ligne' },
  { n: temoins, l: 'sources de la nuit' },
  { n: nonElucides, l: 'affaires non élucidées' },
  { n: nouveaux, l: 'nouvelles cette nuit' }
].map(c => `
  <div class="counter wake">
    <span class="star" aria-hidden="true"></span>
    <div class="val" data-target="${c.n}">0</div>
    <div class="lbl">${c.l}</div>
  </div>`).join('');
scan(counters);

/* --- pied de page : liens rubriques --- */
document.getElementById('footCats').innerHTML =
  CATEGORIES.map(c => `<a href="annonces.html?c=${encodeURIComponent(c)}">${c}</a>`).join('');

/* --- balayage des révélations restantes + modales --- */
scan(document);
wireModals(document);

/* --- recherche du hero : renvoie vers la gazette --- */
try {
  const q = new URLSearchParams(location.search).get('q');
  if (q) {
    const input = document.querySelector('.search input');
    if (input) { input.value = q; input.focus(); }
  }
} catch (e) {}