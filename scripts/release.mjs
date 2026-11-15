// Ce script gère la mise en production.
//
// Deux commandes l'utilisent :
// - "npm run release"       : prépare la PR dev -> main et vérifie tout.
// - "npm run release:merge" : après approbation, merge, attend le deploy et vérifie le site.
//
// Il utilise GitHub CLI ("gh"), donc il faut avoir fait "gh auth login" une fois.
// Aucun token supplémentaire n'est stocké dans le projet.

// "execFileSync" lance une commande externe et attend qu'elle se termine.
import { execFileSync } from "node:child_process";

// Adresse du site public vérifiée à la fin du déploiement.
const SITE_URL = "https://rayague.github.io/mon-site-webgl/";

// Checks obligatoires définis dans la protection de la branche main.
const REQUIRED_CHECKS = ["quality", "flow-guard"];

// Si le script est lancé avec "--merge", on est en mode merge.
// Sinon, on est en mode préparation de la release.
const MODE = process.argv.includes("--merge") ? "merge" : "prepare";

// "run" lance une commande et récupère sa sortie texte.
const run = (cmd, args) =>
  execFileSync(cmd, args, { encoding: "utf8" });

// "runInherit" lance une commande en affichant sa sortie dans le terminal.
// C'est utile pour les commandes longues, comme les checks ou le deploy.
const runInherit = (cmd, args) =>
  execFileSync(cmd, args, { stdio: "inherit" });

// "runNpm" lance une commande npm de façon compatible avec Windows et macOS/Linux.
// Sous Windows, on passe par cmd.exe car npm est un fichier .cmd.
const runNpm = (args) => {
  if (process.platform === "win32") {
    runInherit("cmd.exe", ["/c", "npm", ...args]);
  } else {
    runInherit("npm", args);
  }
};

// "fail" affiche un message clair et arrête le script avec une erreur.
const fail = (message) => {
  console.error(message);
  process.exit(1);
};

// Petite pause utilisée pour attendre GitHub entre deux vérifications.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Même pause, mais en version synchrone pour les fonctions qui ne sont pas async.
const sleepSync = (ms) =>
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

// Vérifie que GitHub CLI est installé et connecté.
const checkGh = () => {
  try {
    execFileSync("gh", ["--version"], { stdio: "ignore" });
  } catch {
    fail("GitHub CLI (gh) n'est pas installé. Installe-le puis lance : gh auth login");
  }

  try {
    execFileSync("gh", ["auth", "status"], { stdio: "ignore" });
  } catch {
    fail("GitHub CLI n'est pas authentifié. Lance : gh auth login");
  }
};

// Cherche une PR ouverte qui part de "dev" vers "main".
// C'est la PR de mise en production.
const findOpenReleasePr = () => {
  const raw = run("gh", [
    "pr", "list",
    "--base", "main",
    "--head", "dev",
    "--state", "open",
    "--json", "number,url,reviewDecision,mergeStateStatus"
  ]);
  return JSON.parse(raw);
};

// Lit les informations complètes d'une PR.
// "headRefOid" est le commit exact de la branche dev au moment de la lecture.
// On s'en sert pour éviter de merger un commit différent de celui qui a été approuvé.
const viewPr = (number) => JSON.parse(run("gh", [
  "pr", "view", String(number),
  "--json", "number,url,reviewDecision,mergeStateStatus,mergeable,headRefOid,mergeCommit,state"
]));

// Vérifie que les checks obligatoires sont bien présents et réussis.
// Juste après la création d'une PR, "gh pr checks" peut ne voir que le run "push"
// et pas encore le run "pull_request". On attend donc explicitement flow-guard.
const waitRequiredChecks = (number) => {
  const deadline = Date.now() + 120000;

  while (Date.now() < deadline) {
    const raw = run("gh", [
      "pr", "view", String(number),
      "--json", "statusCheckRollup"
    ]);
    const checks = JSON.parse(raw).statusCheckRollup || [];
    const missing = [];
    const failed = [];

    for (const name of REQUIRED_CHECKS) {
      const runs = checks.filter((check) => (check.name || check.context) === name);
      const stateOf = (check) => check.conclusion || check.state;

      if (runs.some((check) => stateOf(check) === "SUCCESS")) continue;

      if (runs.some((check) => [
        "FAILURE", "CANCELLED", "TIMED_OUT", "ACTION_REQUIRED", "STARTUP_FAILURE"
      ].includes(stateOf(check)))) {
        failed.push(name);
      } else {
        missing.push(name);
      }
    }

    if (failed.length > 0) {
      fail(`Check(s) en échec sur la PR #${number} : ${failed.join(", ")}. Détail : gh pr checks ${number}`);
    }

    if (missing.length === 0) return;

    console.log(`En attente des checks obligatoires : ${missing.join(", ")}...`);
    sleepSync(5000);
  }

  fail(`Les checks obligatoires de la PR #${number} ne sont pas apparus. Détail : gh pr checks ${number}`);
};

