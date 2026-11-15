// Ce script est lancé par "npm run check:data", lui-même appelé par "npm run ci".
// Il vérifie que data/annonces.json contient bien 30 annonces et les champs obligatoires.

// "readFile" lit un fichier sans le bloquer, avec la version moderne de Node.js.
import { readFile } from "node:fs/promises";

// Liste des champs qu'une annonce doit obligatoirement posséder.
// Si un seul manque, la CI échoue pour éviter une page cassée.
const REQUIRED = [
  "id", "titre", "categorie", "lieu", "date", "statut",
  "extrait", "recit", "date_pub", "image"
];

// Lit le fichier data/annonces.json en texte.
// "new URL(..., import.meta.url)" construit un chemin relatif au script,
// ce qui fonctionne même si on lance la commande depuis un autre dossier.
const raw = (await readFile(new URL("../data/annonces.json", import.meta.url), "utf8"))
  // Supprime un éventuel BOM (caractère invisible ajouté par certains éditeurs).
  .replace(/^\uFEFF/, "");

// Transforme le texte JSON en tableau JavaScript utilisable.
const data = JSON.parse(raw);

// Vérifie que la racine du fichier est bien un tableau.
// Un objet seul ne permettrait pas de parcourir les annonces.
if (!Array.isArray(data)) {
  console.error("data/annonces.json doit contenir un tableau.");
  process.exit(1);
}

// Compteur d'erreurs : on continue à tout vérifier pour afficher tous les problèmes.
let errors = 0;

// Ensemble des identifiants déjà rencontrés, pour détecter les doublons.
const ids = new Set();

// Parcourt chaque annonce avec son index (0, 1, 2...).
data.forEach((a, i) => {
  // Vérifie la présence de chaque champ obligatoire.
  for (const key of REQUIRED) {
    if (!(key in a)) {
      console.error(`Annonce ${i + 1} : champ manquant "${key}"`);
      errors++;
    }
  }

  // Vérifie que l'identifiant n'a pas déjà été utilisé.
  if (ids.has(String(a.id))) {
    console.error(`Annonce ${i + 1} : id dupliqué "${a.id}"`);
    errors++;
  }

  // Mémorise l'identifiant pour les annonces suivantes.
  ids.add(String(a.id));
});

// Le site est prévu pour afficher exactement 30 annonces.
if (data.length !== 30) {
  console.error(`Attendu : 30 annonces, trouvé : ${data.length}`);
  errors++;
}

// S'il y a eu au moins une erreur, on arrête la CI avec un échec.
if (errors) process.exit(1);

// Si tout est bon, on affiche un message rassurant et lisible dans les logs.
console.log(`OK : ${data.length} annonces valides.`);
