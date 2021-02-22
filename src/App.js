import { runGitCommand } from './utils/command'
import Repository from './models/repository'

const repos = new Repository("/home/brunotrindade/NovosReps/Java/vertx")

console.log("TESTE")

repos.loadMergesData(false)

console.log("total = " + repos.merges.length)
let cont = 0
repos.merges.forEach(merge => {
    cont += 1
    console.log("merge = ", cont)
    if(!merge.isFastForward/* && merge.commit.hash.startsWith("734ab7")*/) {
        merge.loadAttributes(true, true, true, true, true, true)
        console.log(`[${merge.commit.hash.substring(0, 6)}] Merge explored`)
    }
    else
        console.log(`[${merge.commit.hash.substring(0, 6)}] Merge fast forward`)
})

repos.merges.forEach(merge => {
    if(!merge.isFastForward)
        console.log(`${merge.commit.hash};${merge.commit.timestamp.toUTCString()};${merge.branchingTime.toFixed(7)};${merge.mergeTime.toFixed(7)};${merge.committers[0].length};${merge.committers[1].length};${merge.diffCommitterCount};${merge.sameCommitterCount};${merge.committersIntersection};${merge.commits[0]};${merge.commits[1]};${merge.changedFiles[0].length};${merge.changedFiles[1].length};${merge.changedFilesIntersection};${merge.conflict ? "YES" : "NO"};${merge.conflictedFiles.length};${merge.chunks};${merge.modifiedChunks}`)
})

let total = 0, modified = 0, nullTotal = 0, selfConflicts = 0, authors = {}
repos.merges.forEach(merge => {
    if(merge.conflict == true) {

        console.log(`${merge.commit.hash};${merge.conflictedFiles.length};${merge.modifiedChunks};${merge.chunks};${merge.selfConflicts}`)
        merge.conflictedFiles.forEach(file => {
            total += file.chunks.length
            file.chunks.forEach(chunk => {
                if(chunk['authors'][0] == null) 
                    nullTotal ++
                if(chunk['authors'][1] == null)
                    nullTotal ++

                if(chunk['authors'][0] == chunk['authors'][1]) {
                    selfConflicts ++
                    
                    if(chunk['authors'][0] in authors) {
                        authors[chunk['authors'][0]].conflicts += 2
                        authors[chunk['authors'][0]].selfConflicts ++
                    }
                    else {
                        authors[chunk['authors'][0]] = {
                            name: chunk['authors'][0],
                            conflicts: 2,
                            selfConflicts: 1
                        }
                    }
                }
                else {
                    for(let i = 0; i < 2; i++) 
                        if(chunk['authors'][i] in authors)
                            authors[chunk['authors'][i]].conflicts ++
                        else {
                            authors[chunk['authors'][i]] = {
                                name: chunk['authors'][i],
                                conflicts: 1,
                                selfConflicts: 0
                            }
                        }
                }
            })
        })
    }
})

console.log("TOTAL DE CHUNKS = " + total)
console.log("TOTAL DE NULL = " + nullTotal)
console.log("TOTAL DE SELF CONFLICTS = " + selfConflicts)
console.log("\n\n")

for (var name of Object.keys(authors)) {
    const author = authors[name]
    console.log(`${author.name};${author.conflicts};${author.selfConflicts}`)
}

/*repos.merges.forEach((merge) => {

    console.log(merge)
    console.log(merge.committers[0])
    console.log(merge.committers[1])
    console.log(merge.changedFiles[0]);
    console.log(merge.changedFiles[1]);
})*/