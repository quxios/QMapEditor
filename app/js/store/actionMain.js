import MapObj from './JSONMapObj'

import { action } from 'mobx'
import { ipcRenderer } from 'electron'
import fs from 'fs'
import path from 'path'

const MENUBAR_HEIGHT = 34;

export default (C) => {
  return class ActionMain extends C {
    @action.bound
    setup(canvas) {
      let winSize = ipcRenderer.sendSync('getContentSize');
      winSize[1] -= MENUBAR_HEIGHT;
      this.renderer = new PIXI.WebGLRenderer(winSize[0], winSize[1], {
        view: canvas,
        transparent: true,
        roundPixels: true,
        antialias: true
      })
      this.ticker = new PIXI.ticker.Ticker();
      this.ticker.add(this.updateInput);
      this.ticker.start();
    }

    @action.bound
    load(fileNames) {
      if (!fileNames) return;
      const projectPath = path.dirname(fileNames[0]);
      ipcRenderer.send('setDefaultPath', projectPath);
      const file1Path = path.join(projectPath, './data/MapInfos.json');
      const file2Path = path.join(projectPath, './data/QMap.json');
      this.isLoaded = true;
      this.mapList = [];
      try {
        this.mapList = JSON.parse(fs.readFileSync(file1Path, 'utf8'));
      } catch (e) {
        this.isLoaded = false;
      }
      if (this.isLoaded) {
        try {
          this.qMap = Array(this.mapList.length).fill([]);
          JSON.parse(fs.readFileSync(file2Path, 'utf8')).forEach(this.parseQMap);
        } catch (e) {
          this.notify('WARN', `Creating new QMap.\n${file2Path} was not found.`, 3000);
          this.qMap = Array(this.mapList.length).fill([]);
        }
        this.projectPath = projectPath;
        this.selectMap(-1);
        this.checkForQSprite();
      }
    }

    @action.bound
    parseQMap(qMap, index) {
      if (!qMap) return;
      for (let i = 0; i < qMap.length; i++) {
        qMap[i] = {
          ...MapObj,
          ...qMap[i],
          meta: this.makeMeta(qMap[i].notes || '')
        }
      }
      this.qMap[index] = qMap;
    }

    @action.bound
    save() {
      if (!this.isLoaded) return;
      const filePath = path.join(this.projectPath, './data/QMap.json');
      const data = JSON.parse(JSON.stringify(this.qMap));
      fs.writeFileSync(filePath, this.makeSave(data));
      this.notify('SUCCESS', `Saved to:\n${filePath}`, 3000);
    }

    @action.bound
    makeSave(data) {
      data.forEach((map) => {
        map.forEach((mapObj) => {
          mapObj.cols = Math.round(Number(mapObj.cols)) || 1;
          mapObj.rows = Math.round(Number(mapObj.rows)) || 1;
          mapObj.x = Math.round(Number(mapObj.x)) || 0;
          mapObj.y = Math.round(Number(mapObj.y)) || 0;
          mapObj.z = Math.round(Number(mapObj.z)) || 0;
          mapObj.anchorX = Number(mapObj.anchorX) || 0;
          mapObj.anchorY = Number(mapObj.anchorY) || 0;
          mapObj.scaleX = Number(mapObj.scaleX) || 0;
          mapObj.scaleY = Number(mapObj.scaleY) || 0;
          mapObj.angle = Number(mapObj.angle) || 0;
        });
      });
      return JSON.stringify(data);
    }

    @action.bound
    saveScreenshot(data, id = 0) {
      const imagePath = path.join(this.projectPath, `screenshot${id}.png`);
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
          this.saveScreenshot(data, ++id);
        }
      })
    }

    @action.bound
    checkForQSprite() {
      const { projectPath } = this;
      const pluginsPath = path.join(projectPath, './js/plugins.js');
      this.hasQSprite = false;
      this.QSprite = null;
      try {
        const plugins = fs.readFileSync(pluginsPath, 'utf8');
        const json = JSON.parse(/(\[[\s\S]*\])/.exec(plugins)[1]);
        for (let i = 0; i < json.length; i++) {
          if (/^<QSprite>/.test(json[i].description)) {
            let identifier = json[i].parameters['File Name Identifier'];
            identifier = identifier.replace('{config}', '(.+)?');
            identifier = new RegExp(identifier);
            this.hasQSprite = true;
            this.QSprite = {
              identifier
            }
            break;
          }
        }
        if (this.hasQSprite) {
          const qSpritePath = path.join(projectPath, './data/QSprite.json');
          this.QSprite.configs = JSON.parse(fs.readFileSync(qSpritePath, 'utf8'));
        }
      } catch (e) {
        this.hasQSprite = false;
        this.QSprite = null;
      }
    }

    @action.bound
    changeTheme() {
      if (this.theme === 'light') {
        this.theme = 'dark';
      } else {
        this.theme = 'light';
      }
      ipcRenderer.send('setTheme', this.theme);
    }
  }
}
