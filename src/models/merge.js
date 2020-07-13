import { runGitCommand, runGitCommandArray } from "../utils/command"

class Merge {
    Merge(repos, hash) {
        const loadParents = () => repos.runGitCommand(`log --pretty=%P -n 1 ${hash}`).split(" ")
        const loadBase = () => repos.runGitCommand(`merge-base ${this.parents[0]} ${this.parents[1]}`)
        const loadTimestamp = () => new Date(repos.runGitCommand(`log -1 --pretty=format:%ci ${hash}`))
        const loadCommitters = (branch) => { 
            repos.runGitCommandArray(`log --no-merges --pretty='%an\%ae' ${this.base}..${this.parents[branch]}`).map((line) => {
                const str = line.split("\\")
                return new Committer(str[0], str[1])
            })
        }
        
        this.hash = hash
        this.parents = loadParents()
        this.base = loadBase()
        this.timestamp = loadTimestamp()
        this.committers = [loadCommitters(0), loadCommitters(1)]
    }

    loadAttributes() {
        
    }
}