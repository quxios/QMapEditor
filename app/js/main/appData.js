import { app, ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'

import Default from './appDataDefault'

let AppData = { ...Default };
const DATA_PATH = path.join(app.getPath('userData'), 'data.json');

try {
  AppData = {
    ...AppData,
    ...JSON.parse(fs.readFileSync(DATA_PATH))
  }
} catch (error) {
}

ipcMain.on('getProp', (e, prop) => {
  e.returnValue = AppData[prop] || null;
})

ipcMain.on('setProp', (e, prop, value) => {
  AppData[prop] = value;
})

function saveData() {
  const json = JSON.stringify(AppData);
  fs.writeFileSync(DATA_PATH, json);
}

export { AppData, saveData };