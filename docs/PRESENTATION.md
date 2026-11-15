# Présentation du projet ÉCLIPSE

Ce document est prêt pour une présentation orale ou un rapport écrit.
Il reprend les mêmes faits que le projet, dans un langage simple.

## 1. Paragraphe explicatif complet

ÉCLIPSE est un site vitrine statique consacré à une chronique nocturne d'annonces fictives. Le site contient quatre pages : une page d'accueil avec une introduction WebGL2, une gazette qui présente 30 annonces, une fiche détaillée pour chaque annonce et un formulaire de démonstration avec aperçu en direct. Les données sont stockées dans un fichier JSON unique, ce qui permet de modifier le contenu sans toucher à la structure des pages. Le site est hébergé sur GitHub Pages et ne dépend d'aucun serveur applicatif ni d'aucune base de données.

Autour du site, j'ai mis en place une organisation de travail pour une équipe. Les membres travaillent sur des branches `feature/...`, puis leurs changements passent par une pull request vers `dev`. La CI vérifie automatiquement le HTML, le CSS, le JavaScript et les données. Un second contrôle, appelé `flow-guard`, vérifie que les pull requests vont dans le bon sens. La branche `dev` est protégée : elle exige une pull request et les checks, mais aucune approbation. La branche `main` est encore plus protégée : elle exige une pull request, les checks et l'approbation d'une autre personne. Même un administrateur ne peut pas contourner ces règles. La mise en production se prépare avec `npm run release`, qui crée la PR `dev` → `main`, attend les checks et indique s'il reste l'approbation. Après l'approbation d'une autre personne, `npm run release:merge` merge la PR, attend le déploiement GitHub Pages et vérifie que le site répond. Le projet utilise aussi `npm run push` pour automatiser la création et la fusion des PR vers `dev`. L'objectif est simple : rendre le travail d'équipe traçable, éviter les erreurs et garantir que seul un code vérifié arrive en production.

## 2. Version courte — 30 secondes

ÉCLIPSE est un site statique de 30 annonces, avec une introduction WebGL2 et quatre pages. Le contenu vient d'un fichier JSON et le site est publié sur GitHub Pages. Autour du site, j'ai installé une chaîne de travail d'équipe : branches `feature`, pull requests vers `dev`, vérifications automatiques du HTML, du CSS, du JavaScript et des données, puis une branche `main` protégée par une approbation avant la mise en production. `npm run release` prépare la PR de production, et `npm run release:merge` merge puis vérifie le déploiement après approbation. L'objectif est d'avoir un projet clair, testé et reproductible.

## 3. Plan de présentation en 5 parties

### Partie 1 — Le projet

- ÉCLIPSE : chronique nocturne d'annonces fictives.
- 4 pages : accueil, gazette, fiche, publication.
- 30 annonces, 8 catégories.
- Introduction WebGL2 sur l'accueil.

### Partie 2 — Le problème

- Un site seul est facile à casser.
- À plusieurs, il faut savoir qui modifie quoi.
- Il faut éviter les erreurs avant la production.
- Il faut pouvoir revenir en arrière et comprendre l'historique.

### Partie 3 — La solution technique

- Site statique : HTML, CSS, JavaScript, JSON.
- Aucun serveur, aucune base de données.
- GitHub Pages pour l'hébergement.
- Données centralisées dans `data/annonces.json`.
- Visuels générés automatiquement si aucune image n'est fournie.

### Partie 4 — Le travail d'équipe

- Branches `feature/...`.
- PR vers `dev`.
- CI : `quality` + `flow-guard`.
- `dev` : merge automatique après checks.
- `main` : PR + 1 approbation.
- `deploy` : uniquement depuis `main`.

### Partie 5 — Démonstration et résultats

- Montrer une branche, une PR, les checks verts.
- Montrer l'auto-merge dans `dev`.
- Montrer la PR `dev` → `main`.
- Montrer l'approbation.
- Montrer le déploiement et le site public.

## 4. Phrases clés à utiliser

- « Le site est statique : il n'y a pas de serveur à maintenir. »
- « Le contenu est séparé de la présentation : les annonces sont dans un fichier JSON. »
- « Une branche personnelle ne peut pas aller directement en production. »
- « La CI vérifie quatre choses : le HTML, le CSS, le JavaScript et les données. »
- « `flow-guard` empêche les mélanges de branches. »
- « `dev` est la branche d'intégration, `main` est la production. »
- « Une PR vers `main` doit être approuvée par une autre personne. »
- « Même un admin ne peut pas contourner la protection. »
- « Le déploiement est automatique après le merge dans `main`. »
- « `npm run push` automatise la PR vers `dev`, pas la mise en production. »
- « `npm run release` prépare la production, mais ne peut pas approuver à ma place. »
- « `npm run release:merge` merge, attend le deploy et vérifie le site. »

## 5. Démonstration en direct

