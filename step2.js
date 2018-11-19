//var fs = require('fs')
function step2() {
    // Skim through links.csv
    // i: tmp/active.json 
    //    csv/links.csv
    // o: tmp/links.json

    const active = readFile('tmp/active.json')
    const linksCsvReader = require('readline').createInterface({
        input: require('fs').createReadStream('csv/links.csv')
    })
    let output = fs.createWriteStream('tmp/links.json')
    output.write('{')

    let counterLine = 0
    var currentIndex = 1
    var linesGroup = []

    linksCsvReader.on('line', line => {
        
        counterLine += 1
        line = line.split("\t")
        let index1 = +line[0]
        let index2 = +line[1]
        
        if (active[ index1 ] && active[ index2 ]) {

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
                var index1 = [line[0]]
                var index2 = line[1]
                if (active[index2]) {
                    result[active[index2]] = index2
                }
            }
            result = JSON.stringify(result)
            output.write('"' + index1 + '":')
            output.write(result + ',\n')
        }
    })
    function readFile (filename) {
        let readFile = fs.readFileSync(filename, 'utf8')
        let parsedFile = JSON.parse(readFile)
        return parsedFile
    }
    
    function indicator() {
        if (counterLine % 170000 === 0) {
            id('num2').textContent = percent(counterLine, 16000000)
        }
        function percent (arg1, arg2) {
            return Math.floor((arg1 / arg2) * 100)
        }
    }

    linksCsvReader.on('close', () => {
        output.write('"dummy": {}}')
        setTimeout(function () {
            step3()
            }, 1000)
    })
}
