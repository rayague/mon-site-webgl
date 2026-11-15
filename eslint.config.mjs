// Importe la configuration "recommandée" fournie par ESLint.
// Elle active les règles de base qui détectent les erreurs JavaScript courantes.
import js from "@eslint/js";

// Importe la liste des variables globales connues (navigateur, Node, etc.).
// Cela évite de signaler "document" ou "window" comme variables non définies.
import globals from "globals";

// Exporte la configuration lue automatiquement par ESLint.
export default [
  // Active les règles recommandées par ESLint.
  js.configs.recommended,

  {
    // Ces règles s'appliquent uniquement aux fichiers JavaScript du dossier "js".
    // "**" signifie "dans tous les sous-dossiers".
    files: ["js/**/*.js"],

    languageOptions: {
      // Autorise la syntaxe JavaScript moderne de 2022.
      ecmaVersion: 2022,

      // Indique que les fichiers utilisent les modules ES
      // (import / export), comme les fichiers du site.
      sourceType: "module",

      globals: {
        // Ajoute les variables globales du navigateur : window, document, etc.
        ...globals.browser,

        // Déclare "CSS" comme variable globale en lecture seule.
        // Elle sert par exemple à vérifier si une propriété CSS est supportée.
        CSS: "readonly"
      }
    },

    rules: {
      // Signale une variable déclarée mais jamais utilisée.
      // Les noms commençant par "_" sont ignorés : c'est une convention
      // pour dire "je sais que cette variable n'est pas utilisée".
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],

      // Signale un bloc vide, par exemple "if (x) {}".
      // "allowEmptyCatch: true" autorise "catch {}" :
      // on peut ignorer volontairement une erreur sans bloquer la CI.
      "no-empty": ["error", { "allowEmptyCatch": true }]
    }
  }
];
