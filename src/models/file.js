class File {

    constructor(fullName, oldNames=[]) {
        this.fullName = fullName
        this.name = fullName.slice(fullName.lastIndexOf('/')+1, fullName.length)
        this.oldNames = oldNames
        this.selfConflict = null
        this.selfConflicts = 0
    }

    changeName(newFullName) {
        this.oldNames.push(this.fullName)
        this.fullName = newFullName
    }
}

export default File