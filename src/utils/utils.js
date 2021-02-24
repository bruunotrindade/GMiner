const isFloat = (n) => {
    return Number(n) === n && n % 1 !== 0;
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
    return result
}

export default translateAttribute