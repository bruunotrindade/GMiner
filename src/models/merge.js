import Committer from '../models/committer'
import File from './file'
import Commit from './commit'
import { secondsToDays } from '../utils/time'

const MERGE_DIDNT_DONE = "redoMerge() must be ran before using this method.";
const CONFLICT_TAGS = ["<<<<<<<", "=======", ">>>>>>>"]

class Merge {

    constructor(repos, hash) {
        const loadParents = () => {
            const hashes = repos.runGitCommand(`log --pretty=%P -n 1 ${hash}`).split(" ")
            return [new Commit(repos, hashes[0], true), new Commit(repos, hashes[1], true)]
        }
        const loadBase = () => {
            const baseHash = repos.runGitCommand(`merge-base ${this.parents[0].hash} ${this.parents[1].hash}`)
            return new Commit(repos, baseHash, true)
        }
        
        this.commit = new Commit(repos, hash, true)
        this.repos = repos
        this.parents = loadParents()
        this.base = loadBase()

        this.isFastForward = (this.base.hash == this.parents[0].hash || this.base.hash == this.parents[1].hash)
    }

    loadAttributes(timestamp=false, commits=false, committers=false, changedFiles=false, branchingTime=false, mergeTime=false) {
        const self = this
        
        const loadTimestamp = () => new Date(this.repos.runGitCommand(`log -1 --pretty=format:%ci ${this.commit.hash}`))
        const loadCommitters = (branch) => { 
            var committers = []
            self.repos.runGitCommandArray(`log --no-merges --pretty='%an\\%ae' ${this.base.hash}..${this.parents[branch].hash}`).forEach((line) => {
                const str = line.split("\\")
                if(!committers.find((el) => { return el.email == str[1] || el.name == str[0] }))
                    committers.push(new Committer(str[0], str[1]))
            })
            return committers
        }
        const loadChangedFiles = (branch) => {
            const lines = self.repos.runGitCommandArray(`log --stat --oneline --reverse ${this.base.hash}..${this.parents[branch].hash}`)

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
                    changedFiles.push(new File(line))
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

        const loadBranchingTime = () => {
            const commitsAfterBase = [this.getAfterBaseCommit(0), this.getAfterBaseCommit(1)]

            const beginTime = Math.min(commitsAfterBase[0].unixTime, commitsAfterBase[1].unixTime)
            const endTime = Math.max(this.parents[0].unixTime, this.parents[1].unixTime)

            return secondsToDays(endTime-beginTime)
        }

        const loadMergeTime = () => {
            return secondsToDays(this.commit.unixTime-this.base.unixTime)
        }

        const loadCommitsTotal = (branch) => this.repos.runGitCommand(`rev-list --count ${this.base.hash}..${this.parents[branch].hash}`)

        // If timestamp must be loaded
        this.timestamp = timestamp ? loadTimestamp() : null

        // If committers must be loaded
        if(committers) {
            this.committers = [loadCommitters(0), loadCommitters(1)]

            // Comparing and checking committers intersection
            const checkCommittersIntersection = () => {
                var sameCount = 0
                this.committers[0].forEach((committer) => {
                    const sameCommitter = this.committers[1].find((same) => { return same.name == committer.name || same.email == committer.email })
    
                    if(sameCommitter)
                        sameCount += 1
                })
                if(sameCount == this.committers[0].length || sameCount == this.committers[1].length)
                    return "ALL"
                else if(sameCount == 0)
                    return "NONE"
                else
                    return "SOME"
            }
            this.committersIntersection = checkCommittersIntersection()
        }
        
        // If changed files must be loaded
        if(changedFiles) {
            this.changedFiles = changedFiles ? [loadChangedFiles(0), loadChangedFiles(1)] : null
            
            // Comparing and checking changed files intersection
            const checkChangedFilesIntersection = () => {
                var sameCount = 0
                this.changedFiles[0].forEach((changedFile) => {
                    const sameFile = this.changedFiles[1].find((same) => {
                        return same.fullName == changedFile.fullName || same.oldNames.includes(changedFile.fullName)
                    })

                    if(sameFile)
                        sameCount += 1
                })
                if(sameCount == this.changedFiles[0].length || sameCount == this.changedFiles[1].length)
                    return "ALL"
                else if(sameCount == 0)
                    return "NONE"
                else
                    return "SOME"
            }
            this.changedFilesIntersection = checkChangedFilesIntersection()
        }

        // If branching time must be loaded
        this.branchingTime = branchingTime ? loadBranchingTime() : null

        // If merge time must be loaded
        this.mergeTime = mergeTime ? loadMergeTime() : null

        // If commits numbers must be loaded
        this.commits = commits ? [loadCommitsTotal(0), loadCommitsTotal(1)] : null


        this.redoMerge(true)
    }

    redoMerge(chunks=false) {
        this.repos.runGitCommand("reset --hard")
        this.repos.runGitCommand(`checkout -f ${this.parents[0].hash}`)

        const mergeResponse = this.repos.runGitCommandArray(`merge --no-commit ${this.parents[1].hash}`)
        // Cleaning untracked files
        this.repos.runGitCommand("clean -df")

        this.conflict = false
        this.conflictedFiles = []
        // If merge caused conflict
        if(mergeResponse[mergeResponse.length-1].startsWith("Automatic merge failed;")) {
            this.conflict = true
            //console.log(mergeResponse);
            mergeResponse.forEach((line) => {

                // [add/add or content] conflict message
                if(line.includes("Merge conflict in")) {
                    const filename = line.split("Merge conflict in ")[1]
                    const file = new File(filename)
                    file.conflictType = "UPDATE"
                    this.conflictedFiles.push(file)
                }
                // [modify/delete] conflict message
                else if(line.includes("(modify/delete)")) {
                    const filename = line.match(/(?<!:)(\w*\-*\.*\/?)*(?= deleted)/)[0]
                    const file = new File(filename)
                    file.conflictType = "DELETE"
                    this.conflictedFiles.push(file)
                }
            })
        }

        if(chunks) {
            this.loadChunks();
            this.checkSelfConflict(0)
            this.checkSelfConflict(1)

            this.conflictedFiles.forEach(file => {
                console.log(`arquivo = ${file.fullName}`)
                console.log(file.chunks)
            })
        }
    }

    loadChunks() {
        if(this.conflict) {
            this.chunks = 0
            this.conflictedFiles.forEach(file => {
                file.chunks = []
                const diffLines = this.repos.runGitCommandArray(`diff ${file.fullName}`)
                let tagStatus = 0
                let chunk = {
                    "lines": [],
                    "authors": [null, null]
                }
                diffLines.forEach(line => {
                    if(line.replace(/\+/g, "").startsWith(CONFLICT_TAGS[0])) {
                        tagStatus = 1;
                    }
                    else if(line.replace(/\+/g, "").startsWith(CONFLICT_TAGS[2])) {
                        tagStatus = 0;
                        chunk['lines'].push(line)
                        file.chunks.push(chunk)
                        chunk = {
                            "lines": [],
                            "authors": [null, null]
                        }
                    }
                    
                    if(tagStatus == 1)
                        chunk['lines'].push(line)
                })
                this.chunks += file.chunks.length
                console.log(`${file.fullName} => ${file.chunks.length} chunks`)
            })
        }
        else if(this.conflict == null)
            throw MERGE_DIDNT_DONE
    }

    checkSelfConflict(branch) {
        if(this.conflict) {
            console.log(`VERIFICANDO BRANCH ${branch}`)
            this.conflictedFiles.forEach(file => {
                if(file.conflictType != "DELETE") {
                    const commitsModified = this.repos.runGitCommandArray(`log --pretty=format:%H ${this.base.hash}^..${this.parents[branch].hash} ${file.fullName}`)
                    commitsModified.forEach(hash => {
                        let tagStatus = -1
                        let chunkId = 0
                        if(file.fullName == "frontend/src/pages/publics/EmailValidation.js")
                            console.log(hash)
                        const diffLines = this.repos.runGitCommandArray(`diff ${hash} ${file.fullName}`)
                        diffLines.forEach((line, index) => {
                            if(file.fullName == "frontend/src/pages/publics/EmailValidation.js" && chunkId == 0 && (tagStatus == 0 || tagStatus == 1))
                                console.log(line)

                            for(let tagStatusI = 0; tagStatusI < 3; tagStatusI++)
                                if(line.startsWith("+" + CONFLICT_TAGS[tagStatusI])) {
                                    tagStatus = tagStatusI
                                    if(tagStatus == 2) {
                                        chunkId += 1
                                        tagStatus = -1
                                    }
                                    break;
                                }

                            if(chunkId < file.chunks.length) {
                                if(branch == tagStatus && !line.startsWith("+") && file.chunks[chunkId]['authors'][branch] == null) {
                                    file.chunks[chunkId]['authors'][branch] = this.repos.getCommitAuthor(hash)
                                    if(branch == 0) {
                                        //console.log(`linha ${index} = ${line}`)
                                        //console.log(`CHUNK ${chunkId} setado =>`, file.chunks[chunkId])
                                    }
                                }
                            }
                        })                            
                    })
                }
            })
        }
        else if(this.conflict == null)
            throw MERGE_DIDNT_DONE
    }


    getAfterBaseCommit(branch) {
        const parent = this.parents[branch].hash
        const commits = this.repos.runGitCommandArray(`rev-list --ancestry-path --reverse ${this.base.hash}..${parent}`)
        
        var afterBase = null
        commits.forEach((commit) => {
            afterBase = new Commit(this.repos, commit, true)
            
            if(afterBase.unixTime <= parent.unixTime && afterBase.unixTime > this.base.unixTime)
            return
        })
        return afterBase
	}
}

export default Merge