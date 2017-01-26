import * as SaveLoad from './saveLoad'
import * as Context from './context'
import * as MapData from './map'
import * as ObjsData from './objs'

export default class Manager {
  static listeners = {};
  static state = {
    validProject: false,
    projectPath: '',
    mapList: [],
    validMap: false,
    selectedMap: 0,
    mapData: null,
    qMap: [],
    mapObjects: [],
    selectedObj: -1,
    gridWidth: 48,
    gridHeight: 48
  };
  static lastSort = Date.now();
  static lastSave = Date.now();
  static on(action, callback) {
    if (!this.listeners[action]) {
      this.listeners[action] = [];
    }
    if (typeof callback === "function") {
      this.listeners[action].push(callback);
    }
  }
  static remove(action, callback) {
    if (!this.listeners[action]) return;
    const i = this.listeners[action].indexOf(callback);
    if (i >= 0) {
      this.listeners[action].splice(i, 1);
    }
  }
  static emit(action, ...args) {
    if (this.listeners[action]) {
      this.listeners[action].forEach(callback => {
        callback(...args)
      })
    }
  }
  static update(newStates = {}) {
    this.state = {
      ...this.state,
      ...newStates
    }
    this.emit('UPDATE_STATE', this.state)
  }
  static autosave() {
    return; // disabled for now
    const dt = Date.now() - this.lastSave;
    this.lastSave = Date.now();
    if (dt > 16) {
      SaveLoad.save(this.state);
    }
  }
  static run(action) {
    switch (action.type) {
      case 'LOAD_FILE': {
        SaveLoad.load(action.args);
        break;
      }
      case 'SAVE_FILE': {
        SaveLoad.save(this.state);
        break;
      }
      case 'SCREENSHOT': {
        SaveLoad.saveScreenshot(action.args);
        break;
      }
      case 'OPEN_CONTEXT': {
        Context.set(action.args);
        break;
      }
      case 'CLOSE_CONTEXT': {
        Context.close();
        break;
      }
      case 'SELECT_MAP': {
        MapData.select(action.args);
        break;
      }
      case 'ADD_OBJECT': {
        ObjsData.add(action.args);
        break;
      }
      case 'DELETE_OBJECT': {
        ObjsData.remove(action.args);
        break;
      }
      case 'DELETE_ALL_OBJECTS': {
        ObjsData.removeAll();
        break;
      }
      case 'SELECT_OBJECT': {
        ObjsData.select(action.args);
        break;
      }
      case 'UPDATE_OBJECT': {
        ObjsData.update(action.args);
        break;
      }
      case 'SORT_OBJECTS': {
        const lastSort = Date.now() - this.lastSort;
        ObjsData.sort(lastSort);
        this.lastSort = Date.now();
        break;
      }
    }
  }
}
