import { runGitCommand } from './utils/command'
import Repository from './models/repository'

const repos = new Repository("/home/brunotrindade/NovosReps/Java/vertx")

console.log("TESTE")

repos.loadMergesData()

console.log("total = " + repos.merges.length)
let cont = 0
repos.merges.forEach(merge => {
    cont += 1
    console.log("merge = ", cont)
    if(!merge.isFastForward/* && merge.commit.hash.startsWith("734ab7")*/) {
        merge.loadAttributes(true, true, true, true, true, true)
        //console.log(merge.base)
        //console.log(merge.parents)
        console.log(`[${merge.commit.hash.substring(0, 6)}] Merge explored`)
        //console.log(merge)
    }
    else
        console.log(`[${merge.commit.hash.substring(0, 6)}] Merge fast forward`)
})

let total = 0, nullTotal = 0, selfConflicts = 0, authors = {}
repos.merges.forEach(merge => {
    if(merge.conflict == true) {
        
        console.log(`${merge.commit.hash},${merge.conflictedFiles.length},${merge.chunks},${merge.selfConflicts}`)
        merge.conflictedFiles.forEach(file => {
            total += file.chunks.length
            file.chunks.forEach(chunk => {
                if(chunk['authors'][0] == '=' || chunk['authors'][1] == '=') {
                    
                    console.log(`BUGADO = ${merge.commit.hash}`)
                    console.log(file)
                    console.log(chunk)
                }


                if(chunk['authors'][0] == null || chunk['authors'][1] == null) {
                    nullTotal ++
                }
                else if(chunk['authors'][0] == chunk['authors'][1]) {
                    selfConflicts ++
                    
                    if(chunk['authors'][0] in authors) {
                        authors[chunk['authors'][0]].conflicts ++
                        authors[chunk['authors'][0]].selfConflicts ++
                    }
                    else {
                        authors[chunk['authors'][0]] = {
                            name: chunk['authors'][0],
                            conflicts: 1,
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
    console.log(`${author.name}\t${author.conflicts}\t${author.selfConflicts}`)
}

/*repos.merges.forEach((merge) => {

    console.log(merge)
    console.log(merge.committers[0])
    console.log(merge.committers[1])
    console.log(merge.changedFiles[0]);
    console.log(merge.changedFiles[1]);
})*/