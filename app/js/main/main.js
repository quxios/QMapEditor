import { ipcMain, app } from 'electron'
import { autoUpdater } from 'electron-updater'
import { saveData } from './appData'
import { windows, forEachWindow, createWindow } from './windows'


function start() {
  let mainWin = createWindow('main', 'index.html', {
    resizable: true,
    minWidth: 400,
    minHeight: 400,
    dev: true
  })
  mainWin.on('closed', () => {
    saveData();
    forEachWindow((win) => {
      if (win !== mainWin) {
        win.close();
      }
    })
  })
  setupUpdater();
}

function setupUpdater() {
  autoUpdater.checkForUpdatesAndNotify();
  // TODO: add update info into renderer
  autoUpdater.on('update-available', (info) => {

  })
  autoUpdater.on('download-progress', (progressObj) => {

  })
  autoUpdater.on('update-downloaded', (info) => {

  })
}

app.on('ready', start);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', () => {
  if (windows.length === 0) {
    start();
  }
})

ipcMain.on('openHelp', () => {
  createWindow('help', 'help.html', {
    resizable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    dev: true
  })
})

ipcMain.on('openSelectFrame', (e, data) => {
  let win = createWindow('selectFrame', 'selectFrame.html', {
    parent: windows.main,
    modal: true,
    resizable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    dev: true
  })
  win.once('ready-to-show', () => {
    win.show();
    win.webContents.send('init', data);
  })
})

ipcMain.on('setFrameIndex', (e, index) => {
  windows.main.webContents.send('setFrameIndex', index);
})

ipcMain.on('openSelectCondition', (e, data) => {
  let win = createWindow('selectCondition', 'selectCondition.html', {
    parent: windows.main,
    modal: true,
    width: 325,
    height: 250,
    resizable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    useContentSize: true,
    dev: true
  })
  win.once('ready-to-show', () => {
    win.show();
    win.webContents.send('init', data);
  })
})

ipcMain.on('setCondition', (e, data) => {
  windows.main.webContents.send('setCondition', data);
})
