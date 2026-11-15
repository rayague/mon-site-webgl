# Guide du projet ÉCLIPSE

Ce guide explique le projet de bout en bout, sans supposer que le lecteur est informaticien.
Il sert à comprendre **ce qui existe**, **qui fait quoi**, et **ce qui se passe quand on modifie le site**.

## 1. Le projet en une phrase

ÉCLIPSE est un site vitrine statique qui présente 30 annonces fictives sous forme de chronique nocturne, avec une introduction WebGL2 sur la page d'accueil et un déploiement automatique sur GitHub Pages.

## 2. Ce que voit le visiteur

| Page | Rôle |
|---|---|
| `index.html` | Accueil : introduction WebGL, présentation, annonces à la une, compteurs. |
| `annonces.html` | Gazette : liste des annonces, filtres, tri, recherche, favoris. |
| `annonce.html` | Fiche d'une annonce : récit, source, visuel, annonces similaires. |
| `publier.html` | Formulaire de démonstration avec aperçu en direct. |

Le contenu vient de `data/annonces.json`.
Il y a 30 annonces, réparties en 8 catégories.

## 3. Comment le site est construit

Le site est **statique** :

- pas de serveur applicatif ;
- pas de base de données ;
- pas de compte utilisateur ;
- les fichiers HTML, CSS, JavaScript et JSON sont envoyés tels quels au navigateur ;
- GitHub Pages héberge les fichiers.

Les favoris sont stockés dans le navigateur avec `localStorage`.
Le formulaire de publication est une démonstration front-end : il ne sauvegarde pas de vraie annonce sur un serveur.

L'introduction WebGL2 n'est présente que sur `index.html`.
Les autres pages utilisent le même univers visuel, mais sans l'animation d'ouverture.

## 4. Les branches

| Branche | Rôle | Protection |
|---|---|---|
| `main` | Production, site public | PR obligatoire, 1 approbation, checks obligatoires |
| `dev` | Intégration, travail validé avant production | PR obligatoire, 0 approbation, checks obligatoires |
| `feature/<prenom>` | Branche personnelle de travail | Aucune protection spéciale |

Règle simple :

- on travaille sur `feature/...` ;
- on fusionne dans `dev` ;
- on fusionne `dev` dans `main` pour publier.

## 5. Le trajet d'une modification

1. Créer une branche `feature/<prenom>`.
2. Modifier les fichiers.
3. Lancer `npm run ci` pour vérifier localement.
4. Commiter les changements.
5. Lancer `npm run push`.
6. Le script pousse la branche et crée la PR vers `dev`.
7. GitHub lance `quality` et `flow-guard`.
8. Si les checks sont verts, l'auto-merge fusionne dans `dev`.
9. `dev` contient maintenant le changement, mais le site public n'est pas encore mis à jour.
10. Quand on veut publier, on lance `npm run release` : la PR `dev` → `main` est préparée et les checks sont attendus.
11. Une autre personne approuve la PR.
12. On lance `npm run release:merge` : le script merge dans `main` et attend le déploiement.
13. GitHub lance `deploy`.
14. Le site public est mis à jour et le script vérifie qu'il répond.

## 6. Les 4 vérifications locales

La commande `npm run ci` lance quatre contrôles :

| Commande | Outil | Ce qui est vérifié |
|---|---|---|
| `npm run lint:html` | html-validate | Structure des 4 pages HTML |
| `npm run lint:css` | Stylelint | Règles et erreurs CSS |
| `npm run lint:js` | ESLint | Erreurs et variables inutilisées en JavaScript |
| `npm run check:data` | Script maison | 30 annonces, champs obligatoires, identifiants uniques |

Si une vérification échoue, la commande s'arrête.
C'est volontaire : on ne veut pas envoyer un changement cassé.

## 7. Le pipeline GitHub Actions

Le fichier `.github/workflows/pipeline.yml` décrit trois jobs.

### `quality`

Tourne sur chaque push et sur les PR vers `dev` ou `main`.

- installe Node.js 24 ;
- installe les dépendances avec `npm ci` ;
- lance `npm run ci`.

### `flow-guard`

Tourne uniquement sur les pull requests.

- une PR vers `main` doit venir de `dev` ou de `hotfix/*` ;
- une PR vers `dev` doit venir de `feature/*`.

