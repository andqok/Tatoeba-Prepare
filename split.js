const util = {
    readFile: (filename) => {
        let readFile = fs.readFileSync(filename, 'utf8')
        let parsedFile = JSON.parse(readFile)
        return parsedFile
    },
    percent: (arg1, arg2) => {
        return Math.floor((arg1 / arg2) * 100)
    },
    removePunctuation: (word) => {
        word = word.replace(/[,.?!:;()¿¡"«»\\%]/g, "")
        word = word.replace(/\`/g, "\'")
        return word
    },
    time: (time, startTime) => {
        if (!time) {
            time = new Date()
        }
        let hours = addZero(time.getHours())
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

let lang = 'lat'

const fs = require('fs')
var notFiltered = require('readline').createInterface({
    input: require('fs').createReadStream(`garbage-${lang}.json`)
})

var counter = 999
var res

//notFiltered.on('line', line => {
//    counter += 1
//    if (counter === 1000) {
//        number = line.match(/(?<=")(.*)(?=":{"s":)/)[0]
//        res = fs.createWriteStream(`language/${lang}-${number}.json`)
//        counter = 0
//    }
//    res.write(line + '\r\n')
//})

function find (newNum) {
    var a = []
    fs.readdirSync('./language/')
        .filter(str => str.includes(lang))
        .map(el => {
            return el.slice(0, el.length - 5).slice(4, 99)
        }).forEach(el => {
            a.push(+el)
        })
    a = a.sort((x, y) => x - y)
    let b = Array.from(a)
    b.push(newNum)
    b.sort((x, y) => x - y)
    b = b.indexOf(newNum)
    let index = a[b - 1]
    var lines = require('readline').createInterface({
        input: require('fs').createReadStream(`language/${lang}-` + index + '.json')
    })
    lines.on('line', line => {
        if (line.includes(newNum + '')) {
            return line
        }
    })
}
