import Store from './../store'
import { observe } from 'mobx'
import Sprite from './sprite'

const TILE_COLOR = 0xFFFFFF;
const TILE_OUTLINE = 0xE0E0E0;

const ZOOM_AMT = 0.1;
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 2;

class Stage extends PIXI.Container {
  constructor() {
    super();
    this.addListeners();
    this.create();
    this.setGrid(48, 48);
    this.x = 400;
    this.y = 50;
  }
  create() {
    this._mapBG = new PIXI.Graphics();
    this.addChild(this._mapBG);
    this._objContainer = new PIXI.Container();
    this.addChild(this._objContainer);
    this._mapGrid = new PIXI.Graphics();
    this._mapGrid.blendMode = PIXI.BLEND_MODES.MULTIPLY;
    this.addChild(this._mapGrid);
    this._mapEvents = new PIXI.Container();
    this.addChild(this._mapEvents);
  }
  addListeners() {
    observe(Store, 'currentMap', ::this.onCurrentMapChange);
  }
  onCurrentMapChange(change) {
    PIXI.utils.clearTextureCache();
    const id = change.newValue;
    if (this._observing) {
      this._observing();
      this._observing = null;
    }
    if (id !== -1 && Store.mapData) {
      this.alpha = 1;
      this.setSize(Store.mapData.width, Store.mapData.height)
      this.setObjects(Store.mapObjects);
      this.drawMapBG();
      this.drawMapEvents(Store.mapData.events);
      this._observing = observe(Store.mapObjects, ::this.onMapObjectsChange);
    } else {
      this.alpha = 0;
    }
  }
  onMapObjectsChange(change) {
    const {
      type,
      added,
      removed
    } = change;
    if (type === 'splice') {
      added.forEach((obj) => {
        this.addObject(obj);
      })
      removed.forEach((obj) => {
        this.removeObject(obj);
      })
      this.sortObjects();
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
  drawMapBG() {
    const fullMapWidth  = this._mapWidth * this._gridWidth;
    const fullMapHeight = this._mapHeight * this._gridHeight;
    this._mapBG.clear();
    this._mapBG.beginFill(TILE_COLOR);
    this._mapBG.drawRect(0, 0, fullMapWidth, fullMapHeight);
    this._mapBG.endFill();
    this._mapGrid.clear();
    this._mapGrid.lineStyle(1, TILE_OUTLINE, 1);
    for (let x = 0; x <= this._mapWidth; x++) {
      this._mapGrid.moveTo(x * this._gridWidth, 0);
      this._mapGrid.lineTo(x * this._gridWidth, fullMapHeight);
    }
    for (let y = 0; y <= this._mapHeight; y++) {
      this._mapGrid.moveTo(0, y * this._gridHeight);
      this._mapGrid.lineTo(fullMapWidth, y * this._gridHeight);
    }
  }
  drawMapEvents(events) {
    this._mapEvents.removeChildren();
    for (let i = 0; i < events.length; i++) {
      if (events[i]) {
        const { x, y } = events[i];
        const style = {
          fontFamily: 'Roboto',
          fontWeight: 'bold',
          fill: 0x00FFFF,
          strokeThickness: 0.5
        }
        const sprite = new PIXI.Text('E', style);
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.x = (x + 0.5) * this._gridWidth;
        sprite.y = (y + 0.5) * this._gridHeight;
        sprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;
        this._mapEvents.addChild(sprite);
      }
    }
  }
  setObjects(newMapObjects = []) {
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
        this._objContainer.removeChild(sprite);
        sprite.removeListeners();
        break;
      }
    }
  }
  zoomAt(x, y, deltaY) {
    let localPos = this.toLocal(new PIXI.Point(x, y));
    if (deltaY < 0) {
      this.scale.x = Math.min(this.scale.x + ZOOM_AMT, ZOOM_MAX);
      this.scale.y = Math.min(this.scale.y + ZOOM_AMT, ZOOM_MAX);
    } else {
      this.scale.x = Math.max(this.scale.x - ZOOM_AMT, ZOOM_MIN);
      this.scale.y = Math.max(this.scale.y - ZOOM_AMT, ZOOM_MIN);
    }
    this.x = -(localPos.x * this.scale.x) + x;
    this.y = -(localPos.y * this.scale.y) + y;
  }
  screenShot() {
    if (!Store.renderer) return;
    if (Store.currentMap > 0) {
      const width  = this._mapWidth * 48;
      const height = this._mapHeight * 48;
      const renderTexture = PIXI.RenderTexture.create(width, height);
      const selected = Store.currentMapObj;
      const oldX = this.x;
      const oldY = this.y;
      const oldScaleX = this.scale.x;
      const oldScaleY = this.scale.y;
      this.x = 0;
      this.y = 0;
      this.scale.x = 48 / Store.gridWidth;
      this.scale.y = 48 / Store.gridHeight;
      Store.selectMapObj(-1);
      Store.renderer.render(this, renderTexture);
      let image = Store.renderer.extract.base64(renderTexture);
      image = image.replace(/^data:image\/\w+;base64,/, '');
      Store.saveScreenshot(image);
      Store.selectMapObj(selected);
      this.x = oldX;
      this.y = oldY;
      this.scale.x = oldScaleX;
      this.scale.y = oldScaleY;
      renderTexture.destroy(true);
    }
  }
  update() {
    const mapObjs = this._objContainer.children;
    for (let i = 0; i < mapObjs.length; i++) {
      mapObjs[i].update();
    }
  }
}

export default new Stage();
