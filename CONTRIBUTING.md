# Workflow d'équipe

- `main` : production.
- `dev` : intégration.
- `feature/<prenom>` : branche personnelle.

## Règles

- Ne jamais pousser directement sur `main` ou `dev`.
- Une PR `feature/*` → `dev` doit passer la CI.
- Une PR `dev` → `main` doit passer la CI et être validée.
- Ne pas supprimer les branches après merge.

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

Sans `gh`, ouvrir la PR manuellement sur GitHub vers `dev`.
