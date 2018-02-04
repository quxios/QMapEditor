import Actions from './actions'

import { observable, computed } from 'mobx'
import { ipcRenderer } from 'electron'

class Store extends Actions {
  @observable theme = '';
  @observable isLoaded = false;
  @observable projectPath = ipcRenderer.sendSync('getProp', 'projectPath');
  @observable mapList = [];
  @observable qMap = [];
  @observable currentMap = -1;
  @observable currentMapObj = -1;
  @observable gridWidth = 48;
  @observable gridHeight = 48;
  @observable context = {
    open: false,
    type: '',
    selected: -1,
    x: 0, y: 0,
    items: []
  }
  @observable notifications = [];
  hasQSprite = false;

  @computed
  get mapObjects() {
    if (this.currentMap === -1) return [];
    return this.qMap[this.currentMap];
  }

  @computed
  get mapObject() {
    if (this.currentMapObj === -1) return null;
    if (this.currentMapObj >= this.mapObjects.length) return null;
    return this.mapObjects[this.currentMapObj];
  }

  getUserData(prop) {
    return ipcRenderer.sendSync('getProp', prop);
  }

  setUserData(prop, value) {
    ipcRenderer.send('setProp', prop, value);
  }
}

let store = window.Store = new Store();

export default store;
