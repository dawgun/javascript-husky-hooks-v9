const isCJS = typeof module !== 'undefined' && module.exports;

console.log(`\n\x1b[33mExecuting commit-msg hook under ${isCJS ? 'CommonJS' : 'ESCMAcript'}\n`);

let fs;

async function loadFsModule() {
    if (isCJS) {
        fs = require('fs');
        return;
    };

    fs = await import('fs').then(module => module.default);
}

async function validateCommitMessage() {
    await loadFsModule();

    const message = fs.readFileSync(process.argv[2], 'utf8').trim();
    const isValidLength = message.length >= 10 && message.length <= 72;

    if (!isValidLength) {
        console.error('\n\x1b[31m(ERROR) The length of the commit message must be between 10 and 72 characters.\n');
        process.exit(1);
    }

    console.log("\n\x1b[32mThe length of the commit text is correct.!\n");
    console.log("\n\x1b[32mGit commit-msg hook was successful!\n");

    process.exit(0);
}

validateCommitMessage();




