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
            response = execSync("git " + command, { cwd: this.dir, stdio: 'pipe' }).toString("utf8")
        }
        catch(e) {
            /*console.error("/==================/ ERRO /==================/");
            console.error(e.output.toString("utf8"))
            console.error("/============================================/")*/
            response = e.output.toString("utf8").substring(1)
        }
        const last = response.lastIndexOf("\n")
        return response.substring(0, last == -1 ? response.length : last)
    }
    
    runGitCommandArray(command) {
        return this.runGitCommand(command).split("\n")
    }

    loadMergesData(initialize=true) {
        const self = this
        this.merges = this.merges.slice(1040, 1080).map((merge) => {
            return new Merge(self, merge, initialize)
        })
        //this.merges = [new Merge(self, "916d068e9c358c0d1cde10872d81f84969854f51")]
    }

    getCommitAuthor(hash) {
        return this.runGitCommand(`log --pretty=format:%an -1 ${hash}`)
    }
}

export default Repository