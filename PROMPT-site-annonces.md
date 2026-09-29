Tu travailles dans le dossier `mon-site-webgl/`. Il contient déjà une intro WebGL2 qui fonctionne : deux yeux s'ouvrent dans le noir, suivent la souris, se transforment (iris bleu électrique qui devient doré, étoile qui tourne, flash, onde de choc), se ferment en une fente, puis la fente s'ouvre en forme d'œil sur le site.
Lis d'abord `README.md`, `index.html`, `css/intro.css`, `js/intro.js` et `js/shaders.js` pour t'imprégner de cet univers visuel. Ensuite, construis derrière cette intro un **site d'annonces** complet.

## 1. Concept

**Nom de travail : « ÉCLIPSE — annonces de l'ombre ».**
Une place de petites annonces haut de gamme pour ce qui vit la nuit et ce qui est rare : objets de collection, pièces vintage, matériel audio et vidéo, art, instruments, véhicules d'exception, lieux atypiques, événements nocturnes.
Le ton est mystérieux, élégant et premium, sans être glauque. Accroche : « Rien n'échappe à l'œil. »

Catégories (8) : Collection & curiosités · Mode & vintage · Son & image · Art & design · Instruments · Véhicules · Lieux & locations · Nuits & événements.

## 2. Règle absolue : le site est « du même sang » que l'intro

Le site doit donner l'impression d'être la suite directe de l'animation, et non une page posée derrière elle. Quand la fente s'ouvre, on doit entrer dans le même monde.

