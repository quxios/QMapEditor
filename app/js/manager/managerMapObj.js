import Store from './store'

import MapObj from './JSONMapObj'

export default class ManagerMapObj {
  addMapObj() {
    Store.mapObjects.push({
      ...MapObj
    })
    this.selectMapObj(Store.mapObjects.length - 1);
  }
  moveMapObj(data) {
    const {
      oldIndex,
      newIndex
    } = data;
    this.arrMove(Store.mapObjects, oldIndex, newIndex);
  }
  selectMapObj(index) {
    Store.currentMapObj = index;
  }
  deleteMapObj(index) {
    Store.mapObjects.splice(index, 1);
    if (Store.currentMapObj === index) {
      this.selectMapObj(-1);
    } else if (Store.currentMapObj > index) {
      this.selectMapObj(Store.currentMapObj - 1);
    }
  }
  duplicateMapObj(index) {
    const mapObj = Store.mapObjects[index];
    if (!mapObj) return;
    Store.mapObjects.push({
      ...MapObj,
      ...JSON.parse(JSON.stringify(mapObj))
    })
    this.selectMapObj(Store.mapObjects.length - 1);
  }
  isQSprite(filePath) {
    if (!Store.hasQSprite || !filePath) return false;
    const {
      identifier,
      configs
    } = Store.QSprite;
    const config = identifier.exec(filePath);
    if (!config || !configs[config[1]]) return false;
    return config[1];
  }
  getQSprite(config) {
    return Store.QSprite.configs[config];
  }
}
