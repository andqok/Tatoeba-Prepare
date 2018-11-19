'use strict'

function clearPunctuation (word) {
    /**
     * @param  {string} word
     * @return {string} word
     */
    if (is.string(word)) {
        word = word.replace(/[\n,.?!:;()¿¡"«»\\%—–…]/g, "")
        // specific line - may not need this
        word = word.replace(/\`/g, "\'")
        return word
    } else {
        console.log('not a string ' + word)
    }
}

function readFileObject (filename) {
    /**
     * Use only for objects
     * @param  {string} filename
     * @return {object}
     */
    let readFile = fs.readFileSync(filename, 'utf8')
    let parsedFile = JSON.parse(readFile)
    return parsedFile
}

function percent (arg1, arg2) {
    /**
     * @param {number} arg1
     * @param {number} arg2
     * Math.floor may be replaced by alternative way of rounding
     */
    return Math.floor((arg1 / arg2) * 100)
}
