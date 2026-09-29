/* data.js — chargement et utilitaires du fichier data/annonces.json. */
const URL = './data/annonces.json';
let _data = null;

export function load(){
  if (_data) return Promise.resolve(_data);
  return fetch(URL)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(d => { _data = d; return d; });
}

/* Ordre canonique des 8 catégories de la gazette */
export const CATEGORIES = [
  'Disparitions',
  'Affaires non résolues',
  'Lieux maudits',
  'Objets troublants',
  'Phénomènes nocturnes',
  'Apparitions & créatures',
  'Témoignages & écrits',
  'Présages & signes'
];

/* Décennie d'un bulletin, pour les filtres */
export function decade(a){ const n = parseInt(a.date, 10); return isNaN(n) ? null : Math.floor(n / 10) * 10; }

export const TITRES = {
  title: ['ÉCLIPSE','ÉCLIPSE'],
  tag: ['annonces de l’ombre','gazette des horreurs']
};