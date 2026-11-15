// Ce script est lancé par la commande "npm run push".
// Son rôle : pousser une branche feature, créer une pull request vers "dev",
// puis activer l'auto-merge. Il utilise GitHub CLI ("gh").
// Chaque membre doit avoir fait "gh auth login" au moins une fois.

// "execFileSync" lance une commande externe et attend qu'elle se termine.
// C'est comme taper une commande dans le terminal, mais depuis JavaScript.
import { execFileSync } from "node:child_process";

// "run" est un raccourci pour lancer une commande et récupérer sa sortie texte.
// "options" permet par exemple d'afficher la sortie en direct dans le terminal.
const run = (cmd, args, options = {}) =>
  execFileSync(cmd, args, { encoding: "utf8", ...options });

// "fail" affiche un message clair et arrête le script avec un code d'erreur.
// Un code différent de 0 indique à npm que la commande a échoué.
const fail = (message) => {
  console.error(message);
  process.exit(1);
};

// Demande à Git le nom de la branche actuelle.
// "--abbrev-ref HEAD" signifie "affiche le nom court de la branche courante".
const branch = run("git", ["rev-parse", "--abbrev-ref", "HEAD"]).trim();

// Sécurité : on ne pousse jamais directement sur les branches protégées.
if (branch === "dev" || branch === "main") {
  fail("Branche protégée : crée une branche feature/* avant de pousser.");
}

// Le workflow d'équipe impose des branches qui commencent par "feature/".
// Cela permet à GitHub de vérifier le sens de la pull request.
if (!branch.startsWith("feature/")) {
  fail(`La branche "${branch}" n'est pas une branche feature/*.`);
}

// "git status --porcelain" liste les fichiers modifiés ou non suivis.
// Si la liste n'est pas vide, c'est qu'il reste des changements non commités.
const dirty = run("git", ["status", "--porcelain"]).trim();
if (dirty) {
  fail("Des modifications ne sont pas commitées. Commit d'abord.");
}

// Vérifie que GitHub CLI est installé sur la machine.
try {
  execFileSync("gh", ["--version"], { stdio: "ignore" });
} catch {
  fail("GitHub CLI (gh) n'est pas installé. Installe-le puis lance : gh auth login");
}

// Vérifie que GitHub CLI est connecté à un compte GitHub.
// Sans cette connexion, le script ne pourrait pas créer la pull request.
try {
  execFileSync("gh", ["auth", "status"], { stdio: "ignore" });
} catch {
  fail("GitHub CLI n'est pas authentifié. Lance : gh auth login");
}

// Affiche le nom de la branche poussée pour que l'utilisateur sache ce qui se passe.
console.log(`Push de ${branch}...`);

// Pousse la branche sur GitHub et lie la branche locale à la branche distante.
// "-u" signifie "upstream" : les prochains "git push" sauront où envoyer la branche.
execFileSync("git", ["push", "-u", "origin", "HEAD"], { stdio: "inherit" });

// Cherche une pull request ouverte qui part de cette branche vers "dev".
// On demande seulement le numéro pour pouvoir la réutiliser si elle existe déjà.
const listPrs = () => {
  const raw = run("gh", [
    "pr", "list",
    "--head", branch,
    "--base", "dev",
    "--state", "open",
    "--json", "number"
  ]);
  return JSON.parse(raw);
};

// On regarde d'abord si une PR existe déjà pour éviter d'en créer une deuxième.
let prs = listPrs();
if (prs.length === 0) {
  console.log("Création de la pull request vers dev...");

  // "--fill" remplit automatiquement le titre et la description
  // à partir du nom de la branche et des messages de commit.
  try {
    execFileSync("gh", [
      "pr", "create",
      "--base", "dev",
      "--head", branch,
      "--fill"
    ], { stdio: "inherit" });
  } catch {
    fail("Impossible de créer la PR. Vérifie qu'il y a des commits à proposer.");
  }

  // Après création, on relit la liste pour récupérer le numéro de la PR.
  prs = listPrs();
}

// Si la PR n'apparaît toujours pas, on s'arrête : quelque chose s'est mal passé.
if (prs.length === 0) {
  fail("PR introuvable après création.");
}

// On garde le numéro de la première PR trouvée sous forme de texte.
const number = String(prs[0].number);

// "view" lit les informations de la PR :
// - mergeStateStatus : indique si la branche est à jour ("BEHIND" = en retard) ;
// - autoMergeRequest : indique si l'auto-merge est déjà activé ;
// - url : adresse de la PR sur GitHub.
const view = (fields) => JSON.parse(run("gh", ["pr", "view", number, "--json", fields]));

const state = view("mergeStateStatus,autoMergeRequest,url");

// Si "dev" a avancé depuis la création de la branche, GitHub peut demander
// de mettre la branche à jour avant de pouvoir la fusionner.
if (state.mergeStateStatus === "BEHIND") {
  console.log("Mise à jour de la branche avec dev...");
  try {
    execFileSync("gh", ["pr", "update-branch", number], { stdio: "inherit" });
  } catch {
    console.warn("Impossible de mettre à jour automatiquement la branche.");
  }
}

// Si l'auto-merge n'est pas encore activé, on l'active.
// "--squash" regroupe tous les commits de la branche en un seul commit dans dev.
if (!state.autoMergeRequest) {
  console.log("Activation de l'auto-merge en squash...");
  execFileSync("gh", ["pr", "merge", number, "--auto", "--squash"], { stdio: "inherit" });
}

// Affiche l'adresse de la PR et rappelle ce qui va se passer.
console.log(`PR #${number} prête : ${state.url}`);
console.log("Les checks quality et flow-guard doivent passer ; le merge se fera automatiquement.");
