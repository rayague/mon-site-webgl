/* publier.js — formulaire front-only avec aperçu de carte en direct. */
import { load, CATEGORIES } from './data.js';
import { card } from './card.js';
import { scan, SCROLL_OK } from './scroll.js';
import { syncFavs, wireModals } from './ui.js';
import './iris.js';

const data = await load();
const field = id => document.getElementById(id);

/* menus */
const fCat = field('categorie');
fCat.innerHTML = CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
const fStatut = field('statut');
fStatut.innerHTML = [...new Set(data.map(a => a.statut))].sort((a, b) => a.localeCompare(b, 'fr'))
  .map(s => `<option value="${s}">${s}</option>`).join('');

/* gravité : segmentation */
let gravite = 2;
document.querySelectorAll('.seg [data-grav]').forEach(b =>
  b.addEventListener('click', () => {
    gravite = +b.dataset.grav;
    document.querySelectorAll('.seg [data-grav]').forEach(x =>
      x.setAttribute('aria-pressed', String(x === b)));
    render();
  }));

/* aperçu en direct */
const preview = field('preview');
function draft(){
  return {
    id: 0,
    titre: field('titre').value.trim() || 'Sans titre — mais pas un détail',
    categorie: fCat.value,
    lieu: field('lieu').value.trim() || 'Quelque part',
    date: field('date').value.trim() || 's.d.',
    statut: fStatut.value,
    gravite,
    extrait: field('extrait').value.trim() ||
      'Rien n’a été écrit encore, mais l’œil est ouvert sur ce qui va venir.',
    recit: '…',
    image: '',
    featured: false,
    urgent: false,
    nouveau: true
  };
}
function render(){
  preview.innerHTML = card(draft());
  scan(preview);
  syncFavs();
}
[fCat, fStatut, field('titre'), field('lieu'), field('date'), field('extrait'), field('recit')]
  .forEach(el => el.addEventListener('input', render));
render();

/* soumission : 100 % front-end */
field('pubForm').addEventListener('submit', e => {
  e.preventDefault();
  field('formGrid').hidden = true;
  field('confirm').hidden = false;
  syncFavs();
  try { scrollTo(0, 0); } catch (err) {}
});

document.getElementById('footCats').innerHTML =
  CATEGORIES.map(c => `<a href="annonces.html?c=${encodeURIComponent(c)}">${c}</a>`).join('');

scan(document);
wireModals(document);