# Configuration du projet — explication détaillée

Ce document explique les fichiers de configuration utilisés par le projet.
Il est écrit pour être compris même sans connaissances avancées en informatique.

## Comment lire ce document

- Un **fichier de configuration** est un fichier qui donne des règles à un outil.
  Par exemple : « vérifie le HTML avec ces règles », « lance ces commandes », « déploie sur GitHub Pages ».
- Les fichiers `.yml`, `.mjs`, `.md` et `.gitignore` peuvent contenir des commentaires.
  Ces commentaires sont déjà présents dans les fichiers.
- Les fichiers `.json` **ne peuvent pas** contenir de commentaires.
  Ajouter `//` ou `/* */` dans un JSON le rend invalide.
  C'est pour cette raison que leurs lignes sont expliquées dans des tableaux ici.
- `package-lock.json` est un fichier **généré par npm**.
  Il ne faut pas le modifier à la main : npm le réécrit quand les dépendances changent.

## Vue d'ensemble

| Fichier | Format | Rôle principal | Commentaires dans le fichier ? |
|---|---|---|---|
| `package.json` | JSON | Liste les commandes et les outils du projet | Non, expliqué ici |
| `package-lock.json` | JSON | Bloque les versions exactes des outils | Non, généré par npm |
| `.htmlvalidate.json` | JSON | Règles de vérification du HTML | Non, expliqué ici |
| `.stylelintrc.json` | JSON | Règles de vérification du CSS | Non, expliqué ici |
| `eslint.config.mjs` | JavaScript | Règles de vérification du JavaScript | Oui |
| `.gitignore` | Texte | Fichiers à ne pas envoyer sur GitHub | Oui |
| `.github/CODEOWNERS` | Texte | Personnes qui doivent relire les PR | Oui |
| `.github/pull_request_template.md` | Markdown | Modèle de description des PR | Oui, avec des commentaires HTML |
| `.github/workflows/pipeline.yml` | YAML | Automatisation GitHub Actions | Oui |
| `data/annonces.json` | JSON | Contenu des 30 annonces | Non, schéma expliqué ici |
| `scripts/push.mjs` | JavaScript | Pousse une branche et crée la PR vers `dev` | Oui |
| `scripts/release.mjs` | JavaScript | Prépare et merge la release `dev` → `main` | Oui |
| `scripts/validate-data.mjs` | JavaScript | Vérifie les données des annonces | Oui |

---

## 1. `package.json`

### Rôle

C'est la **carte d'identité du projet** pour npm.
Il contient :

- le nom du projet ;
- les commandes que l'on peut lancer avec `npm run ...` ;
- la version de Node.js nécessaire ;
- les outils de développement installés.

### Ligne par ligne

