var fs = require('fs')
var langs_ = [ 'rus',  'fra', 'por', 'pol', 'ita']

//recursive(['eng'])
//
//function recursive(langs) {
//    var lang = langs.pop()
//
//    words(lang)
//    if (langs.length !== 0) {
//        recursive(langs)
//    } 
//}

words('eng')

function words(lang) {

    if (lang == null) {
        return false
    }
    console.log(`started ${lang}`)

    var active = JSON.parse(fs.readFileSync('garbage-' + lang + '.json', 'utf8'))
    var sentence, words
    var result   = {}
    var mostused = {}
    var length   = Object.keys(active).length
    var count     = 0
    var exceptins = 0
    
    for (let key in active) {
        if (key != 'dummy') {
            count += 1
            
            sentence = active[key]['s']
            words = sentence.split(" ")

            for (let word of words) {
                
                word = word.toLowerCase()
                word = word.replace(/\,/g, "")
                word = word.replace(/\./g, "")
                word = word.replace(/\?/g, "")
                word = word.replace(/\!/g, "")
                word = word.replace(/\:/g, "")
                word = word.replace(/\(/g, "")
                word = word.replace(/\)/g, "")
                word = word.replace(/\¿/g, "")
                word = word.replace(/\¡/g, "")
                word = word.replace(/\"/g, "")
                word = word.replace(/\«/g, "")
                word = word.replace(/\»/g, "")
                word = word.replace(/\\/g, "")
                word = word.replace(/\%/g, "")
                word = word.replace(/\`/g, "\'")
                console.log(`  ${lang}  count ${count} of ${length} exceptions: ${exceptins} `)
                if (result[word]) {
                    //console.log(result[word])
                    try {
                        result[word].push(key)
                    } catch (e) {
                        console.log('error ' + e)
                        exceptins += 1
                    }
                } else {
                    result[word] = [key]
                }
            }
        }
    }
    var resultLen = Object.keys(result).length
    var resultCount = 0

    for (let key in result) {
        resultCount += 1
        console.log(`  ${lang}  key: ${resultCount}  of ${resultLen}`)
        let obj = result[key]
        if (obj.length > 23) {
            if (mostused[obj.length]) {
                mostused[obj.length].push(key)
            } else {
                mostused[obj.length] = [key]
            }
        }
    }

    active['-words'] = result
    active['-mostused'] = mostused

    fs.writeFileSync('links' + lang + '.js', `var ${lang} = ${JSON.stringify(active, null, 2)}`)

}
