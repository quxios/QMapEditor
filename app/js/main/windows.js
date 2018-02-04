import { BrowserWindow, shell } from 'electron'
import { AppData } from './appData'
import path from 'path'
import url from 'url'

const ROOT = path.join(__dirname, '../../');

let windows = {};

function forEachWindow(callback) {
  for (const window in windows) {
    callback(windows[window]);
  }
}

function removeWindow(key) {
  const win = windows[key];
  if (!win) return;
  delete windows[key];
  win.close();
}

function createWindow(key, filePath, options) {
  let win = new BrowserWindow({
    show: false,
    webPreferences: {
      devTools: (process.argv || []).indexOf('--dev') !== -1
    },
    ...options
  })
  win.key = key;
  win.setMenu(null);
  win.loadURL(url.format({
    pathname: path.join(ROOT, filePath),
    protocol: 'file:',
    slashes: true
  }))
  if (!isNaN(AppData[`${key}-x`]) && !isNaN(AppData[`${key}-y`])) {
    win.setPosition(AppData[`${key}-x`], AppData[`${key}-y`]);
  }
  if (!isNaN(AppData[`${key}-width`]) && !isNaN(AppData[`${key}-height`])) {
    win.setSize(AppData[`${key}-width`], AppData[`${key}-height`]);
  }
  win.once('ready-to-show', () => {
    win.show();
  })
  win.on('closed', () => {
    delete windows[key];
    win = null;
  })
  win.on('resize', (e) => {
    const size = win.getSize();
    AppData[`${key}-width`] = size[0];
    AppData[`${key}-height`] = size[1];
  })
  win.on('move', (e) => {
    const pos = win.getPosition();
    AppData[`${key}-x`] = pos[0];
    AppData[`${key}-y`] = pos[1];
  })
  win.on('focus', (e) => {
    win.webContents.send('focus');
  })
  let handleRedirect = (e, url) => {
    if (url != win.webContents.getURL()) {
      e.preventDefault();
      shell.openExternal(url);
    }
  }
  win.webContents.on('will-navigate', handleRedirect);
  win.webContents.on('new-window', handleRedirect);
  if (options.dev) {
    win.webContents.openDevTools({
      detach: true
    })
    win.webContents.once('devtools-opened', () => {
      win.focus();
    })
  }
  if (windows[key]) {
    removeWindow(key);
  }
  windows[key] = win;
  return win;
}

export { windows, forEachWindow, createWindow }