// Attend la fin des checks GitHub.
// "gh pr checks --watch" reste actif jusqu'à ce que quality et flow-guard soient terminés.
const waitChecks = (number) => {
  try {
    runInherit("gh", ["pr", "checks", String(number), "--watch"]);
  } catch {
    console.error(`Les checks de la PR #${number} ont échoué.`);
    console.error(`Détail : gh pr checks ${number}`);
    process.exit(1);
  }

  waitRequiredChecks(number);
};

// Si main a avancé, GitHub peut demander de mettre dev à jour.
// On tente la mise à jour, puis on attend les nouveaux checks.
const ensureUpToDate = (number) => {
  let pr = viewPr(number);

  if (pr.mergeStateStatus === "BEHIND") {
    console.log("La branche dev est en retard sur main. Mise à jour...");

    try {
      runInherit("gh", ["pr", "update-branch", String(number)]);
    } catch {
      fail("Impossible de mettre à jour dev. Vérifie la protection de la branche dev.");
    }

    waitChecks(number);
    pr = viewPr(number);
  }

  return pr;
};

// Attend qu'un workflow soit créé pour le commit de merge sur main.
// GitHub peut mettre quelques secondes à enregistrer le nouveau workflow.
const waitForRun = async (sha) => {
  for (let attempt = 0; attempt < 60; attempt++) {
    const raw = run("gh", [
      "run", "list",
      "--branch", "main",
      "--limit", "20",
      "--json", "databaseId,headSha,workflowName,status,conclusion,url"
    ]);

    const runs = JSON.parse(raw);
    const match = runs.find((item) => item.headSha === sha && item.workflowName === "Pipeline");

    if (match) return match.databaseId;

    await sleep(1000);
  }

  fail("Aucun workflow trouvé pour le commit de merge sur main.");
};

// Prépare la release : vérifie dev, crée la PR dev -> main, attend les checks,
// puis indique s'il reste l'approbation ou si tout est prêt à être mergé.
const prepareRelease = async () => {
  const branch = run("git", ["rev-parse", "--abbrev-ref", "HEAD"]).trim();

  if (branch !== "dev") {
    fail("Place-toi sur la branche dev avant de lancer la release : git switch dev");
  }

  const dirty = run("git", ["status", "--porcelain"]).trim();
  if (dirty) {
    fail("Des modifications ne sont pas commitées. Commit d'abord.");
  }

  checkGh();

  console.log("Mise à jour de dev...");
  try {
    runInherit("git", ["pull", "--ff-only"]);
  } catch {
    fail("Impossible de mettre à jour dev. Vérifie que ta branche locale est propre.");
  }

  console.log("Vérification locale (npm run ci)...");
  try {
    runNpm(["run", "ci"]);
  } catch {
    fail("La vérification locale a échoué. Corrige les erreurs avant de relancer la release.");
  }

  // Récupère les dernières informations de main et dev sans modifier le code local.
  runInherit("git", ["fetch", "origin", "dev", "main"]);

  const ahead = Number(run("git", ["rev-list", "--count", "origin/main..origin/dev"]).trim());

  if (ahead === 0) {
    console.log("Rien à publier : dev est déjà identique à main.");
    process.exit(0);
  }

  let prs = findOpenReleasePr();

  if (prs.length === 0) {
    const date = new Date().toISOString().slice(0, 10);
    const commits = run("git", ["log", "--oneline", "origin/main..origin/dev"]).trim();
    const diff = run("git", ["diff", "--stat", "origin/main..origin/dev"]).trim();

    const body = [
      "## Résumé",
      `Release du ${date}.`,
      "",
      "## Commits",
      commits,
      "",
      "## Fichiers modifiés",
      diff,
      "",
      "## Tests",
      "- `npm run ci` OK",
      "- `quality` et `flow-guard` vérifiés par GitHub Actions",
      "",
      "## Déploiement",
      "Le merge dans `main` déclenche `deploy` sur GitHub Pages."
    ].join("\n");

    console.log("Création de la PR dev -> main...");

    try {
      runInherit("gh", [
        "pr", "create",
        "--base", "main",
        "--head", "dev",
        "--title", `release: ${date}`,
        "--body", body
      ]);
    } catch {
      fail("Impossible de créer la PR de release. Vérifie qu'il y a des commits à publier.");
    }

    prs = findOpenReleasePr();
  }

  if (prs.length === 0) {
    fail("PR de release introuvable après création.");
  }

  const number = String(prs[0].number);
  const url = prs[0].url;

  console.log(`PR #${number} : ${url}`);
  waitChecks(number);

  const pr = ensureUpToDate(number);

  if (pr.reviewDecision === "APPROVED") {
    console.log("Tout est bon. L'approbation est déjà présente.");
    console.log("Lance maintenant : npm run release:merge");
    process.exit(0);
  }

  if (pr.reviewDecision === "CHANGES_REQUESTED") {
    fail("Des changements ont été demandés sur la PR. Corrige-les, puis relance npm run release.");
  }

  console.log("Tout est bon.");
  console.log("Il reste 1 approbation.");
  console.log("Demande à Elvis ou Bethsaida, depuis son compte :");
  console.log(`  gh pr review ${number} --approve`);
  console.log("Ensuite, lance :");
  console.log("  npm run release:merge");
};

