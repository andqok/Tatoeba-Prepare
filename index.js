//const fs = require('fs')

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
    step1()
})

/*
2. Script '(2) links.js' processes active.json and links.csv
It defines group of links corresponding to one number in the left column,
    and makes this group an object.
Function processGroup starts for relevant objects(determined using active.json)
   and makes languages key and index value.
Then group object is added to the list of relevant links,
    which is saved to file 'links.json'
3. Script '(3) process.js' goes back to sentences.csv and uses links.json
It processes records in sentences.csv and take those corresponding to each language.
Then writes out an object for each sentence.This object consists of
key 's' — sentence, and 'o' - indexes of this sentence in other languages,
    taken from links.json
Returns garbage - ${ lang }.js for each language
4a.Script '(4a) pairs.js' takes previously generated garbage - ${ lang }.js
Language pair must be specified
Takes each object key and deletes it if it has no reference to other language.
If such references exist, sentence is being broken down to words.
Word becomes totally lowercase and stripped of all punctuation.
Separate function makes tree - like object of all characters of this word.
Separate function makes object, in which to every word corresponds array
of sentences in which it occurs
*/
