import Repository from './models/repository.js'
import translateAttribute from './utils/utils.js'
import printSoftwareInfo from './utils/info.js'
import { writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs'
import promptSync from 'prompt-sync';

const prompt = promptSync()

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
    "Self Conflicts": "selfConflicts",
    "Files With Self Conflict": "filesWithSelfConflict",
    "Time between Self Conflict commits (AVG)": "selfConflictOccurrenceAvg",
    "Chunks Per Conflicted File": "chunksPerConflictedFile",
    "Chunks Per Self Conflicted File": "chunksPerSelfConflictedFile",
    "Self Conflict Chunks Per File With Conflict": "selfConflictChunksPerFileWithConflict",
    "Self Conflict Chunks Per File With Self Conflict": "selfConflictChunksPerFileWithSelfConflict",
    "AVG of Chunk Lines 1": "chunkLines.0",
    "AVG of Chunk Lines 2": "chunkLines.1",
    "Type of Conflict - modified/modified": "typesOfConflict.modified/modified",
    "Type of Conflict - modify/delete": "typesOfConflict.modify/delete",
    "Type of Conflict - rename/delete": "typesOfConflict.rename/delete",
    "Type of Conflict - rename/rename": "typesOfConflict.rename/rename",
}

const AUTHOR_ATTRIBUTES = {
    "Name": "name",
    "Conflicts": "conflicts",
    "Self Conflicts": "selfConflicts",
    "Count when was author": "author",
    "Time of self conflict (AVG)": "selfConflictsOccurrenceAvg"
}

printSoftwareInfo()

const DELIMITER = 'DELIMITER' in process.env ? process.env.DELIMITER : prompt("Delimiter: ")

const MODE = 'MODE' in process.env ? process.env.MODE : prompt("Input Mode (1 => single repository, 2 => all the folder): ")

let reps = []

if(MODE == 1) {
    const REPO_PATHS = 'INPUT_DATA' in process.env ? process.env.INPUT_DATA : prompt("Repos paths separated by semicolon(;): ")
    reps = REPO_PATHS.split(";")
    console.log("[INFO] Reading specified repositories (mode 1)...")
}
else if(MODE == 2) {
    const INPUT_FOLDER = 'INPUT_DATA' in process.env ? process.env.INPUT_DATA : prompt("Input folder path: ")
    const getDirectories = source =>
        readdirSync(source, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => source + "/" + dirent.name)

    reps = getDirectories(INPUT_FOLDER)
    console.log("[INFO] Reading specified folder (mode 2)...")
}

const OUTPUT_FOLDER = 'OUTPUT_FOLDER' in process.env ? process.env.OUTPUT_FOLDER : prompt("Output folder: ")
console.log(`[INFO] Output folder: ${OUTPUT_FOLDER}`)

for(let rep of reps) {
    console.log(`[START] Current repository: ${rep}`)
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

            if(isNaN(merge.commits[0]) || isNaN(merge.commits[1]))
                return

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