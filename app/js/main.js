const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')
const fs = require('fs')

const root = path.join(__dirname, '../')
process.env.PRODUCTION = path.extname(root) === '.asar'
let settingsPath = path.join(root,  '../winData.json')

let win
let help
let frameSelect
let winData = {
  width: 1600,
  height: 900
}

function start () {
  fs.readFile(settingsPath, 'utf8', (err, data) => {
    if (!err) {
      winData = Object.assign(winData, JSON.parse(data))
    }
    createWindow()
  })
}

function createWindow () {
  win = new BrowserWindow({
    width: winData.width,
    height: winData.height,
    resizable: true,
    useContentSize: true,
    webPreferences: {
      devTools: (process.argv || []).indexOf('--dev') !== -1
    }
  })
  win.setMenu(null)
  win.loadURL(url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file:',
    slashes: true
  }))
  if (winData.x && winData.y) {
    win.setPosition(winData.x, winData.y)
  }
  win.on('closed', () => {
    let data = JSON.stringify(winData, null, '  ')
    fs.writeFileSync(settingsPath, data)
    win = null
  })
  win.on('resize', (e) => {
    [winData.width, winData.height] = win.getContentSize()
    win.webContents.send('resize', ...win.getContentSize())
  })
  win.on('move', (e) => {
    [winData.x, winData.y] = win.getPosition()
  })
  win.on('focus', (e) => {
    win.webContents.send('focus')
  })
  win.webContents.openDevTools({
    detach: true
  })
  win.webContents.once('devtools-opened', () => {
    win.focus()
  })
}

function createHelp() {
  help = new BrowserWindow({
    parent: win,
    modal: true,
    show: false,
    width: 350,
    height: 500,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    useContentSize: true
  })

  help.setMenu(null)
  help.loadURL(url.format({
    pathname: path.join(__dirname, '../help.html'),
    protocol: 'file:',
    slashes: true
  }))
  const x = Math.floor((win.getContentSize()[0] - 350) / 2 - win.getPosition()[0])
  const y = Math.floor((win.getContentSize()[1] - 500) / 2 - win.getPosition()[1])
  help.setPosition(x, y)
  help.once('ready-to-show', () => {
    help.show()
  })
}

function createFrameSelect(data) {
  frameSelect = new BrowserWindow({
    parent: win,
    modal: true,
    show: false,
    width: 650,
    height: 600,
    resizable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    useContentSize: true,
    webPreferences: {
      devTools: (process.argv || []).indexOf('--dev') !== -1
    }
  })
  frameSelect.setMenu(null)
  frameSelect.loadURL(url.format({
    pathname: path.join(__dirname, '../frameSelect.html'),
    protocol: 'file:',
    slashes: true
  }))
  const x = Math.floor((win.getContentSize()[0] - 350) / 2 - win.getPosition()[0])
  const y = Math.floor((win.getContentSize()[1] - 500) / 2 - win.getPosition()[1])
  frameSelect.setPosition(x, y)
  frameSelect.once('ready-to-show', () => {
    frameSelect.show()
    frameSelect.webContents.send('init', data)
  })
  frameSelect.webContents.openDevTools({
    detach: true
  })
  frameSelect.webContents.once('devtools-opened', () => {
    frameSelect.focus()
  })
}

app.on('ready', start)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    start()
  }
})

ipcMain.on('getContentSize', (e) => {
  e.returnValue = win.getContentSize()
})

ipcMain.on('getDefaultPath', (e) => {
  e.returnValue = winData.defaultPath || ''
})

ipcMain.on('setDefaultPath', (e, path) => {
  winData.defaultPath = path
})

ipcMain.on('openHelp', () => {
  createHelp()
})

ipcMain.on('openFrameSelect', (e, data) => {
  createFrameSelect(data)
})

ipcMain.on('setFrameIndex', (e, index) => {
  win.webContents.send('setFrameIndex', index);
  e.returnValue = index
})
