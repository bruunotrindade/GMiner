const { execSync } = require("child_process");
import Merge from '../models/merge';

class Repository {

    constructor(dir, date=null)  {
        const valid = !this.runGitCommand("status").startsWith("fatal"), self = this
        if(!valid)
            throw new Error("Invalid repository")

        const loadMerges = function() {
            const cmd = "log --all --merges --pretty=%H" + (date ? `--before='${date}'` : '')
            return self.runGitCommandArray(cmd)
        }

        this.name = dir.substring(dir.length, dir.lastIndexOf("/")+1)
        this.dir = dir
        this.merges = loadMerges()
    }
    
    runGitCommand(command) {
        try {
            var response = execSync("git " + command, { cwd: this.dir }).toString("utf8")
            return response.substring(0, response.lastIndexOf("\n"))
        }
        catch(e) {
            console.error(e);
            return ""
        }
    }
    
    runGitCommandArray(command) {
        return this.runGitCommand(command).split("\n")
    }

    loadMergesData() {
        const self = this
        this.merges = ["84bd000d025591c07daa8845db0605c7ec80fe47"].map((merge) => {
            return new Merge(self, merge)
        })
    }
}

export default Repository