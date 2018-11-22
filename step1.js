// 1. Generate separate csv files for each language of *langsSelected*
// 2. Generate active.json

// i: csv/sentences.csv
// o: tmp/${lang}.csv  | difference from sentences.csv is that 
//                     | the middle column is absent,
//                     | no need to specify language
//    tmp/active.json  | consists of an object literal which maps
//                       sentence number and corresponding language
function step1() {
    var active  = {}
    var streams = {}
    var count   = 0
    var specialCounters = {}
    langsSelected.forEach(lang => specialCounters[lang] = 0)

    var sentencesReader = require('readline').createInterface({
        input: require('fs').createReadStream('csv/sentences.csv')
    })

    langsSelected.forEach(lang => {
        streams[lang] = fs.createWriteStream(`tmp/${lang}.csv`)
    })

    sentencesReader.on('line', (line) => {
        line = line.split("\t")
        let num = line[0]
        let lang = line[1]
        let sentence = line[2]

        if (langsSelected.includes(lang)) {
            streams[lang].write(num + '\t' + sentence + '\r\n')
            active[line[0]] = line[1]
            specialCounters[lang] += 1
        }
        count += 1
        if (count % 60000 === 0) {
            id('progress-main').value = percent(count, 7000000)
            langsSelected.forEach(lang => {
                id('count-' + lang).textContent = specialCounters[lang]
            })
        }
    })

    sentencesReader.on('close', () => {
        fs.writeFile('tmp/active.json', JSON.stringify(active), (e) => { })
        id('progress-main').value = 100
        setTimeout(function () {
            step2()
        }, 1000)
    })
}