Cela évite de mettre en production une branche personnelle par erreur.

### `deploy`

Tourne uniquement après un push sur `main`.

- attend que `quality` réussisse ;
- prépare un dossier `_site` ;
- publie le site sur GitHub Pages.

Une PR ne déploie jamais le site.
Le déploiement part seulement de `main`.

## 8. Ce qui est automatique et ce qui reste manuel

| Action | Automatique ? | Détail |
|---|---|---|
| Vérifier le code | Oui | `npm run ci` en local et `quality` sur GitHub |
| Vérifier le sens de la PR | Oui | `flow-guard` |
| Créer la PR `feature` → `dev` | Oui | `npm run push` |
| Merger dans `dev` | Oui | Auto-merge après checks |
| Créer la PR `dev` → `main` | Oui | `npm run release` |
| Approuver la mise en production | Non | Une autre personne doit approuver |
| Merger dans `main` | Oui, après approbation | `npm run release:merge` |
| Déployer sur GitHub Pages | Oui | `deploy` après merge dans `main` |

`npm run release` prépare la PR de production, lance les vérifications et indique s'il reste l'approbation.
`npm run release:merge` merge la PR après approbation, attend le déploiement et vérifie le site.
L'approbation reste humaine : le script ne peut pas approuver à la place d'une autre personne.

## 9. Les protections GitHub

### `main`

- pull request obligatoire ;
- 1 approbation d'une autre personne ;
- checks `quality` et `flow-guard` obligatoires ;
- branche à jour avant merge ;
- conversations résolues ;
- admins inclus dans la règle ;
- force push interdit ;
- suppression de branche interdite.

### `dev`

- pull request obligatoire ;
- 0 approbation ;
- mêmes checks obligatoires ;
- mêmes interdictions de force push et de suppression.

### Réglages généraux

- branche par défaut : `dev` ;
- auto-merge autorisé ;
- suppression automatique des branches après merge : désactivée.

## 10. Les scripts

| Commande | Fichier | Rôle |
|---|---|---|
| `npm run push` | `scripts/push.mjs` | Pousse une branche `feature/*` et crée la PR vers `dev` |
| `npm run release` | `scripts/release.mjs` | Prépare la PR `dev` → `main` et attend les checks |
| `npm run release:merge` | `scripts/release.mjs --merge` | Merge après approbation, attend le deploy et vérifie le site |
| `npm run check:data` | `scripts/validate-data.mjs` | Vérifie les 30 annonces |
| `npm run ci` | `package.json` | Lance les 4 vérifications |

## 11. La mise en production avec les scripts

1. Se placer sur `dev` et récupérer la dernière version.
2. Lancer `npm run release`.
3. Le script vérifie tout, crée la PR `dev` → `main` et attend les checks.
4. Demander à Elvis, Bethsaida ou Rene d'approuver.
5. Lancer `npm run release:merge`.
6. Le script merge, attend `deploy` et vérifie le site.

Commandes :

```powershell
git switch dev
git pull --ff-only
npm run release
```

Le script affiche alors la commande d'approbation exacte, par exemple :

```powershell
gh pr review 5 --approve
```

Puis, après l'approbation :

```powershell
npm run release:merge
```

Si l'approbation manque, `release:merge` s'arrête et redonne la commande.
Si tout est bon, il affiche le résultat du déploiement et l'adresse du site.

Pour vérifier manuellement le dernier déploiement :

```powershell
gh run list --branch main --limit 3
```

## 12. Qui fait quoi

| Personne | Rôle |
|---|---|
| Ray | Admin du dépôt, configure GitHub, suit le pipeline, merge les releases |
| Elvis | Collaborateur write, peut créer des branches, pousser, ouvrir des PR et approuver |
| Bethsaida | Collaboratrice write, peut créer des branches, pousser, ouvrir des PR et approuver |
| Rene | Collaborateur write après acceptation de l'invitation, peut approuver les releases |

Ray ne peut pas approuver sa propre PR.
Même en admin, la règle `enforce_admins` l'en empêche.

## 13. Où voir ce qui se passe

