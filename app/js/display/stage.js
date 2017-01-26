import Manager from './../manager'
import Sprite from './sprite'

const _tileColor = 0xFFFFFF;
const _tileOutline = 0xE0E0E0;

const _zoomAmt = 0.1;
const _zoomMin = 0.1;
const _zoomMax = 2;

class Stage extends PIXI.Container {
  constructor() {
    super();
    this._mapBG = new PIXI.Graphics();
    this.addChild(this._mapBG);
    this._objContainer = new PIXI.Container();
    this.addChild(this._objContainer);
    this._mapGrid = new PIXI.Graphics();
    this._mapGrid.blendMode = PIXI.BLEND_MODES.MULTIPLY;
    this.addChild(this._mapGrid);
    this._mapData = null;
    this._mapObjects = [];
    this._selectedMap = 0;
    Manager.on('UPDATE_STATE', ::this.updateState);
    Manager.on('SELECT_MAP', ::this.updateMapSelect);
    Manager.on('SORT', ::this.sortObjects);
    Manager.on('ADD_OBJECT', ::this.addObject);
    Manager.on('REMOVE_OBJECT', ::this.removeObject);
  }
  updateState(newState) {
    let {
      gridWidth,
      gridHeight
    } = newState;
    if (this._gridWidth !== gridWidth || this._gridHeight !== gridHeight) {
      this.setGrid(gridWidth, gridHeight);
      this.refreshMapBG();
    }
  }
  updateMapSelect(valid, selectedMap, mapData, mapObjects) {
    if (valid && selectedMap > 0) {
      this.alpha = 1;
    } else {
      this.alpha = 0;
      return;
    }
    if (this._selectedMap !== selectedMap) {
      this._mapData = mapData;
      this._selectedMap = selectedMap;
      this._mapObjects = mapObjects;
      this.setSize(mapData.width, mapData.height);
      this.setObjects(mapObjects);
      this.refreshMapBG();
    }
  }
  setSize(width, height) {
    this._mapWidth = width;
    this._mapHeight = height;
  }
  setGrid(width, height) {
    this._gridWidth = width;
    this._gridHeight = height;
  }
  refreshMapBG() {
    const fullMapWidth  = this._mapWidth * this._gridWidth;
    const fullMapHeight = this._mapHeight * this._gridHeight;
    this._mapBG.clear();
    this._mapBG.beginFill(_tileColor);
    this._mapBG.drawRect(0, 0, fullMapWidth, fullMapHeight);
    this._mapBG.endFill();
    this._mapGrid.clear();
    this._mapGrid.lineStyle(1, _tileOutline, 1);
    for (let x = 0; x <= this._mapWidth; x++) {
      this._mapGrid.moveTo(x * this._gridWidth, 0);
      this._mapGrid.lineTo(x * this._gridWidth, fullMapHeight);
    }
    for (let y = 0; y <= this._mapHeight; y++) {
      this._mapGrid.moveTo(0, y * this._gridHeight);
      this._mapGrid.lineTo(fullMapWidth, y * this._gridHeight);
    }
  }
  setObjects(newMapObjects) {
    let i;
    for (i = 0; i < this._objContainer.children.length; i++) {
      const sprite = this._objContainer.children[i];
      if (sprite) {
        sprite.removeListeners();
      }
    }
    this._objContainer.removeChildren();
    for (i = 0; i < newMapObjects.length; i++) {
      this.addObject(newMapObjects[i]);
    }
    this.sortObjects();
  }
  sortObjects() {
    this._objContainer.children.sort((a, b) => {
      if (a.z !== b.z) {
        return a.z - b.z;
      } else {
        return a.y - b.y;
      }
    })
    this._hasSorted = true;
  }
  addObject(obj) {
    const sprite = new Sprite(obj);
    this._objContainer.addChild(sprite);
  }
  removeObject(obj) {
    for (let i = 0; i < this._objContainer.children.length; i++) {
      const sprite = this._objContainer.children[i];
      if (sprite && sprite._obj === obj) {
        sprite.removeListeners();
        this._objContainer.removeChild(sprite);
        break;
      }
    }
  }
  zoomAt(x, y, deltaY) {
    let localPos = this.toLocal(new PIXI.Point(x, y));
    if (deltaY < 0) {
      this.scale.x = Math.min(this.scale.x + _zoomAmt, _zoomMax);
      this.scale.y = Math.min(this.scale.y + _zoomAmt, _zoomMax);
    } else {
      this.scale.x = Math.max(this.scale.x - _zoomAmt, _zoomMin);
      this.scale.y = Math.max(this.scale.y - _zoomAmt, _zoomMin);
    }
    this.x = -(localPos.x * this.scale.x) + x;
    this.y = -(localPos.y * this.scale.y) + y;
  }
}

export default new Stage();
