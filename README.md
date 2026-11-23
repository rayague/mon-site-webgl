# ÉCLIPSE — Gazette des horreurs

Site « annonces de l'ombre » construit derrière l'intro WebGL2 « Yeux » : une chronique nocturne qui dépose, chaque nuit, les horreurs du monde (disparitions, lieux maudits, objets troublants, …).

## Contenu du dossier

```
index.html         accueil : intro WebGL, hero, rail, à la une, compteurs, CTA
annonces.html      gazette : liste, filtres (catégorie, statut), tri, recherche, favoris
annonce.html       fiche bulletin : visuel, témoignage, galerie de variations, similaires
publier.html       soumettre un bulletin : formulaire + publication Supabase
connexion.html     connexion au compte utilisateur
inscription.html   création d’un compte utilisateur
profil.html        modification du profil utilisateur
mes-annonces.html  liste et suppression des annonces personnelles
data/annonces.json source unique des 30 bulletins (8 catégories, statut, featured…)
css/tokens.css     variables (palette, rayons, timing) — à ne pas modifier à la main
css/base.css       hygiène, typo, nav, page-reveal
css/components.css cartes, formulaires, galerie, modale, compteurs, sections
css/animations.css révélations : timelines de scroll (view()) + repli IO + reduced-motion
css/intro.css      styles de l'intro (à ne pas toucher)
js/intro.js        moteur de l'intro + réglages en haut du fichier
js/shaders.js      rendu graphique des yeux (à ne pas toucher)
js/data.js         chargement de data/annonces.json (décorateur 3)
js/card.js         montage des cartes (HTML, images SVG, statuts, favoris)
js/images.js       visuels procéduraux SVG (tant que `image` est vide)
js/scroll.js       révélations : split des titres, IO, compteurs
js/iris.js         une seule boucle rAF : iris du hero, parallaxe, --eclipse
js/ui.js           favoris (localStorage), modale, toast « choc », étoile
js/index.js / annonces.js / annonce.js / publier.js   logique par page
assets/            images réelles à venir (WebP) — `image` dans annonces.json
.github/           pipeline CI/CD, modèle de PR, CODEOWNERS
scripts/           push.mjs, release.mjs, validate-data.mjs
docs/              guide du projet, configuration, présentation
```

## Ajouter un bulletin

Ajoute un objet dans `data/annonces.json` (les champs `id`, `titre`, `categorie`, `lieu`, `date`, `statut`, `extrait`, `recit`, `date_pub` et `image` sont obligatoires). Pas besoin d'image : un visuel sombre est généré automatiquement. Dépose ensuite un WebP dans `assets/` et renseigne `image` pour le remplacer. Le script `npm run check:data` vérifie les champs, les doublons et le nombre d'annonces.

## Réglages (en haut de `js/intro.js`)

| Réglage | Effet |
|---|---|
| `ONCE_PER_SESSION` | `true` = l'intro ne se joue qu'une fois par visite. 🟢 déjà activé |
| `SPEED` | `1` par défaut, `1.2` = 20 % plus rapide |
| `MAX_DPR` | netteté maximale sur écrans Retina |

Le bloc `<div id="intro">…</div>` et les scripts `shaders.js`/`intro.js` ne sont présents que sur `index.html`.

## Contraintes respectées

- Une seule boucle `requestAnimationFrame` (`js/iris.js`), mise en pause si l'onglet est caché.
- Aucun écouteur de scroll qui lit/modifie la mise en page : tout passe par les timelines de scroll CSS (`animation-timeline: view()`), avec repli IntersectionObserver en cas de non-support.
- Animation limitée à `transform`/`opacity`/`clip-path` ; `content-visibility` + chargement paresseux des médias.
- `prefers-reduced-motion` : fondus simples, compteurs instantanés.
- Budget : CSS < 30 Ko, JS du site < 40 Ko (hors intro).

## Tester en local

```bash
npm ci
npm run ci
python -m http.server 8000
```

puis ouvre http://localhost:8000

`npm run ci` vérifie le HTML, le CSS, le JavaScript et les 30 annonces avant de pousser le code.

## Mettre en ligne (GitHub Pages)

Le déploiement est automatisé par GitHub Actions. Un merge dans `main` déclenche le workflow `Pipeline`, puis le job `deploy` publie le site sur GitHub Pages.

```powershell
git switch dev
git pull --ff-only
npm run release
```

Après l'approbation d'une autre personne :

```powershell
npm run release:merge
```

Le site public est disponible ici : https://rayague.github.io/mon-site-webgl/

Pour le détail du flux, voir `.github/workflows/pipeline.yml` et `docs/GUIDE-PROJET.md`.

## Documentation

- `docs/GUIDE-PROJET.md` : comprendre le projet, les branches, la CI/CD et le rôle de chacun.
- `docs/CONFIGURATION.md` : explication détaillée de chaque fichier de configuration.
- `docs/PRESENTATION.md` : paragraphe de présentation, plan et questions fréquentes.
- `CONTRIBUTING.md` : règles de travail en équipe et commandes utiles.

## Bon à savoir

- Sans WebGL2 ou avec « réduire les animations », le site s'affiche directement.
- Tout le contenu est présent dans la page dès le chargement (bon pour le référencement).
- Aucune dépendance à l'exécution : le navigateur ne télécharge que les polices Google Fonts.
- Les outils ESLint, Stylelint et html-validate servent uniquement au développement et à la CI.