// Merge la release après approbation, attend le déploiement et vérifie le site.
const mergeRelease = async () => {
  checkGh();

  const prs = findOpenReleasePr();

  if (prs.length === 0) {
    fail("Aucune PR dev -> main ouverte. Lance d'abord : npm run release");
  }

  const number = String(prs[0].number);
  const url = prs[0].url;

  console.log(`PR #${number} : ${url}`);
  waitChecks(number);

  const pr = ensureUpToDate(number);

  if (pr.reviewDecision !== "APPROVED") {
    console.error("Il manque encore l'approbation d'une autre personne.");
    console.error(`  gh pr review ${number} --approve`);
    process.exit(1);
  }

  if (pr.mergeStateStatus === "DIRTY") {
    fail("La PR a un conflit avec main. Il faut résoudre le conflit avant de merger.");
  }

  if (pr.mergeStateStatus === "BLOCKED") {
    fail("Le merge est bloqué par une protection GitHub. Vérifie les checks et les conversations.");
  }

  console.log("Merge de la PR en merge commit...");

  try {
    runInherit("gh", [
      "pr", "merge", number,
      "--merge",
      "--match-head-commit", pr.headRefOid
    ]);
  } catch {
    fail("Le merge a échoué. Vérifie l'état de la PR sur GitHub.");
  }

  // Attend que GitHub marque la PR comme mergée.
  let merged = viewPr(number);
  for (let attempt = 0; attempt < 30 && merged.state !== "MERGED"; attempt++) {
    await sleep(1000);
    merged = viewPr(number);
  }

  if (merged.state !== "MERGED") {
    fail("La PR n'est pas encore marquée comme mergée. Vérifie sur GitHub.");
  }

  const mergeCommit = merged.mergeCommit?.oid;
  if (!mergeCommit) {
    fail("Merge commit introuvable après le merge.");
  }

  console.log(`Merge effectué : ${mergeCommit}`);
  console.log("Recherche du déploiement sur main...");

  const runId = await waitForRun(mergeCommit);

  console.log(`Suivi du workflow : gh run watch ${runId} --exit-status`);

  try {
    runInherit("gh", ["run", "watch", String(runId), "--exit-status"]);
  } catch {
    console.error(`Le déploiement a échoué. Détail : gh run view ${runId} --log-failed`);
    process.exit(1);
  }

  console.log("Déploiement terminé. Vérification du site...");

  let response;
  try {
    response = await fetch(SITE_URL);
  } catch {
    fail(`Impossible de contacter le site : ${SITE_URL}`);
  }

  if (!response.ok) {
    fail(`Le site répond avec le statut ${response.status}.`);
  }

  console.log(`Site OK (${response.status}) : ${SITE_URL}`);
  console.log(`Commit déployé : ${mergeCommit}`);
};

// Point d'entrée : on choisit le mode demandé par la commande npm.
if (MODE === "merge") {
  await mergeRelease();
} else {
  await prepareRelease();
}
