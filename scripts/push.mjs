import { execFileSync } from "node:child_process";

const run = (cmd, args, options = {}) =>
  execFileSync(cmd, args, { encoding: "utf8", ...options });

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const branch = run("git", ["rev-parse", "--abbrev-ref", "HEAD"]).trim();

if (branch === "dev" || branch === "main") {
  fail("Branche protégée : crée une branche feature/* avant de pousser.");
}
if (!branch.startsWith("feature/")) {
  fail(`La branche "${branch}" n'est pas une branche feature/*.`);
}

const dirty = run("git", ["status", "--porcelain"]).trim();
if (dirty) {
  fail("Des modifications ne sont pas commitées. Commit d'abord.");
}

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

console.log(`Push de ${branch}...`);
execFileSync("git", ["push", "-u", "origin", "HEAD"], { stdio: "inherit" });

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

let prs = listPrs();
if (prs.length === 0) {
  console.log("Création de la pull request vers dev...");
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
  prs = listPrs();
}

if (prs.length === 0) {
  fail("PR introuvable après création.");
}

const number = String(prs[0].number);
const view = (fields) => JSON.parse(run("gh", ["pr", "view", number, "--json", fields]));

const state = view("mergeStateStatus,autoMergeRequest,url");
if (state.mergeStateStatus === "BEHIND") {
  console.log("Mise à jour de la branche avec dev...");
  try {
    execFileSync("gh", ["pr", "update-branch", number], { stdio: "inherit" });
  } catch {
    console.warn("Impossible de mettre à jour automatiquement la branche.");
  }
}

if (!state.autoMergeRequest) {
  console.log("Activation de l'auto-merge en squash...");
  execFileSync("gh", ["pr", "merge", number, "--auto", "--squash"], { stdio: "inherit" });
}

console.log(`PR #${number} prête : ${state.url}`);
console.log("Les checks quality et flow-guard doivent passer ; le merge se fera automatiquement.");
