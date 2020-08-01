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
        var response
        try {
            response = execSync("git " + command, { cwd: this.dir }).toString("utf8")
        }
        catch(e) {
            console.error("/==================/ ERRO /==================/");
            console.error(e.output.toString("utf8"))
            console.error("/============================================/")
            response = e.output.toString("utf8").substring(1)
        }
        return response.substring(0, response.lastIndexOf("\n"))
    }
    
    runGitCommandArray(command) {
        return this.runGitCommand(command).split("\n")
    }

    loadMergesData() {
        const self = this
        this.merges = this.merges.map((merge) => {
            return new Merge(self, merge)
        })
    }
}

export default Repository