| Ligne | Contenu | Explication simple |
|---|---|---|
| 1 | `{` | Ouvre l'objet JSON principal. |
| 2 | `"name": "eclipse-site"` | Nom interne du projet pour npm. Ce n'est pas le titre affiché sur le site. |
| 3 | `"version": "1.0.0"` | Version du projet. Elle sert surtout à npm, pas au fonctionnement du site. |
| 4 | `"private": true` | Empêche de publier accidentellement ce projet sur npm. |
| 5 | `"description": "Site ÉCLIPSE — CI/CD"` | Description lisible par un humain. |
| 6 | `"scripts": {` | Ouvre la liste des commandes personnalisées. |
| 7 | `"ci": "npm run lint:html && npm run lint:css && npm run lint:js && npm run check:data"` | Commande principale de vérification. `&&` signifie : si une étape échoue, on s'arrête. |
| 8 | `"lint:html": "html-validate index.html annonces.html annonce.html publier.html"` | Vérifie la structure des 4 pages HTML. |
| 9 | `"lint:css": "stylelint \"css/**/*.css\""` | Vérifie tous les fichiers CSS du dossier `css`. |
| 10 | `"lint:js": "eslint \"js/**/*.js\""` | Vérifie tous les fichiers JavaScript du dossier `js`. |
| 11 | `"check:data": "node scripts/validate-data.mjs"` | Lance le script qui vérifie les 30 annonces. |
| 12 | `"push": "node scripts/push.mjs"` | Lance le script qui pousse une branche et crée la PR vers `dev`. |
| 13 | `"release": "node scripts/release.mjs"` | Prépare la PR `dev` → `main` et vérifie tout avant l'approbation. |
| 14 | `"release:merge": "node scripts/release.mjs --merge"` | Après approbation, merge la release, attend le deploy et vérifie le site. |
| 15 | `},` | Ferme la liste des commandes. |
| 16 | `"engines": {` | Ouvre la contrainte de version de Node.js. |
| 17 | `"node": ">=24.15.0"` | Le projet demande Node.js 24.15 ou plus récent. Les outils de lint en ont besoin. |
| 18 | `},` | Ferme la contrainte de version. |
| 19 | `"devDependencies": {` | Ouvre la liste des outils utilisés seulement pendant le développement. |
| 20 | `"@eslint/js": "^10.0.1"` | Règles JavaScript recommandées par ESLint. |
| 21 | `"eslint": "^10.15.0"` | Outil qui vérifie les erreurs dans le JavaScript. |
| 22 | `"globals": "^17.14.0"` | Liste des variables globales connues (`window`, `document`, etc.). |
| 23 | `"html-validate": "^11.21.1"` | Outil qui vérifie la validité du HTML. |
| 24 | `"stylelint": "^18.0.0"` | Outil qui vérifie le CSS. |
| 25 | `"stylelint-config-standard": "^41.0.0"` | Règles de base utilisées par Stylelint. |
| 26 | `}` | Ferme la liste des outils de développement. |
| 27 | `}` | Ferme l'objet JSON principal. |

### À retenir

- `npm run ci` est la commande à lancer avant de proposer un changement.
- `devDependencies` ne part pas dans le site public : ce sont des outils de contrôle.
- Le site n'a **aucune dépendance à l'exécution**. Le navigateur ne télécharge pas ESLint ou Stylelint.

---

## 2. `package-lock.json`

### Rôle

Ce fichier est créé et mis à jour automatiquement par npm.
Il enregistre la version exacte de chaque outil et de ses dépendances.

Pourquoi c'est utile :

- deux personnes qui lancent `npm ci` installent exactement les mêmes versions ;
- la CI ne peut pas installer une version différente par hasard ;
- les mises à jour sont contrôlées et reproductibles.

### Ligne par ligne — partie principale

| Ligne | Contenu | Explication simple |
|---|---|---|
| 1 | `{` | Ouvre l'objet JSON. |
| 2 | `"name": "eclipse-site"` | Nom du projet. |
| 3 | `"version": "1.0.0"` | Version du projet. |
| 4 | `"lockfileVersion": 3` | Version du format du fichier lock. |
| 5 | `"requires": true` | Indique que les dépendances peuvent elles-mêmes avoir des dépendances. |
| 6 | `"packages": {` | Ouvre la liste de tous les paquets installés. |
| 7-21 | Bloc `"": { ... }` | Décrit le projet lui-même : nom, version, outils de développement, version de Node. |
| 22+ | Blocs `"node_modules/..."` | Décrit chaque outil installé et ses dépendances. |

### Exemple de bloc de paquet

| Champ | Explication |
|---|---|
| `version` | Version exacte installée. |
| `resolved` | Adresse internet d'où le paquet a été téléchargé. |
| `integrity` | Empreinte de sécurité qui permet de vérifier que le fichier n'a pas été modifié. |
| `dev` | `true` signifie que le paquet sert uniquement au développement. |
| `license` | Licence d'utilisation du paquet. |
| `dependencies` | Autres paquets dont celui-ci a besoin. |

### À retenir

