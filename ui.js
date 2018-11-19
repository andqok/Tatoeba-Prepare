var ui = `
h1 text=Step One
div.langs id=brave
div
    button.step1-submit text=Go
    progress max=100, value=0, id=progress-main
h1 text=Step Two
    button.step2-submit text=Step 2
    span id=num2
h1 text=Step Three
    button.step3-submit text=Step 3
button.final-step text=Final
`

var lng = function(l) {
return `
div
    input type=checkbox, id=input-${l}
    label.labelka for=input-${l}, text=${l}
    span id=count-${l}, text=0
`
}