### Étape 1 — Montrer l'état du dépôt

```powershell
git branch
git log --oneline -5
```

Dire : « `main` est la production, `dev` est l'intégration, les branches `feature/...` servent au travail personnel. »

### Étape 2 — Montrer une branche de travail

```powershell
git switch feature/exemple
git status
```

Dire : « On travaille toujours sur une branche, jamais directement sur `main` ou `dev`. »

### Étape 3 — Montrer la CI locale

```powershell
npm run ci
```

Dire : « Cette commande vérifie le HTML, le CSS, le JavaScript et les 30 annonces. »

### Étape 4 — Montrer une PR

Ouvrir GitHub → Pull requests.
Montrer :

- les fichiers modifiés ;
- les checks `quality` et `flow-guard` ;
- l'auto-merge ;
- le merge dans `dev`.

### Étape 5 — Montrer la production

Lancer `npm run release`.
Montrer :

- la PR `dev` → `main` créée automatiquement ;
- les checks verts ;
- le message qui indique l'approbation restante ;
- la commande exacte à donner à Elvis ou Bethsaida.

Après l'approbation, lancer `npm run release:merge`.
Montrer :

- le merge ;
- le job `deploy` ;
- la vérification automatique du site ;
- le site public.

## 6. Chiffres à retenir

| Chiffre | Signification |
|---|---|
| 4 | Pages HTML |
| 30 | Annonces dans `data/annonces.json` |
| 8 | Catégories d'annonces |
| 4 | Vérifications locales dans `npm run ci` |
| 3 | Jobs GitHub Actions : `quality`, `flow-guard`, `deploy` |
| 2 | Branches protégées : `main` et `dev` |
| 1 | Approbation obligatoire pour `main` |
| 0 | Approbation obligatoire pour `dev` |
| 1 | Commande pour pousser et créer une PR vers `dev` : `npm run push` |
| 2 | Commandes de production : `npm run release` puis `npm run release:merge` |

## 7. Questions probables et réponses

### « Pourquoi deux branches protégées ? »

`dev` permet d'assembler le travail de l'équipe sans risque.
`main` représente la version publiée. On veut donc une validation supplémentaire avant d'y toucher.

### « Pourquoi une approbation sur `main` et pas sur `dev` ? »

Sur `dev`, les checks automatiques suffisent pour avancer vite.
Sur `main`, le changement part en production : on ajoute un regard humain.

### « Pourquoi Ray ne peut-il pas approuver sa propre PR ? »

GitHub interdit l'auto-approbation.
C'est une sécurité : la personne qui propose ne valide pas seule.

### « Que se passe-t-il si la CI échoue ? »

La PR ne peut pas être fusionnée.
Il faut corriger, relancer les vérifications, puis mettre à jour la branche.

### « Pourquoi le site public ne change pas quand on merge dans `dev` ? »

Parce que `deploy` ne part que de `main`.
`dev` sert à préparer la version suivante.

### « Pourquoi ne pas pousser directement sur `main` ? »

Parce que la branche est protégée.
Cela évite les erreurs et force le passage par une PR, des checks et une approbation.

### « Pourquoi les fichiers JSON n'ont-ils pas de commentaires ? »

Parce que le format JSON ne les autorise pas.
Les explications sont dans `docs/CONFIGURATION.md`.

### « Y a-t-il une base de données ? »

Non. Le site est statique.
Les annonces sont dans un fichier JSON et les favoris dans le navigateur.

### « Le formulaire publie-t-il vraiment une annonce ? »

Non. C'est une démonstration avec aperçu en direct.
Aucun serveur ne reçoit les données.

### « Que fait `npm run release` ? »

Il vérifie que `dev` est propre, lance `npm run ci`, crée la PR `dev` → `main`, attend les checks et indique s'il reste l'approbation.

### « Que fait `npm run release:merge` ? »

Il vérifie que la PR est approuvée, merge dans `main`, attend le déploiement et vérifie que le site public répond.

### « Combien de temps prend un déploiement ? »

Quelques dizaines de secondes en général : installation, vérifications, préparation des fichiers, publication Pages.

## 8. Ce qu'il ne faut pas dire

- Ne pas dire que le site a un backend : il n'en a pas.
- Ne pas dire que le formulaire enregistre des données : ce n'est pas le cas.
- Ne pas dire que `npm run push` met en production : il envoie vers `dev`.
- Ne pas dire que l'admin peut contourner les règles : `enforce_admins` est activé.
- Ne pas dire que les JSON ont des commentaires : ils n'en ont pas.

## 9. Conclusion

Le projet ÉCLIPSE n'est pas seulement un site : c'est aussi une méthode de travail.
Le site est simple à héberger, le contenu est séparé du code, et l'équipe dispose de branches, de vérifications automatiques, de protections et d'un déploiement contrôlé.
Le résultat est un projet lisible, testé et présentable, où chaque changement peut être expliqué et retrouvé.