- **Ne pas modifier ce fichier à la main.**
- Si on ajoute ou retire un outil dans `package.json`, npm met à jour `package-lock.json`.
- Il est normal qu'il soit très long : il décrit tout l'arbre des dépendances.
- On ne commente pas chaque dépendance : cela n'apporterait rien à la présentation et le fichier serait réécrit par npm.

---

## 3. `.htmlvalidate.json`

### Rôle

Ce fichier donne ses règles à **html-validate**, l'outil qui vérifie le HTML.

### Ligne par ligne

| Ligne | Contenu | Explication simple |
|---|---|---|
| 1 | `{` | Ouvre la configuration. |
| 2 | `"extends": ["html-validate:recommended"]` | Utilise les règles recommandées par html-validate. |
| 3 | `"rules": {` | Ouvre la liste des exceptions. |
| 4 | `"no-inline-style": "off"` | Autorise les attributs `style="..."` dans le HTML. |
| 5 | `}` | Ferme la liste des exceptions. |
| 6 | `}` | Ferme la configuration. |

### Pourquoi `no-inline-style` est désactivé

Le site utilise quelques styles directement dans les balises HTML, par exemple pour des marges ou des tailles ponctuelles.
La règle est donc désactivée pour ne pas bloquer la CI sur ces cas volontaires.

---

## 4. `.stylelintrc.json`

### Rôle

Ce fichier donne ses règles à **Stylelint**, l'outil qui vérifie le CSS.

### Ligne par ligne

| Ligne | Contenu | Explication simple |
|---|---|---|
| 1 | `{` | Ouvre la configuration. |
| 2 | `"extends": ["stylelint-config-standard"]` | Utilise les règles standard de Stylelint. |
| 3 | `"rules": {` | Ouvre la liste des exceptions. |
| 4 | `"alpha-value-notation": null` | Autorise plusieurs façons d'écrire la transparence. |
| 5 | `"at-rule-empty-line-before": null` | N'impose pas de ligne vide avant `@media`. |
| 6 | `"color-function-alias-notation": null` | Autorise les anciennes et nouvelles écritures des couleurs. |
| 7 | `"color-function-notation": null` | Autorise `rgb(...)` et `rgba(...)`. |
| 8 | `"color-hex-length": null` | Autorise `#fff` et `#ffffff`. |
| 9 | `"comment-empty-line-before": null` | N'impose pas de ligne vide avant un commentaire CSS. |
| 10 | `"custom-property-pattern": null` | N'impose pas de règle de nommage pour les variables CSS. |
| 11 | `"declaration-block-no-redundant-longhand-properties": null` | Autorise plusieurs propriétés détaillées au lieu d'une propriété raccourcie. |
| 12 | `"declaration-empty-line-before": null` | N'impose pas de ligne vide entre les déclarations. |
| 13 | `"keyframes-name-pattern": null` | N'impose pas de règle de nommage pour les animations. |
| 14 | `"length-zero-no-unit": null` | Autorise `0px` au lieu de `0`. |
| 15 | `"media-feature-range-notation": null` | Autorise l'écriture `min-width` / `max-width`. |
| 16 | `"no-descending-specificity": null` | Ne bloque pas sur l'ordre de spécificité des sélecteurs. |
| 17 | `"property-no-vendor-prefix": null` | Autorise les préfixes comme `-webkit-`. |
| 18 | `"rule-empty-line-before": null` | N'impose pas de ligne vide entre deux règles CSS. |
| 19 | `"selector-attribute-quotes": null` | Autorise les guillemets ou non dans les sélecteurs. |
| 20 | `"selector-class-pattern": null` | N'impose pas de convention de nommage pour les classes CSS. |
| 21 | `"value-keyword-case": null` | Autorise les majuscules ou minuscules dans certaines valeurs. |
| 22 | `"value-no-vendor-prefix": null` | Autorise les préfixes dans les valeurs. |
| 23 | `}` | Ferme la liste des exceptions. |
| 24 | `}` | Ferme la configuration. |

