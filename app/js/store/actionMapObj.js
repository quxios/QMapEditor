import MapObj from './JSONMapObj'

import { action } from 'mobx'

export default (C) => {
  return class ActionMapObj extends C {
    @action.bound
    addMapObj() {
      this.mapObjects.push({
        ...MapObj
      })
      this.selectMapObj(this.mapObjects.length - 1);
    }

    @action.bound
    moveMapObj(data) {
      const {
        oldIndex,
        newIndex
      } = data;
      this.arrMove(this.mapObjects, oldIndex, newIndex);
    }

    @action.bound
    selectMapObj(index) {
      this.currentMapObj = index;
    }

    @action.bound
    deleteMapObj(index) {
      this.mapObjects.splice(index, 1);
      if (this.currentMapObj === index) {
        this.selectMapObj(-1);
      } else if (this.currentMapObj > index) {
        this.selectMapObj(this.currentMapObj - 1);
      }
    }

    @action.bound
    duplicateMapObj(index) {
      const mapObj = this.mapObjects[index];
      if (!mapObj) return;
      this.mapObjects.push({
        ...MapObj,
        ...JSON.parse(JSON.stringify(mapObj))
      })
      this.selectMapObj(this.mapObjects.length - 1);
    }

    @action.bound
    isQSprite(filePath) {
      if (!this.hasQSprite || !filePath) return false;
      const {
        identifier,
        configs
      } = this.QSprite;
      const config = identifier.exec(filePath);
      if (!config || !configs[config[1]]) return false;
      return config[1];
    }

    @action.bound
    getQSprite(config) {
      return this.QSprite.configs[config];
    }
  }
}
