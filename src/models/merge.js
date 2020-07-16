import Committer from '../models/committer'
import ChangedFile from '../models/changedFile'

class Merge {
    constructor(repos, hash) {
        const loadParents = () => repos.runGitCommand(`log --pretty=%P -n 1 ${hash}`).split(" ")
        const loadBase = () => repos.runGitCommand(`merge-base ${this.parents[0]} ${this.parents[1]}`)
        const loadTimestamp = () => new Date(repos.runGitCommand(`log -1 --pretty=format:%ci ${hash}`))
        const loadCommitters = (branch) => { 
            var committers = []
            repos.runGitCommandArray(`log --no-merges --pretty='%an\\%ae' ${this.base}..${this.parents[branch]}`).forEach((line) => {
                const str = line.split("\\")
                if(!committers.find((el) => { return el.email == str[1] || el.name == str[0] }))
                    committers.push(new Committer(str[0], str[1]))
            })
            return committers
        }
        const loadChangedFiles = (branch) => {
            const lines = repos.runGitCommandArray(`log --stat --oneline --reverse ${this.base}..${this.parents[branch]}`)

            // Filtering all statistic lines and removing repeated lines
            var fileLines = new Set(lines.filter((line) => {
                return line.startsWith(' ') && !line.includes("changed")
            }).map((line) => {
                return line.split(" | ")[0].trim()
            }))
        
            // Generating ChangedFiles and dealing with renamed files
            var changedFiles = []
            fileLines.forEach((line) => {
                // File without rename
                if(!line.includes(" => "))    
                    changedFiles.push(new ChangedFile(line))
                else {

                    // Regex to deal with "dir/{old_name => new_name}" or "old_name => new_name"
                    var arrowPart = line.match(/(\w*\-*\.*\/?)* => (\w*\-*\.*\/?)*/)

                    const files = arrowPart[0].split(" => ")
                    var oldName = files[0], newName = files[1]

                    if(line.includes("{")) {
                        var dir = line.trim().split("{")[0]
                        oldName = dir + oldName
                        newName = dir + newName
                    }

                    // Searching for file with old name
                    var file = changedFiles.find((file) => { return file.fullName === oldName })
                    if(file)
                        file.changeName(newName)
                    else 
                        changedFiles.push(new ChangedFile(newName, [ oldName ]))
                }
            })
            return changedFiles
        }
        
        this.hash = hash
        this.parents = loadParents()
        this.base = loadBase()
        this.timestamp = loadTimestamp()
        this.committers = [loadCommitters(0), loadCommitters(1)]
        this.changedFiles = [loadChangedFiles(0), loadChangedFiles(1)]
    }

    loadAttributes() {
        
    }
}

export default Merge