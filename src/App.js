import { runGitCommand } from './utils/command'
import Repository from './models/repository'

const repos = new Repository("/home/brunotrindade/Reps/atom")

//console.log(repos)

repos.loadMergesData()

//repos.merges[0].redoMerge()

/*repos.merges.forEach((merge) => {

    console.log(merge)
    console.log(merge.committers[0])
    console.log(merge.committers[1])
    console.log(merge.changedFiles[0]);
    console.log(merge.changedFiles[1]);
})*/