import Committer from "./committer"

class Commit {
    constructor(repos, hash, loadData=false) {
        if(loadData) {
            const response = repos.runGitCommand(`log -1 --pretty=format:%an//%ae//%ci//%ct ${hash}`).split("//")
            
            //console.log(response)

            this.committer = new Committer(response[0], response[1])
            this.timestamp = new Date(response[2])
            this.unixTime = parseInt(response[3])
        }
        
        this.repos = repos
        this.hash = hash
    }
}

export default Commit