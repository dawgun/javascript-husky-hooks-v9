const isCJS = typeof module !== 'undefined' && module.exports;

console.log(`\n\x1b[33mExecuting pre-push hook under ${isCJS ? 'CommonJS' : 'ESCMAcript'}\n`);

let childProcessExec
let util

async function loadModules() {
  if (isCJS) {
      childProcessExec = require("child_process").exec;
      util = require("util");
      return;
  }; 

  childProcessExec = await import("child_process").then(module => module.default.exec);
  util = await import('util').then(module => module.default);
}

const validatePrePush = async () => {
  await loadModules()

  const exec = util.promisify(childProcessExec);
  const branchesNames = await exec("git branch");

  const branchCheck = /^((hotfix|bugfix|feature)\/[a-zA-Z0-9\-]+)$/g;

  const cleanBranch = branchesNames.stdout
    .split("\n")
    .find((b) => b.trim().charAt(0) === "*")
    .trim()
    .substring(2);

  if (!branchCheck.test(cleanBranch)) {
    console.log("\n\x1b[31mPlease check your branch name.\n");
    process.exit(1);
  }

  console.log("\n\x1b[32mBranch name is correct\n");
  console.log("\n\x1b[32mBranch pushed succesfully\n");

  process.exit(0);
};

validatePrePush();
