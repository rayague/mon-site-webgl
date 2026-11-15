/* publier.js — formulaire front-only avec aperçu de carte en direct. */
import { load, CATEGORIES } from "./data.js";
import { card } from "./card.js";
import { scan } from "./scroll.js";
import { syncFavs, wireModals } from "./ui.js";
import "./iris.js";

const data = await load();

/* Valeurs affichées dans l’aperçu quand un champ texte est vide. */
const PREVIEW_DEFAULTS = {
  titre: "Sans titre — mais pas un détail",
  lieu: "Quelque part",
  date: "s.d.",
  extrait:
    "Rien n’a été écrit encore, mais l’œil est ouvert sur ce qui va venir.",
};

/**
 * @description
 * Récupère un élément du DOM par son ID.
 * @param {string} id - L'ID de l'élément à récupérer.
 * @returns {HTMLElement} - L'élément trouvé.
 */
const field = (id) => document.getElementById(id);

/* menus */
const fCat = field("categorie");
fCat.innerHTML = CATEGORIES.map(
  (c) => `<option value="${c}">${c}</option>`,
).join("");
const fStatut = field("statut");
fStatut.innerHTML = [...new Set(data.map((a) => a.statut))]
  .sort((a, b) => a.localeCompare(b, "fr"))
  .map((s) => `<option value="${s}">${s}</option>`)
  .join("");

/* gravité : segmentation */
let gravite = 2;
document.querySelectorAll(".seg [data-grav]").forEach((b) =>
  b.addEventListener("click", () => {
    gravite = +b.dataset.grav;
    document
      .querySelectorAll(".seg [data-grav]")
      .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    render();
  }),
);

/* aperçu en direct */
const preview = field("preview");
function draft() {
  return {
    id: 0,
    titre: field("titre").value.trim() || "Sans titre — mais pas un détail",
    categorie: fCat.value,
    lieu: field("lieu").value.trim() || "Quelque part",
    date: field("date").value.trim() || "s.d.",
    statut: fStatut.value,
    gravite,
    extrait:
      field("extrait").value.trim() ||
      "Rien n’a été écrit encore, mais l’œil est ouvert sur ce qui va venir.",
    recit: "…",
    image: "",
    featured: false,
    urgent: false,
    nouveau: true,
  };
}
function render() {
  preview.innerHTML = card(draft());
  scan(preview);
  syncFavs();
}

/**
 * Met à jour un seul nœud de la carte d’aperçu, sans reconstruire toute la carte.
 * Cherche dans `#preview` l’élément dont `data-field` égale l’`id` du champ modifié,
 * puis copie la valeur de l’input (avec défauts si le champ texte est vide).
 * Ne fait rien s’il n’y a pas encore de carte, ou si le champ n’a pas d’équivalent
 * dans l’aperçu (ex. `recit` / histoire).
 *
 * @param {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} el
 *   Champ du formulaire qui vient de changer (`input`).
 * @returns {void}
 */
function updatePreview(el) {
  const cardEl = preview.querySelector(".card");
  if (!cardEl) return;
  const id = el.id;
  const n = cardEl.querySelector(`[data-field="${id}"]`);
  if (!n) return; /* recit / histoire : pas affiché sur la carte d’aperçu */
  const raw = el.value;
  n.textContent =
    PREVIEW_DEFAULTS[id] != null
      ? raw.trim() || PREVIEW_DEFAULTS[id]
      : raw;
}
/* Chaque champ lié à un `data-field` de la carte : mise à jour ciblée à chaque frappe.
   `recit` est inclus dans la liste mais n’a pas de cible d’aperçu (no-op). */
[
  fCat,
  fStatut,
  field("titre"),
  field("lieu"),
  field("date"),
  field("extrait"),
  field("recit"),
].forEach((el) => el.addEventListener("input", () => updatePreview(el)));

/* Première construction complète de l’aperçu (gravité et structure initiale). */
render();

/* soumission : 100 % front-end */
field("pubForm").addEventListener("submit", (e) => {
  e.preventDefault();
  field("formGrid").hidden = true;
  field("confirm").hidden = false;
  syncFavs();
  try {
    scrollTo(0, 0);
  } catch {}
});

document.getElementById("footCats").innerHTML = CATEGORIES.map(
  (c) => `<a href="annonces.html?c=${encodeURIComponent(c)}">${c}</a>`,
).join("");

scan(document);
wireModals(document);
