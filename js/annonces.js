/* annonces.js — liste des bulletins : filtres, tri, recherche, URL. */
import { load, CATEGORIES, decade } from './data.js';
import { mount } from './card.js';
import { scan, SCROLL_OK } from './scroll.js';
import { isFav, syncFavs, wireModals } from './ui.js';
import './iris.js';

const data = await load();

/* ---------- remplissage des menus ---------- */
const $ = id => document.getElementById(id);
const fCat = $('fCat'), fDec = $('fDec'), fLieu = $('fLieu'), fStatut = $('fStatut'), fQ = $('fQ');

fCat.innerHTML += CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');

const decades = [...new Set(data.map(decade).filter(d => d != null))].sort((a, b) => b - a);
fDec.innerHTML += decades.map(d => `<option value="${d}">${d}s</option>`).join('');

const lieux = [...new Set(data.map(a => a.lieu))].sort((a, b) => a.localeCompare(b, 'fr'));
fLieu.innerHTML += lieux.map(l => `<option value="${l}">${l}</option>`).join('');

const statuts = [...new Set(data.map(a => a.statut))].sort((a, b) => a.localeCompare(b, 'fr'));
fStatut.innerHTML += statuts.map(s => `<option value="${s}">${s}</option>`).join('');

document.getElementById('footCats').innerHTML =
  CATEGORIES.map(c => `<a href="annonces.html?c=${encodeURIComponent(c)}">${c}</a>`).join('');

/* ---------- état initial depuis l'URL ---------- */
let state = { q: '', c: '', d: '', l: '', s: '', f: false, sort: 'recent' };
let dirty = false;
try {
  const p = new URLSearchParams(location.search);
  state = {
    q: p.get('q') || '', c: p.get('c') || '', d: p.get('d') || '', l: p.get('l') || '',
    s: p.get('s') || '', f: p.get('f') === '1', sort: p.get('sort') || 'recent'
  };
  dirty = true;
} catch (e) {}

function syncControls(){
  fQ.value = state.q;
  fCat.value = state.c;
  fDec.value = state.d;
  fLieu.value = state.l;
  fStatut.value = state.s;
  document.querySelectorAll('.tabs [data-tab]').forEach(b =>
    b.setAttribute('aria-selected', String(b.dataset.tab === (state.f ? 'fav' : 'all'))));
  document.querySelectorAll('.seg [data-sort]').forEach(b =>
    b.setAttribute('aria-pressed', String(b.dataset.sort === state.sort)));
}

function apply(){
  let list = [...data];
  const q = state.q.trim().toLowerCase();
  if (q) {
    list = list.filter(a =>
      [a.titre, a.categorie, a.lieu, a.date, a.statut, a.extrait, a.recit]
        .join(' ').toLowerCase().includes(q));
  }
  if (state.c) list = list.filter(a => a.categorie === state.c);
  if (state.d) list = list.filter(a => decade(a) === parseInt(state.d, 10));
  if (state.l) list = list.filter(a => a.lieu === state.l);
  if (state.s) list = list.filter(a => a.statut === state.s);
  if (state.f) list = list.filter(a => isFav(a.id));

  if (state.sort === 'az') list.sort((a, b) => a.titre.localeCompare(b.titre, 'fr'));
  else if (state.sort === 'grav') list.sort((a, b) => (b.gravite - a.gravite) || a.titre.localeCompare(b.titre, 'fr'));
  else list.sort((a, b) => (b.date_pub || '').localeCompare(a.date_pub || ''));

  const count = list.length;
  $('countLine').innerHTML = `<b>${count}</b> bulletin${count > 1 ? 's' : ''} de la nuit`;
  $('empty').hidden = count !== 0;
  mount($('list'), list);

  if (dirty) {
    dirty = false;
    const p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.c) p.set('c', state.c);
    if (state.d) p.set('d', state.d);
    if (state.l) p.set('l', state.l);
    if (state.s) p.set('s', state.s);
    if (state.f) p.set('f', '1');
    if (state.sort !== 'recent') p.set('sort', state.sort);
    const url = 'annonces.html' + (p.toString() ? '?' + p.toString() : '');
    history.replaceState({}, '', url);
  }
}

/* ---------- événements ---------- */
let tQ = null;
fQ.addEventListener('input', () => { clearTimeout(tQ); tQ = setTimeout(() => { state.q = fQ.value; apply(); }, 130); });
[fCat, fDec, fLieu, fStatut].forEach(el =>
  el.addEventListener('change', () => { state[el.getAttribute('data-key')] = el.value; apply(); }));

document.querySelectorAll('.tabs [data-tab]').forEach(b =>
  b.addEventListener('click', () => { state.f = b.dataset.tab === 'fav'; syncControls(); apply(); }));

document.querySelectorAll('.seg [data-sort]').forEach(b =>
  b.addEventListener('click', () => { state.sort = b.dataset.sort; syncControls(); apply(); }));

wireModals(document);

syncControls();
apply();
scan(document);
syncFavs();