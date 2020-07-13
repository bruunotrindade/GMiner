const { execSync } = require("child_process");

class Repository {

    Repository(dir, date=null)  {
        const valid = !this.runGitCommand("status").startsWith("fatal")
        if(!valid)
            throw new Error("Invalid repository")

        const loadMerges = function() {
            const cmd = "log --all --merges --pretty=%H" + (date ? `--before='${date}'` : '')
            return runGitCommandArray(cmd)
        }

        this.name = dir.substring(dir.length, dir.lastIndexOf("/")+1)
        this.dir = dir
        this.merges = loadMerges()
    }
    
    runGitCommand(command) {
        try {
            return execSync("git " + command, { cwd: this.dir }).toString("utf8")
        }
        catch(e) {
            return ""
        }
    }
    
    runGitCommandArray(command) {
        return runGitCommand(this.dir, command).split("\n")
    }
}

export default Repository