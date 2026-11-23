/* data.js — chargement et utilitaires du fichier data/annonces.json. */
import { supabase } from "./supabase.js";

const URL = './data/annonces.json';
let _data = null;

export function load(){
  if (_data) return Promise.resolve(_data);
  return Promise.all([
    fetch(URL).then(r => {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    }),
    Promise.resolve(
      supabase
        .from("annonces")
        .select("*")
        .order("created_at", { ascending: false }),
    ).catch(() => ({ error: true, data: [] }))
  ])
    .then(([localData, supabaseResult]) => {
      const remoteData = supabaseResult.error ? [] : supabaseResult.data.map(a => ({
        id: `u${a.id}`,
        titre: a.titre,
        categorie: a.categorie,
        lieu: a.lieu || "Lieu inconnu",
        date: a.date_event || "s.d.",
        statut: a.statut || "Témoignage",
        extrait: a.extrait || "",
        recit: a.recit || a.extrait || "",
        date_pub: a.date_pub || a.created_at || "",
        gravite: a.gravite || 1,
        image: a.image || "",
        featured: a.featured || false,
        urgent: a.urgent || false,
        nouveau: a.nouveau || false,
        source: "Soumission utilisateur"
      }));
      _data = [...remoteData, ...localData];
      return _data;
    });
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