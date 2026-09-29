/* card.js — rendu d'une carte bulletin (accueil, liste, aperçu, similaires). */
import { bg } from './images.js';
import { favStar, syncFavs } from './ui.js';
import { scan, SCROLL_OK } from './scroll.js';

function esc(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

export function card(a, i = 0, extra = ''){
  return `<article class="card wake ${extra}" data-id="${a.id}" style="--i:${i}">
  <div class="card-media" style="background-image:${bg(a)}">
    <span class="shine"></span>
    ${a.featured ? '<span class="badge gold"><span class="star" aria-hidden="true"></span>À la une</span>' : ''}
    ${a.urgent ? '<span class="badge brave">Urgent</span>' : ''}
    <button class="fav" type="button" data-fav="${a.id}" aria-label="Ajouter aux favoris">${favStar}</button>
  </div>
  <div class="card-body">
    <div class="card-meta"><span class="cat">${esc(a.categorie)}</span><span class="place">${esc(a.lieu)} · ${esc(a.date)}</span></div>
    <h3 class="card-title"><a href="annonce.html?id=${a.id}">${esc(a.titre)}</a></h3>
    <p class="card-excerpt">${esc(a.extrait)}</p>
    <div class="card-foot">
      <span class="statut">${esc(a.statut)}</span>
      <span class="grav" data-g="${a.gravite}" aria-label="Gravité ${a.gravite} sur 3"><i></i><i></i><i></i></span>
    </div>
  </div>
</article>`;
}

/* Insère des cartes dans un conteneur, réactive les révélations et les
   favoris. Retourne le nombre de cartes insérées. */
export function mount(container, annonces, extra = ''){
  container.innerHTML = annonces.map((a, i) => card(a, i, extra)).join('');
  scan(container);
  syncFavs();
  return annonces.length;
}