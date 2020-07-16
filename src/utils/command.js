const { execSync } = require("child_process");

function runGitCommand(dir, command) {
    try {
        var response = execSync("git " + command, { cwd: dir }).toString("utf8")
        console.log("CMD ==== ", command);
        if(response.endsWith("\n"))
            console.log("AAAAAAAAAAAAAAAAAH MANO", response.replace("\n", "$"))
        else
            console.log("ih mermao");
        return response.substring(0, response.lastIndexOf("\n"))
    }
    catch(e) {
        console.log(e)
        return ""
    }
}

function runGitCommandArray(dir, command) {
    return runGitCommand(dir, command).split("\n")
}

export { runGitCommand, runGitCommandArray }