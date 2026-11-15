import { readFile } from "node:fs/promises";

const REQUIRED = [
  "id", "titre", "categorie", "lieu", "date", "statut",
  "extrait", "recit", "date_pub", "image"
];

const raw = (await readFile(new URL("../data/annonces.json", import.meta.url), "utf8"))
  .replace(/^\uFEFF/, "");

const data = JSON.parse(raw);

if (!Array.isArray(data)) {
  console.error("data/annonces.json doit contenir un tableau.");
  process.exit(1);
}

let errors = 0;
const ids = new Set();

data.forEach((a, i) => {
  for (const key of REQUIRED) {
    if (!(key in a)) {
      console.error(`Annonce ${i + 1} : champ manquant "${key}"`);
      errors++;
    }
  }

  if (ids.has(String(a.id))) {
    console.error(`Annonce ${i + 1} : id dupliqué "${a.id}"`);
    errors++;
  }
  ids.add(String(a.id));
});

if (data.length !== 30) {
  console.error(`Attendu : 30 annonces, trouvé : ${data.length}`);
  errors++;
}

if (errors) process.exit(1);
console.log(`OK : ${data.length} annonces valides.`);