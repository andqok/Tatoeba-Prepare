const fs = require('fs')
const util = {
    readFile: (filename) => {
        let   readFile = fs.readFileSync(filename, 'utf8')
        let parsedFile = JSON.parse(readFile)
        return parsedFile
    },
    percent: (arg1, arg2) => {
        return Math.floor((arg1 / arg2) * 100)
    }
}
var langs = util.readFile('0 - langs.js')
var active = {}
var count1 = 0

var sentencesReader = require('readline').createInterface({
    input: require('fs').createReadStream('csv/sentences.csv')
});


sentencesReader.on('line', (line) => {
    line = line.split("\t")
    if (langs.includes(line[1])) {
        active[ line[0] ] = line[1]
        count1 += 1
        //console.log('  included ' + Math.floor(count1 / 1000) + ' k active')
    }
})

sentencesReader.on('close', () => {
    fs.writeFile('tmp/active.json',  JSON.stringify(active), (e) => {})
})