### À retenir

Ces règles sont désactivées pour **ne pas réécrire tout le CSS existant**.
Stylelint continue de vérifier les vraies erreurs, mais ne bloque pas sur des choix de mise en forme.

---

## 5. `eslint.config.mjs`

### Rôle

Ce fichier donne ses règles à **ESLint**, l'outil qui vérifie le JavaScript.

Il est déjà commenté ligne par ligne dans le fichier.
Voici le rôle de chaque bloc :

| Bloc | Explication simple |
|---|---|
| `import js from "@eslint/js"` | Charge les règles recommandées. |
| `import globals from "globals"` | Charge la liste des variables globales du navigateur. |
| `export default [...]` | Exporte la configuration lue par ESLint. |
| `js.configs.recommended` | Active les règles de base. |
| `files: ["js/**/*.js"]` | Applique les règles aux fichiers du dossier `js`. |
| `ecmaVersion: 2022` | Autorise le JavaScript moderne. |
| `sourceType: "module"` | Autorise `import` et `export`. |
| `globals.browser` | Reconnaît `window`, `document`, etc. |
| `CSS: "readonly"` | Reconnaît l'objet navigateur `CSS` sans le modifier. |
| `no-unused-vars` | Signale une variable déclarée mais jamais utilisée. |
| `argsIgnorePattern` / `varsIgnorePattern` | Ignore les noms qui commencent par `_`. |
| `no-empty` | Signale les blocs vides. |
| `allowEmptyCatch` | Autorise `catch {}` quand on veut ignorer volontairement une erreur. |

---

## 6. `.gitignore`

### Rôle

Ce fichier liste ce que Git ne doit **pas** envoyer sur GitHub.

### Ligne par ligne

| Ligne | Contenu | Explication simple |
|---|---|---|
| 2 | `.DS_Store` | Fichier caché créé par macOS. Inutile pour le projet. |
| 5 | `node_modules/` | Dossier des dépendances npm. Il est recréé avec `npm ci`. |
| 8 | `_site/` | Dossier temporaire créé par le déploiement GitHub Pages. |

Les lignes vides et les commentaires `#` n'ont aucun effet sur Git : ils servent seulement à expliquer.

---

## 7. `.github/CODEOWNERS`

### Rôle

Ce fichier indique à GitHub qui doit relire les pull requests.

### Ligne par ligne

| Ligne | Contenu | Explication simple |
|---|---|---|
| 4 | `* @rayague` | `*` signifie « tous les fichiers ». `@rayague` est la personne demandée automatiquement comme reviewer. |

Les lignes 1 à 3 sont des commentaires : elles expliquent le fichier mais ne changent pas son comportement.

---

## 8. `.github/pull_request_template.md`

### Rôle

Ce fichier est le **modèle de description** qui apparaît quand on ouvre une pull request.
Il aide la personne qui relit à comprendre le changement.

### Section par section

| Section | Explication simple |
|---|---|
| `Ce que fait cette PR` | Résumé du problème et de la solution. |
| `Comment tester` | Étapes pour vérifier le changement. |
| Checklist | Vérifications faites avant de demander la relecture. |
| `Branche cible` | Indique si la PR va vers `dev` ou vers `main`. |

Les commentaires `<!-- ... -->` sont invisibles dans la PR affichée sur GitHub.
Ils servent de guide à la personne qui remplit le modèle.

---

## 9. `.github/workflows/pipeline.yml`

### Rôle

C'est le **cerveau de l'automatisation**.
GitHub lit ce fichier pour savoir quoi faire quand on pousse du code ou quand on ouvre une pull request.

### Ligne par ligne — les grandes parties

