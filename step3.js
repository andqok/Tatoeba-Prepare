
function step3() {
    // i: tmp/links.json
    //    csv/sentences.csv
    // o: tmp/garbage-${lang}.json
    //const active = readFile('tmp/active.json')
    var links = readFileObject('tmp/links.json')
    for (let lang of langsSelected) {
        separateSentences(lang)
    }
    setTimeout(function() {
        step4()
    }, langsSelected.length * 60000)
    console.log("step 3 c'est fini")

    function separateSentences(lang) {
        var sentencesReader = require('readline').createInterface({
            input: require('fs').createReadStream('csv/sentences.csv')
        });
        var output = fs.createWriteStream(`tmp/garbage-${lang}.json`)
        output.write('{')

        sentencesReader.on('line', (line) => {
            line = line.split("\t")
            var record = {
                index: line[0],
                lang: line[1],
                sentence: line[2]
            }
            if (record.lang === lang && links[ record.index ]) {
                output.write(`"${record.index}":${JSON.stringify({
                    s: record.sentence,    // sentence
                    o: links[record.index] // others
                })},\n`)
            }
        })
        sentencesReader.on('close', () => {
            output.write('"dummy": {}}')
        })
    }
}
