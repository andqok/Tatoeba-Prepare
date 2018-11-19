const electron = require('electron')
const remote = require('electron').remote
const { app, BrowserWindow } = require('electron')

function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({ width: 1200, height: 800 })
    //win.webContents.openDevTools()

    // and load the index.html of the app.
    win.loadFile('index.html')
}

app.on('ready', createWindow)
