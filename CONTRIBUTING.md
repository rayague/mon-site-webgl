# Workflow d'équipe

## Branches

- `main` : production.
- `dev` : intégration.
- `feature/<prenom>` : branche personnelle.

## Règles

- Ne jamais pousser directement sur `main` ou `dev`.
- Une PR `feature/*` → `dev` doit passer la CI.
- Une PR `dev` → `main` doit passer la CI et être validée par une autre personne.
- Ne pas supprimer les branches après merge.

## Comprendre le projet

- `docs/GUIDE-PROJET.md` : vue d'ensemble, branches, CI/CD, glossaire.
- `docs/CONFIGURATION.md` : explication détaillée des fichiers de configuration.
- `docs/PRESENTATION.md` : support de présentation.

## Pousser et ouvrir la PR automatiquement

Chaque membre se connecte une fois à GitHub CLI :

```powershell
gh auth login
```

Ensuite, au lieu de `git push`, lancer :

```powershell
npm run push
```

Le script pousse la branche, crée la PR vers `dev` si nécessaire, puis active l'auto-merge en squash. Les checks `quality` et `flow-guard` doivent passer avant le merge.

`npm run push` ne vise que `dev`. Il ne met jamais le site en production.

Sans `gh`, ouvrir la PR manuellement sur GitHub vers `dev`.

## Mettre en production

La mise en production se fait avec une PR `dev` → `main`.

1. Se placer sur `dev` et récupérer la dernière version.
2. Lancer `npm run release`.
3. Le script vérifie tout, crée la PR `dev` → `main` et attend les checks.
4. Demander l'approbation d'Elvis, Bethsaida ou Rene.
5. Lancer `npm run release:merge`.
6. Le script merge, attend le job `deploy` et vérifie le site public.

```powershell
git switch dev
git pull --ff-only
npm run release
```

Le script affiche la commande d'approbation exacte, par exemple :

```powershell
gh pr review <num> --approve
```

Puis, après l'approbation :

```powershell
npm run release:merge
```

Si l'approbation manque, `release:merge` s'arrête et redonne la commande.
`npm run release` ne merge jamais tout seul dans `main` : l'approbation reste obligatoire.

## En cas de problème

- Si `npm run ci` échoue : corriger, relancer, puis commiter.
- Si un check GitHub échoue : corriger la branche et relancer `npm run push`.
- Si `deploy` échoue : consulter les logs avec `gh run view <run-id> --log-failed`.
- Ne jamais forcer un push sur `main` ou `dev`.
