import { runGitCommand } from './utils/command'
import Repository from './models/repository'

const repos = new Repository("/home/brunotrindade/sapos")

console.log(repos)