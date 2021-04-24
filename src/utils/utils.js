import { readFileSync, readdirSync, existsSync } from 'fs'

const isFloat = (n) => {
    return Number(n) === n && n % 1 !== 0;
}

export const getDirectories = source =>
        readdirSync(source, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => source + "/" + dirent.name)

export const generateHashesJSONFromFile = (path, filename, extension=".txt") => {
    const FILE_PATH = `${path}/${filename}${extension}`
    if(existsSync(FILE_PATH)) {
        const data = readFileSync(FILE_PATH, { encoding:'utf8', flag:'r' }).toString().split("\n")
        
        let hashes = {}
        data.forEach((hash) => {
            hashes[hash.replace("\r", "")] = { conflict: true }
        })
        return hashes
    }
    return null
}

const translateAttribute = (obj, attribute) => {
    const parts = attribute.split(".")
    let result = obj
    parts.forEach(part => {
        if(Number.isInteger(part))
            result = result[parseInt(part)]
        else
            result = result[part]
    })
    if(isFloat(result))
        result = result.toFixed(7)
    else if(typeof result === "boolean")
        result = result ? "YES" : "NO"
        
    return result
}

export default translateAttribute