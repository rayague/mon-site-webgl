# Workflow d'équipe

- `main` : production.
- `dev` : intégration.
- `feature/<prenom>` : branche personnelle.

## Règles

- Ne jamais pousser directement sur `main` ou `dev`.
- Une PR `feature/*` → `dev` doit passer la CI.
- Une PR `dev` → `main` doit passer la CI et être validée.
- Ne pas supprimer les branches après merge.
