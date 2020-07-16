class ChangedFile {

    constructor(fullName, oldNames=[]) {
        this.fullName = fullName
        this.name = fullName.substring(fullName.lastIndexOf('/')+1, fullName.length)
        this.oldNames = oldNames
    }

    changeName(newFullName) {
        this.oldNames.push(this.fullName)
        this.fullName = newFullName
    }
}

export default ChangedFile