var fs = require('fs')
var langsSelected = ['eng', 'fra', 'pol', 'ukr']

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
        var notFiltered = readFile(`tmp/garbage-${lang}.json`)
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
        var dir = './language'; 
        if (!fs.existsSync(dir)) { 
            fs.mkdirSync(dir); 
        }
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
    function readFile(filename) {
        let readFile = fs.readFileSync(filename, 'utf8')
        let parsedFile = JSON.parse(readFile)
        return parsedFile
    }
    function clearPunctuation(word) {
        if (typeof word === 'string') {
            word = word.replace(/[\n,.?!:;()¿¡"«»\\%—–…]/g, "")
            // specific line - may not need this
            word = word.replace(/\`/g, "\'")
            return word
        } else {
            console.log('not a string ' + word)
        }
    }
}
step4()
