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
    time: (time) => {
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

let prevIndex    = '1'
var counter      = 0
let prevTime     = 0
let counterLine  = 0
var currentIndex = 1
var writeObj     = {}
var linesGroup   = []
var ifLast = false
var active = util.readFile('tmp/active.json')
let output = fs.createWriteStream('tmp/links.json')

output.write('{')

var pairReader = require('readline').createInterface({
    input: require('fs').createReadStream('csv/links.csv')
});

pairReader.on('line', (line) => {

    counterLine += 1
    line = line.split("\t")
    let index1 = +line[0]
    let index2 = +line[1]
    if (active[ index1 ]) {

      if (currentIndex == index1) {
        linesGroup.push([index1, index2])
      } 
      if (index1 > currentIndex) {
        processGroup()
        linesGroup = []
        linesGroup.push([index1, index2])
        currentIndex = index1
      }
    }

    function processGroup() {
      var result = {}
      for (let line of linesGroup) {
        var index1 =[ line[0] ]
        var index2 = line[1]
        if (typeof active[index2] !== 'undefined') {
          result[ active[index2] /* e.g. 'eng' */ ] = index2
        }
      }
      result = JSON.stringify(result)
      output.write('"' + index1 + '":')
      output.write(result/*.slice(1, result.length - 1)*/ + ',\n')
      counter += 1
      //console.log(index1 + '  ' + JSON.stringify(result) )
      //let time = new Date()
      //if (time.getSeconds() - 1 === prevTime) {
      //  console.log(util.time(time) + '   => ' + util.percent(counter, counterLine) + '%')
      //}
      //prevTime = time.getSeconds()
    }
})

pairReader.on('close', () => {
  output.write('"dummy": {}}')
})
