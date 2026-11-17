// npm run release: publish what is on dev to the live site.
//
// Merges dev into main and pushes main, which starts the "Deploy to cPanel"
// workflow (.github/workflows/deploy-cpanel.yml). The same thing can be done
// on GitHub with a pull request from dev to main; this is the no-browser way.
// Ends back on dev, ready for the next change.
import { execSync } from "node:child_process";

const git = (args, opts = {}) => execSync(`git ${args}`, { encoding: "utf8", stdio: opts.show ? "inherit" : "pipe" })?.trim();
const step = (msg) => console.log(`\n> ${msg}`);
const stop = (msg) => {
  console.error(`\nRelease stopped: ${msg}`);
  process.exit(1);
};

// 1. Only release committed, pushed work from dev, so main gets exactly what
//    was reviewed on the GitHub Pages preview.
if (git("rev-parse --abbrev-ref HEAD") !== "dev") stop('switch to the dev branch first ("git checkout dev").');
if (git("status --porcelain")) stop("you have uncommitted changes. Commit and push them to dev, review the preview, then release.");

step("Fetching the latest from GitHub");
git("fetch origin", { show: true });
const local = git("rev-parse dev");
const remote = git("rev-parse origin/dev");
if (local !== remote) stop('dev is not in sync with GitHub. Run "git pull" and "git push" on dev, review the preview, then release.');

const pending = git("log --oneline origin/main..dev");
if (!pending) {
  console.log("\nNothing to release: main already has everything on dev.");
  process.exit(0);
}
console.log(`\nGoing live with:\n${pending}`);

// 2. Bring main up to date and merge dev into it.
step("Updating main");
git("checkout main", { show: true });
try {
  git("pull --ff-only origin main", { show: true });
  step("Merging dev into main");
  try {
    git("merge --ff-only dev", { show: true });
  } catch {
    // main has commits dev does not (e.g. an edit made on GitHub): use a merge commit.
    try {
      git('merge --no-edit -m "Release dev to main" dev', { show: true });
    } catch {
      git("merge --abort");
      stop('dev and main conflict. Nothing was pushed. Run "git merge main" on dev, fix the conflicts, push dev, then release again.');
    }
  }

  // 3. Push main: GitHub Actions builds and uploads to cPanel.
  step("Pushing main (starts the live deploy)");
  git("push origin main", { show: true });
} finally {
  git("checkout dev");
}

console.log(`
Done. The live deploy is running:
  https://github.com/Codendesign-dev/finaze/actions/workflows/deploy-cpanel.yml
It usually finishes in 1-3 minutes. You are back on dev.`);
