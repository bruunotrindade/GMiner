import { runGitCommand } from './utils/command'
import Repository from './models/repository'

const repos = new Repository("/home/brunotrindade/Reps/atom")

//console.log(repos)

repos.loadMergesData()

repos.merges.forEach(merge => {
    if(!merge.isFastForward) {
        merge.loadAttributes(true, true, true, true, true, true)
        console.log(`[${merge.commit.hash.substring(0, 6)}] Merge explored`)
        //console.log(merge)
    }
    else
        console.log(`[${merge.commit.hash.substring(0, 6)}] Merge fast forward`)
})

/*repos.merges.forEach((merge) => {

    console.log(merge)
    console.log(merge.committers[0])
    console.log(merge.committers[1])
    console.log(merge.changedFiles[0]);
    console.log(merge.changedFiles[1]);
})*/