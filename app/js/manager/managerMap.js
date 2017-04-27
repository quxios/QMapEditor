import Store from './store'

import fs from 'fs'
import path from 'path'

// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength,padString) {
    targetLength = targetLength>>0; //floor if number or convert non-number to 0;
    padString = String(padString || ' ');
    if (this.length > targetLength) {
      return String(this);
    }
    else {
      targetLength = targetLength-this.length;
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
      }
      return padString.slice(0,targetLength) + String(this);
    }
  };
}

export default class ManagerMap {
  selectMap(index, clear) {
    if (clear && Store.currentMap === index && Store.currentMapObj === -1) {
      index = -1;
    }
    const num = String(index).padStart(3, '0');
    const mapPath = path.join(Store.projectPath, `./data/Map${num}.json`);
    try {
      Store.mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    } catch (e) {
      Store.mapData = null;
      index = -1;
    }
    Store.currentMap = index;
    Store.currentMapObj = -1;
    if (index > 0 && !Store.qMap[index]) {
      Store.qMap[index] = [];
    }
  }
}
