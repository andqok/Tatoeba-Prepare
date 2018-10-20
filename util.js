const util = {
    readFile: (filename) => {
        let   readFile = fs.readFileSync(filename, 'utf8')
        let parsedFile = JSON.parse(readFile)
        return parsedFile
    },
    percent: (arg1, arg2) => {
        return Math.floor((arg1 / arg2) * 100)
    }
}

'use strict';

function id(el) {
    return document.getElementById(el)
}

function query(el) {
    return document.querySelector(el)
}

function queryArr(el) {
    return Array.from(
        document.querySelectorAll(el)
    )
}

function siblingOfClass(_class, el) {
    return el.parentNode.getElementsByClassName(_class)[0]
}

function siblingSearcher(el) {
    return function (_class) {
        return siblingOfClass(_class, el)
    }
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

const is = { empty: {} }
is.array = function (smth) {
    return Array.isArray(smth)
}

is.object = function (obj) {
    return obj === Object(obj) && Object.prototype.toString.call(obj) !== '[object Array]'
}

is.string = function (smth) {
    return typeof smth === 'string'
}

is.numberStr = function (smth) {
    // true: '23423', '12.564'
    return !Number.isNaN(+smth)
}
is.emptyVar = function (smth) {
    // true: undefined and null
    // note: other falsy values (0, NaN, '', false)
    // make variable non-empty
    if (typeof smth == 'undefined') {
        return true
    }
    return false
}
is.empty.array = function (smth) {
    if (is.array(smth)) {
        return smth.length === 0
    } else {
        console.log('not array')
    }
}

is.eventOfClass = function (className, event) {
    return event.srcElement.classList.value.includes(className)
}

const dom = {}
dom.getId = id
dom.getQuery = query
dom.setIfDefined = function (val, set, pt) {
    if (!is.emptyVar(val)) {
        set[pt] = val
    }
}
dom.make = function (tag, options, parent) {
    var element = document.createElement(tag);
    ['id', 'type', 'value', 'name', 'src', 'placeholder'].forEach(el => {
        // if options includes some of these html attributes,
        //   set them to the created object
        try {
            dom.setIfDefined(options[el], element, el)
        } catch (e) {
            console.log(e)
        }
    })
    // special cases — name of attribute in options (and in html)
    //   doesn't correspond to the name of attribute in JS
    if (options && Object.keys(options).length > 0) {
        dom.setIfDefined(options["class"], element, 'className')
        dom.setIfDefined(options.for, element, 'htmlFor')
        if (options.text) {
            element.appendChild(document.createTextNode(options.text));
        }
    }
    if (parent) {
        parent.appendChild(element)
    }
    return element
}

dom.render = function (scheme, parent) {
    // inspired by Tiddlywiki source code — $tw.utils.domMaker
    var element
    if (scheme.el) {
        element = processEl(scheme.el)
    }

    if (scheme.ch) {
        processCh(scheme.ch)
    }

    if (parent) {
        parent.appendChild(element)
    }

    return element

    function processEl(el) {
        let element
        if (is.string(el)) {
            element = dom.makeFromStr(el)
        } else
            if (is.array(el)) {
                element = dom.make(el[0], el[1])
            } else {
                console.log('sodfjosdjfo!!!!!!')
            }
        return element
    }

    function processCh(ch) {
        ch.forEach(el => {
            if (is.string(el)) {
                dom.makeFromStr(el, element)
            } else if (is.object(el)) {
                dom.render(el, element)
            }
        })
    }
}

dom.makeFromStr = function (str, parent) {
    let tag = str.split('.')[0]
    if (tag === str) {
        tag = str.split(' ')[0]
    }
    const classes = str.match(/\S+/g)[0].split('.').slice(1, 999)
    const others = str.split(' ').slice(1, 999).join(' ')
    let text, placeholder, value
    if (others.includes('text:')) {
        text = others.match(/text:(.*),/)
        if (!text) {
            text = others.match(/text:(.*)/)[1]
        }
    }
    if (others.includes('placeholder:')) {
        placeholder = others.match(/placeholder:(.*),/)
        if (!placeholder) {
            placeholder = others.match(/placeholder:(.*)/)[1]
        }
    }
    let res = [tag, {
        class: classes.join(' '),
        text: text,
        placeholder: placeholder,
    }]

    if (parent) {
        res.push(parent)
    }
    return dom.make(...res)
}

dom.rm = function (el) {
    if (el && el.parentNode) {
        el.parentNode.removeChild(el)
    }
}

dom.removeAllChildren = function (el) {
    while (el.firstChild) {
        el.removeChild(el.firstChild)
    }
}

const rand = {
    arrayEl: {}
}
rand.arrayIndex = function (arr) {
    return Math.floor(Math.random() * arr.length)
}
rand.arrayEl.nonMutating = function (arr) {
    return arr[rand.arrayIndex(arr)]
}
rand.arrayEl.mutating = function randElCut(arr) {
    const index = rand.arrayIndex(arr)
    const out = arr[index]
    arr.splice(index, 1)
    return out
}
rand.objectProperty = function (obj) {
    return rand.arrayEl.nonMutating(Object.keys(obj))
}

function presetBranch(trunk, branch, value) {
    if (is.emptyVar(trunk[branch])) {
        trunk[branch] = value
    }
}

const time = {}

time.datesBetween = function (date1, date2) {
    date1 = time.ISOfyDate(date1)
    date2 = time.ISOfyDate(date2)
    let date1Num = +(date1.slice(0, 4) + date1.slice(5, 7) + date1.slice(8, 10))
    let date2Num = +(date2.slice(0, 4) + date2.slice(5, 7) + date2.slice(8, 10))
    if (date1Num === date2Num) {
        return []
    } if (date1Num < date2Num) {
        return [date1].concat(
            time.datesBetween(
                time.nextDate(date1),
                date2
            )
        )
    } else {
        console.log('First parameter is bigger than second!')
    }
}

time.ISOfyDate = function (date) {
    if (date instanceof Date) {
        return date.toISOString().slice(0, 10)
    } else if (typeof date == 'string') {
        return date
    }
}

time.getAllYearDays = function (year) {
    return time.datesBetween(new Date(year + '-01-01'), new Date(year + '-12-31'))
}


time.daysInFebruary = function (year) {
    year = parseInt(year)
    if (year % 4 === 0 &&
        (year % 100 !== 0 || year % 400 === 0)) {
        return 29
    } else {
        return 28
    }
}

time.daysInMonths = function (year, month) {
    return {
        '01': 31,
        '02': time.daysInFebruary(year),
        '03': 31,
        '04': 30,
        '05': 31,
        '06': 30,
        '07': 31,
        '08': 31,
        '09': 30,
        '10': 31,
        '11': 30,
        '12': 31
    }[month]
}

time.nextDate = function (date_s) {
    let date = new Date(date_s)
    date.setDate(date.getDate() + 1)
    let month = String(date.getMonth() + 1).padStart(2, '0')
    let day = String(date.getDate()).padStart(2, '0')
    return `${date.getFullYear()}-${month}-${day}`
}



//console.log(
//    time.datesBetween('2018-09-29', '2018-10-30')
//)
