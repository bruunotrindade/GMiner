import Committer from "./committer"

class Commit {
    constructor(repos, hash, initialize=false) {
        this.repos = repos
        this.hash = hash
        this.initialized = initialize

        if(initialize) {
            this.initialize()
        }
    }

    initialize() {
        const response = this.repos.runGitCommand(`log -1 --pretty=format:%an//%ae//%ci//%ct ${this.hash}`).split("//")

        this.committer = new Committer(response[0], response[1])
        this.timestamp = new Date(response[2])
        this.unixTime = parseInt(response[3])
        this.initialized = true
    }
}

export default Commit