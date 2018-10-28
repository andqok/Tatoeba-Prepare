function step5(lang) {
    // Split language file into 1000 lines chunks
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
