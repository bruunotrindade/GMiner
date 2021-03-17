import { runGitCommand } from './utils/command'
import Repository from './models/repository'
import translateAttribute from './utils/utils'
import { writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs'

const MERGE_ATTRIBUTES = {
    "Hash": "commit.hash",
    "Timestamp": "commit.defaultTimestamp",
    "Branching Time": "branchingTime",
    "Merge Time": "mergeTime",
    "Committers 1": "committers.0.length",
    "Committers 2": "committers.1.length",
    "Diff Committers": "diffCommitterCount",
    "Same Committers": "sameCommitterCount",
    "Commits 1": "commits.0",
    "Commits 2": "commits.1",
    "Changed Files 1": "changedFiles.0.length",
    "Changed Files 2": "changedFiles.1.length",
    "Changed Files Intersection": "changedFilesIntersection",
    "Conflict": "conflict",
    "Conflicted Files": "conflictedFiles.length",
    "Chunks": "chunks",
    "Modified Chunks": "modifiedChunks",
    "Has Self Conflict?": "hasSelfConflict",
    "Self Conflicts": "selfConflicts"
}

const AUTHOR_ATTRIBUTES = {
    "Name": "name",
    "Conflicts": "conflicts",
    "Self Conflicts": "selfConflicts",
    "Count when was author": "author"
}

const DELIMITER = ";"

const PATH = "/home/brunotrindade/NovosReps/cp-rm"

const OUTPUT_FOLDER = "C++"

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => source + "/" + dirent.name)

const reps = getDirectories(PATH)
console.log(reps)

for(let rep of reps) {
    console.log(rep)
    const repos = new Repository(rep)

    repos.loadMergesData(false)

    console.log("total = " + repos.merges.length)
    let cont = 0
    const len = repos.merges.length
    repos.merges.forEach(merge => {
        cont += 1
        if(!merge.isFastForward) {
            merge.loadAttributes(true, true, true, true, true, true)
            console.log(`[${repos.name} - ${merge.commit.hash.substring(0, 6)} - ${cont}/${len}] Merge explored`)
        }
        else
            console.log(`[${repos.name} - ${merge.commit.hash.substring(0, 6)} - ${cont}/${len}] Merge fast forward`)
    })

    console.log("\n\n")

    // Printing all merge data explored
    console.log("SAVING MERGES DATA...")

    let normalHeader = ""
    Object.entries(MERGE_ATTRIBUTES).forEach(([key, value]) => {
        normalHeader += key + DELIMITER
    })

    normalHeader = normalHeader.slice(0, normalHeader.length-1)

    let lines = normalHeader + "\n"
    repos.merges.forEach(merge => {
        if(!merge.isFastForward) {
            let line = ""
            Object.entries(MERGE_ATTRIBUTES).forEach(([key, value]) => {
                line += translateAttribute(merge, value) + DELIMITER
            })
            lines += line.slice(0, line.length-1) + "\n"
        }
    })

    if (!existsSync("./"+OUTPUT_FOLDER)){
        mkdirSync("./"+OUTPUT_FOLDER);
    }
    console.log("SIZE = " + lines.length)
    writeFileSync(`./${OUTPUT_FOLDER}/${repos.name}.csv`, lines, (err) => { if(err) return console.log(err) })

    // =====================================


    // Printing all authors data
    repos.buildAuthorsData()

    console.log("SAVING AUTHORS DATA...")

    let authorHeader = ""
    Object.entries(AUTHOR_ATTRIBUTES).forEach(([key, value]) => {
        authorHeader += key + DELIMITER
    })
    authorHeader = authorHeader.slice(0, authorHeader.length-1)

    lines = authorHeader + "\n"
    for (var name of Object.keys(repos.authors)) {
        const author = repos.authors[name]
        let line = ""
        Object.entries(AUTHOR_ATTRIBUTES).forEach(([key, value]) => {
            line += translateAttribute(author, value) + DELIMITER
        })
        lines += line.slice(0, line.length-1) + "\n"
    }

    console.log("SIZE = " + lines.length)
    writeFileSync(`./${OUTPUT_FOLDER}/${repos.name}-authors.csv`, lines, (err) => { if(err) return console.log(err) })
    // =====================================
}