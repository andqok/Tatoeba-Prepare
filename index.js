const fs = require('fs')

var langs = ["fra", "ukr", "spa", "por", "eng", "pol", "ita", "ces", "lat", "tur"]
var langsSelected = []

dom.render(ui, document.body)
langs.forEach(lang => {
    dom.render(lng(lang), query('.langs'))
})

click('.step1-submit', e => {
    langsSelected = queryArr('input[type=checkbox]:checked')
        .map(el => el.nextSibling.textContent)
    console.log(langsSelected)
    separateLanguages()
    //step3()
})

function separateLanguages() {
    var active = {}
    var streams = {}
    var count = 0
    var specialCounters = {}
    langsSelected.forEach(lang => specialCounters[lang] = 0)

    var sentencesReader = require('readline').createInterface({
        input: require('fs').createReadStream('csv/sentences.csv')
    });

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
            id('progress-main').value = util.percent(count, 7000000)
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

function step2() {
    // read active.json and output links.json
    var active = util.readFile('tmp/active.json')
    let output = fs.createWriteStream('tmp/links.json')

    let prevIndex = '1'
    let prevTime = 0
    let counterLine = 0
    var currentIndex = 1
    var writeObj = {}
    var linesGroup = []
    var ifLast = false

    output.write('{')

    var pairReader = require('readline').createInterface({
        input: require('fs').createReadStream('csv/links.csv')
    });

    pairReader.on('line', (line) => {
        if (counterLine % 170000 === 0) {
            id('num2').textContent = util.percent(counterLine, 16000000)
        }
        counterLine += 1
        line = line.split("\t")
        let index1 = +line[0]
        let index2 = +line[1]
        if (active[index1]) {

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
                if (typeof active[index2] !== 'undefined') {
                    result[active[index2]] = index2
                }
            }
            result = JSON.stringify(result)
            output.write('"' + index1 + '":')
            output.write(result + ',\n')
        }
    })

    pairReader.on('close', () => {
        output.write('"dummy": {}}')
        setTimeout(function () {
            step3()
            }, 1000)
    })
}

function step3() {
    var links = util.readFile('tmp/links.json')
    for (let lang of langsSelected) {
        separateSentences(lang)
    }
    setTimeout(function() {
        step4()
    }, langsSelected.length * 45000)
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
            if (record.lang === lang) {
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

function step4(varkla) {
    let ex = []
    for (let l of langsSelected) {
        words(l)
    }
    setTimeout(function() {
        for (let l of langsSelected) {
            step5(l)
        }
    }, 1000)

    function words(lang) {
        var notFiltered = util.readFile(`tmp/garbage-${lang}.json`)
        var tree = {}
        var words = {}
        var mostused = {}
        let res = {}

        for (let key in notFiltered) {
            let sentence = notFiltered[key]['s']
            if (sentence) {
                processWords(words, tree, sentence.split(" "), key)
            }
        }

        for (let key in words) {
            let obj = words[key]
            if (obj.length > 23) {
                if (mostused[obj.length]) {
                    mostused[obj.length].push(key)
                } else {
                    mostused[obj.length] = [key]
                }
            }
        }

        res['-words'] = words
        notFiltered['-lang'] = lang
        fs.writeFileSync(`language/${lang}.js`,
            `const words${lang} = ${JSON.stringify(res)}`)
    }

    function processWords(words, tree, wordsArr, key) {

        for (let word of wordsArr) {
            word = word.toLowerCase()
            word = clearPunctuation(word)
            makeWords(words, word, key)
        }
    }


    function makeWords(words, word, key) {
        if (words[word]) {
            try {
                words[word].push(key)
            } catch (e) {
                ex.push(words[word])
            }
        } else {
            words[word] = [key]
        }
    }
}

function step5(lang) {
    var notFiltered = require('readline').createInterface({
        input: require('fs').createReadStream(`tmp/garbage-${lang}.json`)
    })

    var counter = 999
    var res

    notFiltered.on('line', line => {
        counter += 1
        if (counter === 1000) {
            let number = line.match(/(?<=")(.*)(?=":{"s":)/)[0]
            res = fs.createWriteStream(`language/${lang}-${number}.json`)
            counter = 0
        }
        res.write(line + '\r\n')
    })
    return true
}

function find(newNum, lang) {
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
            console.log(line)
        }
    })
}
