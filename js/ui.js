/* ui.js — favoris (localStorage), ondes de choc, modale, icônes. */
const KEY = 'eclipse-favs';
let favs = new Set();
try { favs = new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch (e) { favs = new Set(); }

function persist(){ try { localStorage.setItem(KEY, JSON.stringify([...favs])); } catch (e) {} }

export function isFav(id){ return favs.has(String(id)); }
export function toggleFav(id){
  id = String(id);
  favs.has(id) ? favs.delete(id) : favs.add(id);
  persist();
  const badge = document.getElementById('favCount');
  if (badge) { badge.textContent = favs.size; badge.hidden = favs.size === 0; }
  return isFav(id);
}

/* Clics délégués : favoris + onde de choc */
document.addEventListener('click', e => {
  const fav = e.target.closest('[data-fav]');
  if (fav) {
    e.preventDefault();
    shock(fav);
    const on = toggleFav(fav.dataset.fav);
    document.querySelectorAll('[data-fav="' + fav.dataset.fav + '"]').forEach(b => {
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on);
      b.setAttribute('aria-label', on ? 'Retirer des favoris' : 'Ajouter aux favoris');
    });
    return;
  }
  const btn = e.target.closest('.btn');
  if (btn) shock(btn);
});

export function shock(el){
  el.classList.remove('shock');
  void el.offsetWidth;
  el.classList.add('shock');
  setTimeout(() => el.classList.remove('shock'), 900);
}

/* Initialise l'état des boutons favoris déjà présents dans le DOM */
export function syncFavs(){
  document.querySelectorAll('[data-fav]').forEach(b => {
    const on = isFav(b.dataset.fav);
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on);
    b.setAttribute('aria-label', on ? 'Retirer des favoris' : 'Ajouter aux favoris');
  });
  const badge = document.getElementById('favCount');
  if (badge) { badge.textContent = favs.size; badge.hidden = favs.size === 0; }
}

/* Étoile SVG pour les boutons de favori */
export const favStar = (() => {
  const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', 'M12 2.4l2.7 6.6 7.1.5-5.5 4.6 1.7 7-6-3.9-6 3.9 1.7-7L2.2 9.5l7.1-.5z');
  s.appendChild(p);
  return s.outerHTML;
})();

/* ---- Modale témoignage accessible ---- */
let lastFocus = null;
export function openModal(modal){
  if (!modal) return;
  lastFocus = document.activeElement;
  modal.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
  const first = modal.querySelector('[autofocus], [data-focus], input, textarea, button');
  (first || modal).focus();
}
export function closeModal(modal){
  if (!modal) return;
  modal.setAttribute('hidden', '');
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();
}
export function wireModals(root){
  root.addEventListener('click', e => {
    const open = e.target.closest('[data-modal]');
    if (open) { e.preventDefault(); openModal(document.querySelector(open.dataset.modal)); return; }
    const close = e.target.closest('.modal-close, .modal-backdrop');
    if (close) closeModal(close.closest('.modal'));
  });
  root.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const open = document.querySelector('.modal:not([hidden])');
      if (open) closeModal(open);
    }
  });
}