| Bloc | Explication simple |
|---|---|
| `name: Pipeline` | Nom affiché dans l'onglet Actions. |
| `on: push: branches: ['**']` | Lance le pipeline sur chaque push, toutes branches confondues. |
| `on: pull_request: branches: [dev, main]` | Lance le pipeline quand une PR vise `dev` ou `main`. |
| `on: workflow_dispatch` | Ajoute un bouton pour lancer le pipeline à la main. |
| `permissions: contents: read` | Donne seulement le droit de lire le dépôt. |
| `concurrency` | Annule un ancien pipeline si un nouveau push arrive sur la même branche. |
| `jobs: quality` | Vérifie la qualité du code et des données. |
| `runs-on: ubuntu-latest` | Utilise une machine Linux fournie par GitHub. |
| `actions/checkout@v4` | Télécharge le code du dépôt sur la machine. |
| `actions/setup-node@v4` | Installe Node.js 24. |
| `cache: npm` | Réutilise les téléchargements npm pour aller plus vite. |
| `npm ci` | Installe exactement les versions de `package-lock.json`. |
| `npm run ci` | Lance les 4 vérifications : HTML, CSS, JS, données. |
| `jobs: flow-guard` | Vérifie le sens de la pull request. |
| `if: github.event_name == 'pull_request'` | Ce job ne tourne que pour une PR. |
| `base` | Branche qui reçoit la PR. |
| `head` | Branche qui propose les changements. |
| `case "$head" in dev|hotfix/*` | Une PR vers `main` doit venir de `dev` ou d'une branche `hotfix/*`. |
| `case "$head" in feature/*` | Une PR vers `dev` doit venir d'une branche `feature/*`. |
| `jobs: deploy` | Publie le site sur GitHub Pages. |
| `needs: quality` | Attend que `quality` réussisse avant de déployer. |
| `if: github.ref == 'refs/heads/main'` | Le déploiement ne part que de `main`. |
| `permissions: pages: write` | Autorise l'écriture sur GitHub Pages. |
| `permissions: id-token: write` | Autorise l'utilisation d'un jeton temporaire pour Pages. |
| `environment: github-pages` | Relie le job à l'environnement Pages. |
| `concurrency: group: pages` | Empêche deux déploiements simultanés. |
| `rm -rf _site` | Supprime un ancien dossier temporaire. |
| `mkdir -p _site` | Crée un dossier propre pour le site. |
| `cp -R ... _site/` | Copie uniquement les fichiers nécessaires au site. |
| `touch _site/.nojekyll` | Évite que GitHub ignore certains fichiers. |
| `actions/configure-pages@v5` | Prépare la configuration Pages. |
| `actions/upload-pages-artifact@v3` | Envoie le dossier `_site` à GitHub. |
| `actions/deploy-pages@v4` | Publie réellement le site. |

### À retenir

- `quality` vérifie **avant** de déployer.
- `flow-guard` empêche les mélanges de branches.
- `deploy` ne tourne **que** sur `main`.
- Une PR ne déploie jamais directement le site.

---

## 10. `data/annonces.json`

### Rôle

Ce fichier contient les **30 annonces** du site.
Ce n'est pas un fichier de configuration, mais c'est la source de contenu la plus importante.

### Structure

Le fichier est un tableau JSON.
Chaque élément du tableau est une annonce.

| Champ | Type | Explication simple |
|---|---|---|
| `id` | nombre | Identifiant unique de l'annonce. |
| `titre` | texte | Titre affiché. |
| `categorie` | texte | Une des 8 catégories du site. |
| `lieu` | texte | Lieu de l'annonce. |
| `date` | texte | Période ou date affichée. |
| `statut` | texte | `Documenté`, `Non élucidé` ou `Témoignage`. |
| `gravite` | nombre | Niveau de gravité, de 1 à 3. |
| `extrait` | texte | Résumé court affiché sur les cartes. |
| `recit` | texte | Récit complet de l'annonce. |
| `source` | texte | Source présentée dans la fiche. |
| `date_pub` | texte | Date de publication au format `AAAA-MM-JJ`. |
| `image` | texte | Chemin d'une image WebP, ou vide pour générer un visuel. |
| `featured` | booléen | `true` = mise en avant « à la une ». |
| `urgent` | booléen | `true` = badge urgent. |
| `nouveau` | booléen | `true` = badge nouveau. |

