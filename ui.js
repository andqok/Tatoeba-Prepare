var ui = `
div.langs
div
    button.step1-submit text:Go
`

var lng = function(l) {
return `
div
    input type:checkbox
    label text:${l}
`
}
