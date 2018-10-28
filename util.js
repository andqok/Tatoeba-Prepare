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

function click(q, func) {
    query(q).addEventListener('click', func)
}

function siblingOfClass (_class, el) {
    return el.parentNode.getElementsByClassName(_class)[0]
}

function siblingSearcher(el) {
    return function (_class) {
        return siblingOfClass(_class, el)
    }
}

function clearPunctuation (word) {
    if (typeof word === 'string') {
        word = word.replace(/[\n,.?!:;()¿¡"«»\\%—–…]/g, "")
        // specific line - may not need this
        word = word.replace(/\`/g, "\'")
        return word
    } else {
        console.log('not a string ' + word)
    }
}

const util = {
    readFile: (filename) => {
        let readFile = fs.readFileSync(filename, 'utf8')
        let parsedFile = JSON.parse(readFile)
        return parsedFile
    },
    percent: (arg1, arg2) => {
        return Math.floor((arg1 / arg2) * 100)
    },
    time: (time, startTime) => {
        let hours = addZero(time.getHours())
        let minutes = addZero(time.getMinutes())
        let seconds = addZero(time.getSeconds())
        return `${hours}:${minutes}:${seconds}`
        function addZero(a) {
            if (a <= 9) {
                return '0' + a
            } else {
                return a
            }
        }
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

is.eventOfClass = function (className, event ) {
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

dom.render = function (scheme, parent) {
    // used external functions:
    //      dom.decode
    //      dom.makeFromStr
    //      dom.make
    //      dom.tagAttributes (indirectly)
    if (typeof scheme === 'string') {
        scheme = dom.decode(scheme)
    }
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

dom.make = function (tag, options, parent) {
    var element = document.createElement(tag);
    // special cases — name of attribute in options (and in html)
    //   doesn't correspond to the name of attribute in JS
    if (options && Object.keys(options).length > 0) {
        dom.setIfDefined(options['class'], element, 'className')
        delete options['class']
        dom.setIfDefined(options['for'], element, 'htmlFor')
        delete options['for']
        if (options.text) {
            element.appendChild(document.createTextNode(options.text));
            delete options['text']
        }
    }
    Object.keys(options).forEach(el => {
        // if options includes some of these html attributes,
        //   set them to the created object
        try {
            dom.setIfDefined(options[el], element, el)
        } catch (e) {
            console.log(e)
        }
    })
    
    if (parent) {
        parent.appendChild(element)
    }
    return element
}

dom.makeFromStr = function (str, parent) {
    if (str === 'template' || str === 'fragment') {
        return document.createDocumentFragment()
    }
    let decomposed = decompose(str)
    let tag     = decomposed.tag
    let classes = decomposed.classes
    let others  = decomposed.others
    let res = [tag]
    let options = dom.tagAttributes(tag, others)
    res.push(options)

    if (classes.length > 0) {
        res[1].class = classes.join(' ')
    }
    if (parent) {
        res.push(parent)
    }
    return dom.make(...res)
    
    function decompose (str) {
        let o = {
            classes: []
        }
        let str2 = str.split('.')[0]
        if (str === str2) { // if true, then no classes present
            o.tag = str.split(' ')[0]
        } else {
            o.tag = str2
        }
        o.others = str.slice(o.tag.length, str.length).trim()
        if (o.others) {
            if (o.others[0] === '.') {
                let classesStr = o.others.match(/\S+/g)[0]
                o.others = o.others.slice(classesStr.length, o.others.length)
                                   .trim()
                o.classes = classesStr.split('.')
                o.classes.shift()
            }
        }
        return o
    }
}

dom.tagAttributes = function (tag, others) {
    let o = {}
    let tagsAttributes = {
        // except class
        div:    ['id'],
        button: ['text'],
        input:  ['type', 'id', 'accept'],
        label:  ['for', 'text'],
        progress: ['id', 'max', 'value'],
        p: ['id', 'text'],
        span: ['id', 'text'],
        h1: ['text'],
        h2: ['text'],
        img: ['src'],
        ul: ['id']
    }
    let attrRegex = {
        text: [/text:([^,]*),/, /text:(.*)/],
        placeholder: [/placeholder:([^,]*),/, /placeholder:(.*)/],
        type: [/type:([^,]*),/, /type:(.*)/],
        id: [/id:([^,]*),/, /id:(.*)/],
        for: [/for:([^,]*),/, /for:(.*)/],
        value: [/value:([^,]*),/, /value:(.*)/],
        max: [/max:([^,]*),/, /max:(.*)/],
    }
    tagsAttributes[tag].forEach(attribute => {
        let attributeText
        if (others.includes(attribute + ':')) {
            attributeText = others.match(
                attrRegex[attribute][0]
            )
            if (!attributeText) {
                attributeText = others.match(
                    attrRegex[attribute][1]
                )[1]
            } else if (is.array(attributeText)) {
                attributeText = attributeText[1]
            }
            o[attribute] = attributeText
        }
    })
    return o
}

dom.decode = function decode(i) {
    // take multi-line string, usually from the ui, and
    // make object, ready to use by dom.render

    i = i.trim().split('\n')
    let o = {
        ch: []
    }
    let blocks = split(i)
    if (blocks.length > 1) {
        o.el = 'template'
        o.ch = newChildren(blocks)
    } else {
        o.el = blocks[0]
        o = newChildren(blocks)[0]
    }

    return o
    
    function newChildren(blocks) {
        return blocks.map(line => {
            return {
                el: line[0],
                ch: processCh(line.slice(1, line.length))
            }
        })
    }

    function processCh(line) {
        if (line.length === 0) return []
        line = line.map(p => p.slice(4, p.length))
        let blocks = split(line)
        let res = []
        blocks.forEach(line => {
            let newObj = {
                el: line[0],
            }
            if (blocks.length === 1) {
                newObj.ch = []
            } else {
                newObj.ch = processCh(line.slice(1, line.length))
            }
            res.push(newObj)
        })
        return res
    }

    function split(lines) {
        var acc = []
        lines.forEach(line => {
            if (line[0] !== ' ') {
                acc.push([line])
            } else {
                acc[acc.length - 1].push(line)
            }
        })
        return acc
    }
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
    date.setDate( date.getDate() + 1 )
    let month = String(date.getMonth() + 1).padStart(2, '0')
    let day   = String(date.getDate()).padStart(2, '0')
    return `${date.getFullYear()}-${month}-${day}`
}

//console.log( decode(a) )
//console.log(
//    time.datesBetween('2018-09-29', '2018-10-30')
//)
