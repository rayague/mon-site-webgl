# ÉCLIPSE — Gazette des horreurs

Site « annonces de l'ombre » construit derrière l'intro WebGL2 « Yeux » : une chronique nocturne qui dépose, chaque nuit, les horreurs du monde (disparitions, lieux maudits, objets troublants, …).

## Contenu du dossier

```
index.html         accueil : intro WebGL, hero, rail, à la une, compteurs, CTA
annonces.html      gazette : liste, filtres (catégorie, statut), tri, recherche, favoris
annonce.html       fiche bulletin : visuel, témoignage, galerie de variations, similaires
publier.html       soumettre un bulletin : formulaire + aperçu live
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
```

## Ajouter un bulletin

Ajoute un objet dans `data/annonces.json` (les champ `id`, `slug`, `auteur`, `ori`, `sombre`, `statut`, `image` doivent suivre le modèle). Pas besoin d'image : un visuel sombre est généré automatiquement. Dépose ensuite un WebP dans `assets/` et renseigne `image` pour le remplacer.

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
python -m http.server 8000
```

puis ouvre http://localhost:8000

## Mettre en ligne (GitHub Pages)

```bash
git init -b main
git add -A
git commit -m "Premier commit"
gh repo create NOM-DU-DEPOT --public --source=. --remote=origin --push
```

Dans le dépôt : **Settings → Pages → Deploy from a branch**, branche `main`, dossier `/ (root)`.

## Bon à savoir

- Sans WebGL2 ou avec « réduire les animations », le site s'affiche directement.
- Tout le contenu est présent dans la page dès le chargement (bon pour le référencement).
- Aucune dépendance ; seules les polices viennent de Google Fonts.