| Endroit | Ce qu'on y voit |
|---|---|
| GitHub → Actions | Les pipelines `quality`, `flow-guard`, `deploy` |
| GitHub → Pull requests | Les propositions de changement, les checks et les approbations |
| GitHub → Settings → Branches | Les protections de `main` et `dev` |
| GitHub Pages | Le site public |
| `npm run ci` en local | Les mêmes vérifications que la CI, avant de pousser |

## 14. Le schéma à retenir

```text
feature/<prenom>
      |
      | npm run push
      v
PR feature -> dev
      |
      | quality + flow-guard
      v
  merge automatique
      |
      v
    dev
      |
      | PR dev -> main
      | 1 approbation d'une autre personne
      v
    main
      |
      | deploy
      v
GitHub Pages
```

## 15. Glossaire

| Mot | Explication simple |
|---|---|
| Branche | Une version parallèle du projet, pour travailler sans toucher aux autres. |
| Commit | Un enregistrement d'un ensemble de modifications. |
| Push | Envoyer ses commits locaux sur GitHub. |
| Pull request (PR) | Une demande pour intégrer une branche dans une autre, avec relecture. |
| Merge | Fusionner une branche dans une autre. |
| Squash | Regrouper plusieurs commits en un seul lors du merge. |
| CI | Vérifications automatiques lancées après un push ou une PR. |
| Check | Une vérification précise dans la CI, par exemple `quality`. |
| Workflow | Un fichier qui décrit une automatisation GitHub Actions. |
| Runner | La machine fournie par GitHub qui exécute le workflow. |
| Deploy | Publier le site sur GitHub Pages. |
| Protection de branche | Règle qui empêche de modifier une branche sans PR ni validation. |
| Approbation | Action par laquelle une autre personne valide une PR. |
| Auto-merge | Fusion automatique dès que les conditions sont remplies. |
| JSON | Format de données lisible par un programme, sans commentaires possibles. |
| `localStorage` | Petit espace de stockage dans le navigateur, utilisé pour les favoris. |
| WebGL2 | Technologie du navigateur utilisée pour l'animation des yeux. |

## 16. Questions fréquentes

### Pourquoi je ne peux pas approuver ma propre PR ?

Parce que GitHub interdit l'auto-approbation.
L'objectif est d'avoir un deuxième regard avant la production.

### Pourquoi ne pas pousser directement sur `main` ou `dev` ?

Parce que les branches sont protégées.
Cela évite les erreurs et force le passage par les vérifications.

### Pourquoi `dev` et `main` ?

`dev` sert à assembler et tester le travail de l'équipe.
`main` sert à publier la version stable.

### Que se passe-t-il si `npm run ci` échoue ?

La commande s'arrête et affiche l'erreur.
Il faut corriger, relancer `npm run ci`, puis recommencer.

### Que se passe-t-il si un check GitHub échoue ?

La PR reste ouverte et ne peut pas être fusionnée.
Il faut corriger la branche, puis relancer `npm run push`.

### Pourquoi le site public ne change pas après un merge dans `dev` ?

Parce que `deploy` ne part que de `main`.
`dev` est une branche d'intégration, pas la production.

### Pourquoi les fichiers JSON n'ont-ils pas de commentaires ?

Parce que le format JSON ne les autorise pas.
Les explications sont dans `docs/CONFIGURATION.md`.

### Où sont stockés les favoris ?

Dans le navigateur, avec `localStorage`.
Ils ne sont pas envoyés à un serveur.

### Le formulaire de publication enregistre-t-il vraiment une annonce ?

Non. C'est une démonstration front-end avec aperçu en direct.
Aucun serveur ne reçoit les données.

### Combien d'annonces ?

30 annonces, réparties en 8 catégories.

## 17. Pour la présentation

Le document `docs/PRESENTATION.md` contient :

- un paragraphe prêt à lire ;
- une version courte de 30 secondes ;
- un plan de présentation en 5 parties ;
- une démonstration à suivre ;
- des questions probables et leurs réponses.

## 18. Ce que le projet n'est pas

- Ce n'est pas un réseau social.
- Ce n'est pas un site avec comptes utilisateurs.
- Ce n'est pas une application avec base de données.
- Ce n'est pas un site e-commerce.
- Ce n'est pas une intelligence artificielle.

C'est un site statique, avec une automatisation sérieuse autour de la qualité et du déploiement.
