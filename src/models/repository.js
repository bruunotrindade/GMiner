import { execSync } from "child_process"
import Merge from './/merge.js';
import { secondsToDays } from '../utils/time.js'

class Repository {

    constructor(dir, date=null)  {
        const valid = !this.runGitCommand("status").startsWith("fatal"), self = this
        if(!valid)
            throw new Error("Invalid repository")

        const loadMerges = function(date=null) {
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

    loadMergesData(initialize=true, conflictHashes=null) {
        const self = this
        this.merges = this.merges.map((merge) => {
            return new Merge(self, merge, initialize)
        })

        if(conflictHashes) {
            this.merges.forEach((merge) => {
                const HASH = conflictHashes[merge.commit.hash]
                if(HASH)
                    merge.conflict = true
                else
                    merge.conflict = false
            })
        }
    }

    buildAuthorsData() {
        const self = this
        this.authors = {}
        this.merges.forEach(merge => {
            if(merge.conflict == true) {
                merge.conflictedFiles.forEach(file => {
                    file.chunks.forEach(chunk => {
                        if(chunk['authors'][0] == chunk['authors'][1] && chunk['authors'][0]) {

                            const authorName = chunk['authors'][0]

                            if(authorName in self.authors) {
                                self.authors[authorName].conflicts += 2
                                self.authors[authorName].selfConflicts ++
                                if(merge.author == authorName)
                                    self.authors[authorName].author ++

                            }
                            else {
                                self.authors[authorName] = {
                                    name: authorName,
                                    conflicts: 2,
                                    selfConflicts: 1,
                                    author: merge.author == authorName ? 1 : 0,
                                    selfConflictsOccurrenceAvg: 0,
                                    lastSelfConflictToMergeAvg: 0
                                }
                            }
                            self.authors[authorName].selfConflictsOccurrenceAvg += secondsToDays(
                                Math.abs(chunk['commits'][0].unixTime - chunk['commits'][1].unixTime))

                            let max = Math.max(chunk['commits'][0].unixTime, chunk['commits'][1].unixTime)
                            self.authors[authorName].lastSelfConflictToMergeAvg += secondsToDays(
                                merge.commit.unixTime - max)
                        }
                        else {
                            for(let i = 0; i < 2; i++) 
                                if(chunk['authors'][i] in self.authors)
                                    self.authors[chunk['authors'][i]].conflicts ++
                                else {
                                    self.authors[chunk['authors'][i]] = {
                                        name: chunk['authors'][i],
                                        conflicts: 1,
                                        selfConflicts: 0,
                                        author: 0,
                                        selfConflictsOccurrenceAvg: 0,
                                        lastSelfConflictToMergeAvg: 0
                                    }
                                }
                        }
                    })
                })
            }
        })

        for (var name of Object.keys(this.authors)) {
            const author = this.authors[name]
            if(author.selfConflicts > 0) {
                this.authors[name].selfConflictsOccurrenceAvg = author.selfConflictsOccurrenceAvg / author.selfConflicts
                this.authors[name].lastSelfConflictToMergeAvg = author.lastSelfConflictToMergeAvg / author.selfConflicts
            }
        }
    }

    getCommitAuthor(hash) {
        return this.runGitCommand(`log --pretty=format:%an -1 ${hash}`)
    }
}

export default Repository