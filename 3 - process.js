const fs = require('fs')
const util = {
    readFile: (filename) => {
        let   readFile = fs.readFileSync(filename, 'utf8')
        let parsedFile = JSON.parse(readFile)
        return parsedFile
    },
    percent: (arg1, arg2) => {
        return Math.floor((arg1 / arg2) * 100)
    },
    time: (time, startTime) => {
      let hours   = addZero(time.getHours())
      let minutes = addZero(time.getMinutes())
      let seconds = addZero(time.getSeconds())
      return `${hours}:${minutes}:${seconds}`

      function addZero(a) {
        if (a <= 9) {
          return '0' + a
        } else {
          return a
        }
      }
    }
}

var langs = util.readFile('0 - langs.js')
var links = util.readFile('tmp/links.json')

separateSentences(langs)

function separateSentences(langs) {
    
    lang = langs.pop()
    var sentencesReader = require('readline').createInterface({
        input: require('fs').createReadStream('csv/sentences.csv')
    });
    var output = fs.createWriteStream(`tmp/garbage-${lang}.json`)
    output.write('{')
    
    sentencesReader.on('line', (line) => {
        line = line.split("\t")
        var record = {
            index:    line[0],
            lang:     line[1],
            sentence: line[2]
        }
        if (record.lang === lang) {
            output.write(`"${record.index}":${JSON.stringify({
                s: record.sentence,    // sentence
                o: links[record.index] // others
            })},\n`)
        }
        //console.log(lang + ' ' + record.index)
    })
    sentencesReader.on('close', () => {
        output.write('"dummy": {}}')
        if (langs.length > 0) {
            separateSentences(langs)
        }
    })
}
