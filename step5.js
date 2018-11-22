/** Split language file into 1000 lines chunks */ 

function step5(lang) {
    var notFiltered = require('readline').createInterface({
        input: require('fs').createReadStream(`tmp/garbage-${lang}.json`)
    })

    var counter = 99
    var res

    notFiltered.on('line', line => {
        counter += 1
        if (counter === 100) {
            let number = line.match(/(?<=")(.*)(?=":{"s":)/)[0]
            res = fs.createWriteStream(`language/${lang}-${number}.json`)
            counter = 0
        }
        res.write(line + '\r\n')
    })
    return true
}
