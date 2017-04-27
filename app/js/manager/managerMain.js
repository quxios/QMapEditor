import Store from './store'
import Stage from './../display/stage'

import { ipcRenderer } from 'electron'
import fs from 'fs'
import path from 'path'

export default class ManagerMain {
  load(fileNames) {
    if (!fileNames) return;
    const projectPath = path.dirname(fileNames[0]);
    ipcRenderer.send('setDefaultPath', projectPath);
    const file1Path = path.join(projectPath, './data/MapInfos.json');
    const file2Path = path.join(projectPath, './data/QMap.json');
    Store.isLoaded = true;
    Store.mapList = [];
    try {
      Store.mapList = JSON.parse(fs.readFileSync(file1Path, 'utf8'));
    } catch (e) {
      Store.isLoaded = false;
    }
    if (Store.isLoaded) {
      try {
        Store.qMap = Array(Store.mapList.length).fill([]);
        JSON.parse(fs.readFileSync(file2Path, 'utf8')).forEach((qMap, index) => {
          Store.qMap[index] = qMap || [];
        })
      } catch (e) {
        this.notify('WARN', `Creating new QMap.\n${file2Path} was not found.`, 3000);
        Store.qMap = Array(Store.mapList.length).fill([]);
      }
      Store.projectPath = projectPath;
      this.selectMap(-1);
      this.checkForQSprite();
    }
  }
  save() {
    if (!Store.isLoaded) return;
    const filePath = path.join(Store.projectPath, './data/QMap.json');
    const data = JSON.parse(JSON.stringify(Store.qMap));
    fs.writeFileSync(filePath, this.makeSave(data));
    this.notify('SUCCESS', `Saved to:\n${filePath}`, 3000);
  }
  makeSave(data) {
    data.forEach((map) => {
      map.forEach((mapObj) => {
        mapObj.cols = Number(mapObj.cols) || 1;
        mapObj.rows = Number(mapObj.rows) || 1;
        mapObj.x = Number(mapObj.x) || 0;
        mapObj.y = Number(mapObj.y) || 0;
        mapObj.z = Number(mapObj.z) || 0;
        mapObj.anchorX = Number(mapObj.anchorX) || 0;
        mapObj.anchorY = Number(mapObj.anchorY) || 0;
      })
    })
    return JSON.stringify(data);
  }
  saveScreenshot(data, id = 0) {
    const imagePath = path.join(Store.projectPath, `screenshot${id}.png`);
    fs.stat(imagePath, (err) => {
      if (err) {
        fs.writeFile(imagePath, data, 'base64', (err) => {
          if (err) {
            this.notify('ERROR', err);
          } else {
            this.notify('SUCCESS', `Screenshot saved to \n${imagePath}`, 3000);
          }
        });
      } else {
        saveScreenshot(data, ++id);
      }
    })
  }
  checkForQSprite() {
    const { projectPath } = Store;
    const pluginsPath = path.join(projectPath, './js/plugins.js');
    Store.hasQSprite = false;
    Store.QSprite = null;
    try {
      const plugins = fs.readFileSync(pluginsPath, 'utf8');
      const json = JSON.parse(/(\[[\s\S]*\])/.exec(plugins)[1]);
      for (let i = 0; i < json.length; i++) {
        if (/^<QSprite>/.test(json[i].description)) {
          let identifier = json[i].parameters['File Name Identifier'];
          identifier = identifier.replace('{config}', '(.+)?');
          identifier = new RegExp(identifier);
          Store.hasQSprite = true;
          Store.QSprite = {
            identifier
          }
          break;
        }
      }
      if (Store.hasQSprite) {
        const qSpritePath = path.join(projectPath, './data/QSprite.json');
        Store.QSprite.configs = JSON.parse(fs.readFileSync(qSpritePath, 'utf8'));
      }
    } catch (e) {
      Store.hasQSprite = false;
      Store.QSprite = null;
    }
  }
}
