var ui = `
div.langs id:brave
div
    button.step1-submit text:Go
`

var lng = function(l) {
return `
div
    input type:checkbox, id:id-${l}
    label.labelka text:${l}, for:id-${l}
`
}
