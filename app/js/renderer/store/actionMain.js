import MapObj from './JSONMapObj'

import { action } from 'mobx'
import fs from 'fs'
import path from 'path'

import themes from './../style/themes'
import { themeElements } from './../style'

const MENUBAR_HEIGHT = 34;

export default (C) => {
  return class ActionMain extends C {
    @action.bound
    setup(canvas) {
      const theme = this.getUserData('theme');
      this.changeTheme(theme);
      if (process.env.PRODUCTION === 'false') {
        this.startDev();
      }
      let winSize = [window.innerWidth, window.innerHeight];
      winSize[1] -= MENUBAR_HEIGHT;
      this.renderer = new PIXI.WebGLRenderer(winSize[0], winSize[1], {
        view: canvas,
        transparent: true,
        roundPixels: true,
        antialias: false
      })
      this.ticker = new PIXI.ticker.Ticker();
      this.ticker.start();
    }

    @action.bound
    startDev() {
      fs.watch(path.join(__dirname, './../../../css'), (eventType, filename) => {
        if (eventType === 'change') {
          themeElements.forEach((theme) => {
            if (theme.rel === 'stylesheet') {
              const time = `?${Date.now()}`
              theme.href = theme.href.replace(/\?.*$/, time);
            }
          })
        }
      })
    }

    @action.bound
    load(fileNames) {
      if (!fileNames) return;
      const projectPath = path.dirname(fileNames[0]);
      this.setUserData('projectPath', projectPath);
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
          const dataPath = path.join(projectPath, './data');
          this.parseQMap(JSON.parse(fs.readFileSync(file2Path, 'utf8')), dataPath);
        } catch (e) {
          console.error(e);
          this.notify('WARN', `Creating new QMap.\n${file2Path} was not found.`, 3000);
          this.qMap = Array(this.mapList.length).fill([]);
        }
        this.projectPath = projectPath;
        this.selectMap(-1);
        this.checkForQSprite();
      }
    }

    @action.bound
    parseQMap(qMap, dataPath) {
      if (qMap[0] !== '2') {
        qMap = this.convertToV2(qMap, dataPath);
      }
      qMap.forEach((valid, i) => {
        if (i > 0 && valid === true) {
          const num = String(i).padStart(3, '0');
          const qMapPath = path.join(dataPath, `./qMaps/QMap${num}.json`);
          try {
            let data = JSON.parse(fs.readFileSync(qMapPath, 'utf8'));
            data.forEach((mapObj, j) => {
              data[j] = {
                ...MapObj,
                ...mapObj,
                meta: this.makeMeta(mapObj.notes || '')
              }
            })
            this.qMap[i] = data;
          } catch (e) {
          }
        }
      })
    }

    @action.bound
    convertToV2(oldData, dataPath) {
      const qMapsPath = path.join(dataPath, './QMaps/');
      if (!fs.existsSync(qMapsPath)) {
        fs.mkdirSync(qMapsPath);
      }
      let newJson = ['2'];
      oldData.forEach((qMap, i) => {
        if (i > 0 && qMap && qMap.length > 0) {
          newJson[i] = true;
          const num = String(i).padStart(3, '0');
          const qMapPath = path.join(qMapsPath, `./QMap${num}.json`);
          fs.writeFileSync(qMapPath, JSON.stringify(qMap));
        }
      })
      fs.writeFileSync(path.join(dataPath, './QMap.json'), JSON.stringify(newJson));
      return newJson;
    }

    @action.bound
    save() {
      if (!this.isLoaded) return;
      const dataPath = path.join(this.projectPath, './data');
      this.makeSave(this.qMap, dataPath);
      this.notify('SUCCESS', `Saved`, 3000);
    }

    @action.bound
    makeSave(data, dataPath) {
      const qMapsPath = path.join(dataPath, './QMaps/');
      let json = ['2'];
      data.forEach((qMap, i) => {
        if (qMap && qMap.length > 0) {
          json[i] = true;
          const num = String(i).padStart(3, '0');
          const qMapPath = path.join(qMapsPath, `./QMap${num}.json`);
          qMap.forEach((mapObj) => {
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
          fs.writeFileSync(qMapPath, JSON.stringify(qMap));
        }
      });
      fs.writeFileSync(path.join(dataPath, './QMap.json'), JSON.stringify(json));
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
    changeTheme(theme) {
      let disabled = 0;
      themeElements.forEach((element) => {
        element.disabled = theme !== element.id;
        if (element.disabled) {
          disabled++;
        }
      })
      if (themeElements.length === disabled) {
        console.warn(`Attempted to apply a theme that isn't registered: ${theme}`);
        themeElements[0].disabled = false;
        theme = themeElements[0].id;
      }
      this.setUserData('theme', theme);
      this.theme = theme;
    }
  }
}
