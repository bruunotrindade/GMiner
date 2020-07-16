import { runGitCommand } from './utils/command'
import Repository from './models/repository'

const repos = new Repository("/home/brunotrindade/Reps/atom")

//console.log(repos)

repos.loadMergesData()

repos.merges.forEach((merge) => {

    /*merge.changedFIles[0].forEach((file) => {
        if(file.oldNames.length > 0)
        {
            console.log(merge)
            console.log(file)
        }    
    })

    merge.changedFIles[1].forEach((file) => {
        if(file.oldNames.length > 0)
        {
            console.log(merge)
            console.log(file)
        }    
    })*/

    console.log(merge)
    console.log(merge.committers[0])
    console.log(merge.committers[1])
    console.log(merge.changedFiles[0]);
    console.log(merge.changedFiles[1]);
})