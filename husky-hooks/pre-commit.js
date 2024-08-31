const isCJS = typeof module !== 'undefined' && module.exports;

console.log(`\n\x1b[33mExecuting pre-commit hook under ${isCJS ? 'CommonJS' : 'ESCMAcript'}\n`);

let fs ;
let childProcessExec;
let util;

async function loadModules() {

  if (isCJS) {
      fs = require('fs');
      childProcessExec = require("child_process").exec;
      util = require("util");
      return;
  };

  fs = await import('fs').then(module => module.default);
  childProcessExec = await import("child_process").then(module => module.default.exec);
  util = await import('util').then(module => module.default);

}

const validatePreCommit = async () => {
  await loadModules();

  const exec = util.promisify(childProcessExec);

  const staggedFiles = await exec("git diff --cached --name-only");

  const ignoredHooks = ["commit-msg.js", "pre-commit.js", "pre-push.js"]

  const staggedFilesWithJsOrTs = staggedFiles.stdout
    .split("\n")
    .filter((staggedFiles) => !ignoredHooks.some((ignoredHook) => staggedFiles.includes(ignoredHook)))
    .filter(
      (staggedFile) =>
        staggedFile.endsWith(".js") || staggedFile.endsWith(".ts") || staggedFile.endsWith(".jsx") || staggedFile.endsWith(".tsx") 
    );

  staggedFilesWithJsOrTs.forEach((staggedFile) => {
    const readFile = fs.readFileSync(staggedFile, "utf8").trim();

    if (readFile.includes("console.log")) {
      console.log(
        `\n\x1b[31mCOMMIT REJECTED!  Found console references in ${staggedFile}. Please remove them before committing.\n`
      );
      process.exit(1);
    }

    if (readFile.includes("debugger")) {
      console.log(
        `\n\x1b[31mCOMMIT REJECTED!  Found debugger references in ${staggedFile}. Please remove them before committing.\n`
      );
      process.exit(1);
    }
  });

  console.log("\n\x1b[32mNo console. or debugger references found!\n");
  console.log("\n\x1b[32mGit pre-commit hook was successful!\n");

  process.exit(0);
};

validatePreCommit();
