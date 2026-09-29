/* annonce.js — fiche bulletin : galerie en œil, témoignage, similaires. */
import { load, CATEGORIES } from './data.js';
import { bg } from './images.js';
import { favStar, syncFavs, wireModals, openModal, closeModal } from './ui.js';
import { mount } from './card.js';
import { scan, SCROLL_OK } from './scroll.js';
import './iris.js';

const data = await load();
const urlParams = new URLSearchParams(location.search);
const id = urlParams.get('id');
const a = data.find(x => String(x.id) === String(id));

document.getElementById('footCats').innerHTML =
  CATEGORIES.map(c => `<a href="annonces.html?c=${encodeURIComponent(c)}">${c}</a>`).join('');

document.title = (a ? a.titre : 'Bulletin introuvable') + ' — ÉCLIPSE';

if (!a) {
  document.getElementById('titre').textContent = 'Ce bulletin introuvable n’est pas dans la gazette.';
  document.getElementById('crumbCat').textContent = '??';
  document.getElementById('meta').innerHTML = '<p class="section-sub">Il est peut-être arrivé ici par la porte de travers. <a href="annonces.html">Retour à la gazette</a>.</p>';
} else {
  /* --- en-tête --- */
  document.getElementById('crumbCat').textContent = a.categorie;
  document.getElementById('titre').textContent = a.titre;
  const gravLabel = ['', 'Faible', 'Marquée', 'Extrême'][a.gravite];
  document.getElementById('meta').innerHTML = `
    <span><span class="dot"></span>${a.categorie}</span>
    <span><span class="dot"></span>${a.lieu} · ${a.date}</span>
    <span><span class="dot"></span>${a.statut}</span>
    <span><span class="dot"></span>Gravité ${gravLabel}</span>`;

  /* --- galerie : visuel principal + 3 variations --- */
  const main = document.getElementById('mainImg');
  main.style.backgroundImage = bg(a, 0);
  const thumbs = document.getElementById('thumbs');
  thumbs.innerHTML = [1, 2, 3].map((v, i) => `
    <button class="gallery-thumb" type="button" data-v="${v}" aria-pressed="false" aria-label="Variation ${i + 1}">
      <span style="display:block;width:100%;height:100%;background-size:cover;background-position:center;background-image:${bg(a, v)}"></span>
    </button>`).join('');
  thumbs.querySelector('[data-v="1"]').setAttribute('aria-pressed', 'true');

  thumbs.addEventListener('click', e => {
    const t = e.target.closest('.gallery-thumb');
    if (!t) return;
    thumbs.querySelectorAll('.gallery-thumb').forEach(x => x.setAttribute('aria-pressed', String(x === t)));
    main.style.backgroundImage = bg(a, +t.dataset.v);
  });
  let zoomV = 0;
  main.addEventListener('click', () => {
    zoomV = +thumbs.querySelector('[aria-pressed="true"]').dataset.v;
    openZoom();
  });
  main.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openZoom(); });

  function openZoom(){
    document.getElementById('zoomImg').style.backgroundImage = bg(a, zoomV);
    document.getElementById('zoom').classList.add('show');
  }
  function closeZoom(){ document.getElementById('zoom').classList.remove('show'); }
  document.getElementById('zoom').addEventListener('click', e => {
    if (e.target.closest('.close') || e.target === document.getElementById('zoom')) closeZoom();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeZoom(); });

  /* --- récit --- */
  const first = a.recit.split('\n')[0];
  const rest = a.recit.split('\n').slice(1);
  document.getElementById('story').innerHTML =
    `<p class="lead-col">${first}</p>` +
    rest.map(p => `<p>${p}</p>`).join('');

  /* --- côté : période, gravité, état, source, favori --- */
  document.getElementById('period').textContent = a.date;
  document.getElementById('sideMeta').innerHTML = `
    <li><span>Rubrique</span><b>${a.categorie}</b></li>
    <li><span>Lieu</span><b>${a.lieu}</b></li>
    <li><span>État</span><b>${a.statut}</b></li>
    <li><span>Gravité <span class="dot" style="display:inline-block"></span></span><b>${gravLabel}</b></li>
    <li><span>Source</span><b>${a.source}</b></li>`;
  const sideFav = document.getElementById('sideFav');
  sideFav.dataset.fav = a.id;
  sideFav.innerHTML = favStar + ' <span id="favLabel">Garder sous l’œil</span>';
  syncFavs();

  /* --- similaires --- */
  const sim = data.filter(x => x.id !== a.id &&
    (x.categorie === a.categorie || x.lieu === a.lieu || Math.abs(x.gravite - a.gravite) <= 1));
  const scored = [...sim].sort((x, y) =>
    (Number(y.categorie === a.categorie) + Number(y.lieu === a.lieu)) -
    (Number(x.categorie === a.categorie) + Number(x.lieu === a.lieu)));
  mount(document.getElementById('sim'), scored.slice(0, 4));

  /* --- modale témoignage --- */
  document.getElementById('modalRef').textContent = a.titre;
  const form = document.getElementById('temoignageForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.hidden = true;
    document.getElementById('modalDone').hidden = false;
  });
}

wireModals(document);
scan(document);
syncFavs();