### Les 8 catégories

- Affaires non résolues
- Apparitions & créatures
- Disparitions
- Lieux maudits
- Objets troublants
- Phénomènes nocturnes
- Présages & signes
- Témoignages & écrits

### À retenir

- Le JSON ne peut pas contenir de commentaires.
- `scripts/validate-data.mjs` vérifie les champs obligatoires, les doublons et le nombre d'annonces.
- Une image vide n'est pas une erreur : le site génère un visuel.

---

## 11. `scripts/push.mjs`

### Rôle

Ce script est lancé par `npm run push`.
Il évite de faire plusieurs commandes à la main :

1. pousser la branche ;
2. créer la pull request vers `dev` ;
3. activer l'auto-merge.

### Section par section

| Section | Explication simple |
|---|---|
| En-tête | Explique le rôle du script et la nécessité de `gh auth login`. |
| `import execFileSync` | Permet de lancer des commandes Git et GitHub CLI. |
| `run` | Lance une commande et récupère son résultat. |
| `fail` | Affiche une erreur et arrête le script. |
| `branch` | Demande à Git le nom de la branche actuelle. |
| Branche protégée | Refuse `dev` et `main`. |
| Branche `feature/*` | Refuse les autres préfixes. |
| `git status --porcelain` | Refuse s'il reste des modifications non commitées. |
| Vérification de `gh` | Vérifie que GitHub CLI est installé et connecté. |
| `git push -u origin HEAD` | Envoie la branche sur GitHub. |
| `gh pr list` | Cherche une PR déjà ouverte. |
| `gh pr create --fill` | Crée la PR avec un titre et une description automatiques. |
| `gh pr view` | Lit l'état de la PR. |
| `gh pr update-branch` | Met la branche à jour si `dev` a avancé. |
| `gh pr merge --auto --squash` | Active l'auto-merge en un seul commit. |
| Messages finaux | Affiche l'adresse de la PR et ce qui va se passer. |

### À retenir

- Le script ne fonctionne que sur une branche `feature/*`.
- Il ne pousse jamais directement sur `dev` ou `main`.
- Il utilise ton compte GitHub, pas un mot de passe partagé.

---

## 12. `scripts/validate-data.mjs`

### Rôle

Ce script vérifie que le fichier `data/annonces.json` est utilisable par le site.

### Section par section

| Section | Explication simple |
|---|---|
| `REQUIRED` | Liste des champs qu'une annonce doit avoir. |
| `readFile` | Lit le fichier JSON. |
| `.replace(/^\uFEFF/, "")` | Supprime un caractère invisible (BOM) ajouté par certains éditeurs. |
| `JSON.parse` | Transforme le texte en données utilisables. |
| `Array.isArray` | Vérifie que la racine est bien un tableau. |
| `errors` | Compte les problèmes trouvés. |
| `ids` | Mémorise les identifiants pour détecter les doublons. |
| `forEach` | Parcourt chaque annonce. |
| `for (const key of REQUIRED)` | Vérifie chaque champ obligatoire. |
| `ids.has` | Vérifie qu'un identifiant n'est pas déjà utilisé. |
| `data.length !== 30` | Vérifie qu'il y a exactement 30 annonces. |
| `process.exit(1)` | Fait échouer la CI s'il y a une erreur. |
| `console.log` | Affiche `OK : 30 annonces valides.` quand tout va bien. |

---

## 13. `scripts/release.mjs`

### Rôle

Ce script gère la mise en production.
Il a deux modes, appelés par deux commandes npm :

- `npm run release` : prépare la PR `dev` → `main`, vérifie tout et indique s'il reste l'approbation ;
- `npm run release:merge` : après approbation, merge la PR, attend le déploiement et vérifie le site.

### Section par section