### Palette (reprise des shaders)
Définis ces couleurs comme variables CSS et n'utilise rien d'autre :
- Fond : noir profond `#050407`, surfaces `#0b0910` et `#120e18`, bordures `rgba(236,230,218,.08)`
- Texte : crème `#ece6da`, texte secondaire `#9d95a8`
- **Bleu « Éveil »** (iris avant transformation) : `#86f2ff` → `#3a8cff` → `#0d1f7a`
- **Or « Éclipse »** (iris après transformation) : `#fff4c8` → `#ffb84d` → `#e65c0a`
- Rouge braise (rare, pour l'urgence, les favoris, le prix barré) : `#8c0d0a`
- Tout le site est sombre, **même si le système de l'utilisateur est en mode clair**. Réécris `css/site.css` en conséquence.

### Typographie
Instrument Serif pour les titres (grands, aérés, élégants), Manrope pour le texte et l'interface. Ces polices sont déjà chargées.
Easing de base : `cubic-bezier(.2,.7,.2,1)`, celui des fondus de l'intro.

### Motifs visuels à décliner partout
- **L'œil / la lentille** : deux arcs qui forment une amande, comme l'ouverture finale de l'intro. Utilise-la comme masque d'apparition des images (`clip-path`), comme forme des boutons principaux au survol, et comme séparateur de sections.
- **La fente lumineuse** : une ligne horizontale dorée et incandescente qui s'étire d'un bord à l'autre. Elle sert de séparateur de sections et d'indicateur de chargement.
- **L'iris** : un anneau avec une fine étoile à 8 branches qui tourne lentement. Il sert de logo, de loader, de badge « À la une » et d'indicateur de scroll.
- **Le halo (bloom)** : une lueur douce autour des éléments actifs, bleue par défaut et dorée pour ce qui est premium ou sélectionné.
- **L'onde de choc** : un anneau qui s'agrandit et s'efface au clic sur un bouton important (publier, contacter, ajouter aux favoris).
- **L'aberration chromatique** : un décalage rouge/bleu très léger sur les grands titres au survol ou pendant le flash d'apparition, fait en `text-shadow` et non en filtre.
- **Le grain** : un bruit très subtil sur le fond, en image statique ou en SVG `feTurbulence` rendu une seule fois, jamais animé en JS.

## 3. Un site vivant : tout bouge au scroll

Je veux sentir le site respirer en scrollant. Implémente au minimum :

1. **Transformation bleu → or au fil du scroll** : une variable `--eclipse` (de 0 à 1) suit la progression de la page. Les accents, halos et bordures actives passent progressivement du bleu « Éveil » à l'or « Éclipse ». Le haut du site est bleu, le bas est doré, comme la transformation de l'intro.
2. **Apparitions en forme d'œil** : chaque carte d'annonce et chaque image apparaît avec un `clip-path` en amande qui s'ouvre de la fente à l'œil complet, plus un léger fondu. Les éléments d'une même rangée s'enchaînent en cascade.
3. **Titres de section** : ils entrent avec un bref flash, une aberration chromatique qui se résorbe et une lettre-par-lettre très rapide, ou mot par mot si c'est plus propre.
4. **Séparateurs « fente »** : la ligne dorée s'étire du centre vers les bords quand la section entre à l'écran.
5. **Hero en parallaxe douce** : grand titre, champ de recherche et iris décoratif qui tourne, sur des plans qui défilent à des vitesses différentes.
6. **Regard qui suit la souris** : un halo radial suit le curseur sur les cartes (effet de lampe torche ou de reflet sur l'iris). L'iris du hero regarde vers la souris, comme les yeux de l'intro.
7. **Défilement horizontal des catégories** piloté par le scroll vertical, dans une section épinglée (sticky). Sur mobile, il devient un simple carrousel au doigt.
8. **Compteurs animés** (annonces en ligne, vendeurs, nouveautés aujourd'hui) qui défilent quand ils entrent à l'écran.
9. **Micro-interactions** : cartes qui se soulèvent légèrement au survol avec halo, favoris avec onde de choc, boutons avec lueur qui suit le curseur.
10. **Barre de progression** en haut de page, en forme de fente qui s'illumine.

Les mouvements doivent rester élégants et retenus, jamais tape-à-l'œil ni fatigants.

## 4. Pages et fonctionnalités

Site statique (HTML, CSS, JS vanilla), compatible GitHub Pages, sans build obligatoire.
- `index.html` (accueil, après l'intro) : hero avec recherche, catégories, « À la une », dernières annonces, bloc « Comment ça marche » en 3 étapes, appel à publier, footer.
- `annonces.html` : liste avec filtres (catégorie, prix min/max, ville, état), tri et recherche instantanée côté client. L'état des filtres est gardé dans l'URL.
- `annonce.html?id=…` : fiche avec galerie (ouverture en œil), prix, description, vendeur, bouton de contact (modale), annonces similaires.
- `publier.html` : formulaire de dépôt avec aperçu en direct de la carte. Le formulaire est **front-end uniquement**, sans envoi réel : message de confirmation seulement.
- Favoris enregistrés en `localStorage` (entouré de try/catch).
- Données : `data/annonces.json` avec **30 annonces fictives crédibles**, réparties dans les 8 catégories et dans plusieurs villes françaises, avec des prix réalistes.
- Images : pas de grosses photos externes. Génère des visuels d'illustration légers et cohérents avec l'univers : SVG ou dégradés procéduraux sombres, avec reflets bleus ou dorés, un par annonce. Prévois un champ `image` dans le JSON pour que je puisse mettre mes vraies photos (WebP) dans `assets/` plus tard.
- **L'intro ne se joue que sur l'accueil**, une fois par session (`ONCE_PER_SESSION = true`). Les autres pages s'ouvrent directement, avec une courte transition « fente qui s'ouvre » en CSS.

## 5. Par-dessus tout : aucune lenteur

La fluidité passe avant tout effet. Si un effet coûte trop cher, simplifie-le ou supprime-le.
- **60 images/seconde** au scroll sur un PC moyen et sur un téléphone milieu de gamme.
- N'anime que `transform`, `opacity` et `clip-path`. Utilise `filter` et `box-shadow` animés seulement sur de très petits éléments, jamais sur de grandes surfaces.
- Privilégie les **animations CSS pilotées par le scroll** (`animation-timeline: view()` / `scroll()`), avec repli sur `IntersectionObserver` si le navigateur ne les gère pas. **Aucun écouteur `scroll` qui lit ou modifie la mise en page.**
- Une seule boucle `requestAnimationFrame` au maximum pour tout le site (suivi de souris, iris). Elle se met en pause quand rien n'est visible ou quand l'onglet est caché.
- **Pas de deuxième contexte WebGL.** Quand l'intro se termine, libère le sien (`WEBGL_lose_context`) pour rendre la carte graphique au site.
- Pas de framework, pas de jQuery, pas de GSAP, pas de smooth-scroll JS qui détourne le défilement natif.
- `content-visibility: auto` sur les sections longues, `loading="lazy"` et `decoding="async"` sur les images, dimensions fixées pour éviter tout saut de mise en page.
- Budgets : JS du site < 40 Ko (hors intro), CSS < 30 Ko, Lighthouse mobile Performance ≥ 90, CLS < 0,05, LCP < 2,5 s.
- `prefers-reduced-motion` : toutes les animations de scroll sont remplacées par de simples fondus, et l'intro est sautée (c'est déjà géré dans `intro.js`).

## 6. Qualité et contraintes

- Responsive propre de 360 px à 2560 px, sans scroll horizontal parasite.
- Accessibilité : contrastes AA, focus visibles (halo doré), navigation clavier complète, `alt` sur les images, modale accessible.
- Code clair, commenté en français, organisé ainsi : `css/` (tokens, base, composants, animations), `js/` (un module par fonction), `data/`, `assets/`.
- **Ne modifie pas** `js/shaders.js`. Dans `js/intro.js`, touche seulement aux réglages et à la libération du contexte WebGL en fin d'intro.
- Mets à jour le `README.md` : structure, comment ajouter une annonce, comment remplacer les visuels par de vraies photos, comment régler les animations.

## 7. Méthode de travail

1. Commence par me proposer en quelques lignes la direction artistique (maquette de l'accueil décrite section par section) et la liste des animations. Attends mon accord.
2. Construis ensuite dans cet ordre : tokens et base → accueil → liste → fiche → publier.
3. Après chaque page, teste-la réellement dans un navigateur via un serveur local (`python -m http.server`). Vérifie la console, la fluidité au scroll et l'affichage mobile, et corrige avant de passer à la suivante.
4. À la fin, donne-moi le résumé de ce qui a été fait, les scores de performance mesurés et ce qui reste à faire.
