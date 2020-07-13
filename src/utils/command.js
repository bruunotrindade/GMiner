const { execSync } = require("child_process");

function runGitCommand(dir, command) {
    try {
        return execSync("git " + command, { cwd: dir }).toString("utf8")
    }
    catch(e) {
        //console.log(e)
        return ""
    }
}

function runGitCommandArray(dir, command) {
    return runGitCommand(dir, command).split("\n")
}

export { runGitCommand, runGitCommandArray }