| Section | Explication simple |
|---|---|
| En-tête | Explique les deux commandes et la nécessité de `gh auth login`. |
| `SITE_URL` | Adresse du site public vérifiée à la fin. |
| `REQUIRED_CHECKS` | Checks obligatoires : `quality` et `flow-guard`. |
| `MODE` | Choisit entre le mode préparation et le mode merge. |
| `run` | Lance une commande et récupère son résultat. |
| `runInherit` | Lance une commande en affichant sa sortie dans le terminal. |
| `runNpm` | Lance npm de façon compatible avec Windows et macOS/Linux. |
| `fail` | Affiche une erreur et arrête le script. |
| `sleep` | Petite pause asynchrone pour attendre GitHub. |
| `sleepSync` | Même pause, en version synchrone. |
| `checkGh` | Vérifie que GitHub CLI est installé et connecté. |
| `findOpenReleasePr` | Cherche la PR ouverte `dev` → `main`. |
| `viewPr` | Lit l'état de la PR : approbation, checks, commit de tête. |
| `waitRequiredChecks` | Vérifie explicitement que `quality` et `flow-guard` sont réussis. |
| `waitChecks` | Attend `gh pr checks`, puis appelle `waitRequiredChecks`. |
| `ensureUpToDate` | Met `dev` à jour si `main` a avancé. |
| `waitForRun` | Attend que le workflow `Pipeline` apparaisse pour le commit de merge. |
| `prepareRelease` | Vérifie `dev`, lance `npm run ci`, crée la PR, attend les checks et affiche l'étape suivante. |
| `mergeRelease` | Vérifie l'approbation, merge, attend le deploy et vérifie le site. |
| Point d'entrée | Lance le bon mode selon `--merge`. |

### Sécurité

- Le script vérifie qu'on est bien sur `dev` avant de préparer la release.
- Il refuse s'il reste des modifications non commitées.
- Il attend les checks avant de proposer le merge.
- Il attend explicitement `flow-guard`, car juste après la création d'une PR, `gh pr checks` peut ne voir que le run `push` et pas encore le run `pull_request`.
- Il vérifie qu'une approbation existe avant de merger.
- Il utilise `--match-head-commit` pour merger exactement le commit qui a été approuvé.
- Il ne peut pas approuver à la place d'une autre personne.

---

## 14. `README.md` et `CONTRIBUTING.md`

Ce ne sont pas des fichiers de configuration lus par les outils.
Ce sont des documents pour les humains :

- `README.md` présente le site, les dossiers et le lancement local ;
- `CONTRIBUTING.md` explique le travail d'équipe, les branches et les commandes.

Ils sont mis à jour pour refléter le fonctionnement réel du projet.

---

## 15. Ce qui n'est pas commenté ligne par ligne

| Fichier | Pourquoi |
|---|---|
| `package-lock.json` | Généré par npm, très long, ne doit pas être modifié à la main. |
| `data/annonces.json` | JSON de contenu : le schéma est expliqué ci-dessus. |
| `README.md` | Document narratif : il est déjà écrit en français. |
| `CONTRIBUTING.md` | Document narratif : il est déjà écrit en français. |
| `PROMPT-site-annonces.md` | Brief créatif initial du projet, conservé comme historique. |

## 16. Résumé pour une présentation

Les fichiers de configuration remplissent trois rôles :

1. **Décrire le projet** : `package.json`, `package-lock.json`.
2. **Vérifier la qualité** : `.htmlvalidate.json`, `.stylelintrc.json`, `eslint.config.mjs`, `scripts/validate-data.mjs`.
3. **Automatiser le travail d'équipe** : `pipeline.yml`, `CODEOWNERS`, modèle de PR, `scripts/push.mjs`, `scripts/release.mjs`.

Le fichier le plus important pour comprendre l'automatisation est `.github/workflows/pipeline.yml`.
Le fichier le plus important pour comprendre le contenu est `data/annonces.json`.
