import Store from './../store'
import { observe } from 'mobx'

import fs from 'fs'
import path from 'path'

const DATA_OUTLINE = 0xFFFFFF;
const DATA_FILL = 0x29B6F6;
const DATA_FILL_ANCHOR = 0xF44336;
const DATA_FILL_COLLIDER = 0xAA0000;

function toObj(string) {
  if (typeof string !== 'string') return {};
  var lines = string.split('\n');
  var obj = {};
  lines.forEach(function(value) {
    var match = /^(.*):(.*)/.exec(value);
    if (match) {
      var key, newKey = match[1].trim();
      if (obj.hasOwnProperty(key)) {
        var i = 1;
        while (obj.hasOwnProperty(newKey)) {
          newKey = key + String(i);
          i++;
        }
      }
      var arr = toAry(match[2].trim());
      if (arr.length === 1) arr = arr[0];
      obj[newKey] =  arr || '';
    }
  })
  return obj;
};

function toAry(string) {
  if (typeof string !== 'string') return [];
  var regex = /\s*(\(.*?\))|([^,]+)/g;
  var arr = [];
  while (true) {
    var match = regex.exec(string);
    if (match) {
      arr.push(match[0]);
    } else {
      break;
    }
  }
  return arr.map(function(s) {
    s = s.trim();
    if (/^-?\d+\.?\d*$/.test(s)) return Number(s);
    var p = /^\((\d+),\s*(\d+)\)/.exec(s);
    if (p) {
      return new PIXI.Point(Number(p[1]), Number(p[2]));
    }
    if (s === 'true') return true;
    if (s === 'false') return false;
    if (s === 'null' || s === '') return null;
    return s;
  })
};

export default class Sprite extends PIXI.Sprite {
  constructor(obj) {
    super();
    this.x = Number(obj.x);
    this.y = Number(obj.y);
    this.z = Number(obj.z);
    this.anchor.x = Number(obj.anchorX);
    this.anchor.y = Number(obj.anchorY);
    this.scale.x = Number(obj.scaleX);
    this.scale.y = Number(obj.scaleY);
    this.rotation = Number(obj.angle) * (Math.PI / 180);
    this._tick = 0;
    this._tick2 = 0;
    this._frameI = 0;
    this._frames = [];
    this._realTexture = null;
    this._obj = obj;
    this._isSelected = false;
    this._qSprite = null;
    if (obj.isQSprite) {
      const config = Store.getQSprite(obj.isQSprite);
      this._qSprite = {
        config,
        pose: config.poses[obj.pose]
      }
      this.anchor.x = this._qSprite.config.anchorX;
      this.anchor.y = this._qSprite.config.anchorY;
    }
    this._dataGraphic = new PIXI.Graphics();
    this._dataGraphic.alpha = 0;
    this.addChild(this._dataGraphic);
    this.makeMeta();
    this.loadImage(obj.filePath);
    this.addListeners();
  }
  addListeners() {
    this.buttonMode = true;
    this.interactive = true;
    this.on('mousedown', ::this.startDrag);
    this.on('mouseup', ::this.endDrag);
    this.on('mouseupoutside', ::this.endDrag);
    this.on('mousemove', ::this.onDrag);
    this.on('mouseover', ::this.onOver);
    this.on('mouseout', ::this.onOut);
    this._observingA = observe(this._obj, ::this.onObjectChange);
    this._observingB = observe(Store, 'mapObject', ::this.onMapObjectChange);
  }
  removeListeners() {
    this._observingA();
    this._observingB();
  }
  startDrag(event) {
    if (event.data.originalEvent.button === 0) { // Leftclick
      this._prevPos = { ...event.data.global };
      this._dragging = true;
      this.alpha = 0.7;
      Store.selectMapObj(Store.mapObjects.indexOf(this._obj));
    }
  }
  endDrag(event) {
    if (this._dragging) {
      this._data = null;
      this._dragging = false;
      this.alpha = 1;
    }
  }
  onDrag(event) {
    if (this._dragging) {
      const scaleX = this.parent.parent.scale.x;
      const scaleY = this.parent.parent.scale.y;
      const newPos = event.data.global;
      const dx = newPos.x - this._prevPos.x;
      const dy = newPos.y - this._prevPos.y;
      const x = this._obj.x + dx / scaleX;
      const y = this._obj.y + dy / scaleY;
      this._obj.x = this.adjustXWithSnap(this._obj.x, x, dx);
      this._obj.y = this.adjustYWithSnap(this._obj.y, y, dy);
      this._prevPos = { ...newPos };
    }
  }
  adjustXWithSnap(prevX, nextX, dx) {
    // disabled for now
    return nextX;
    if (Store.isPressed(0x12)) return nextX;
    let gridPos = nextX / Store.gridWidth;
    let snapTo;
    if (dx > 0) {
      snapTo = Math.ceil(gridPos + 0.005) * Store.gridWidth;
      if (snapTo - nextX < 2) {
        nextX = snapTo;
      } else if (snapTo - nextX > Store.gridWidth - 2) {
        nextX = snapTo - Store.gridWidth;
      }
    } else if (dx < 0) {
      snapTo = Math.floor(gridPos - 0.005) * Store.gridWidth;
      if (nextX - snapTo < 2) {
        nextX = snapTo;
      } else if (nextX - snapTo > Store.gridWidth - 2) {
        nextX = snapTo + Store.gridWidth;
      }
    }
    return nextX;
  }
  adjustYWithSnap(prevY, nextY) {
    // disabled for now
    return nextY;
    if (Store.isPressed(0x12)) return nextY;
    let dy = nextY - prevY;
    let gridPos = nextY / Store.gridHeight;
    let snapTo;
    if (dy > 0) {
      snapTo = Math.ceil(gridPos + 0.005) * Store.gridHeight;
      if (snapTo - nextY < 10) {
        nextY = snapTo;
      } else if (snapTo - nextY > Store.gridHeight - 2) {
        nextY = snapTo - Store.gridHeight;
      }
    } else if (dy < 0) {
      snapTo = Math.floor(gridPos - 0.005) * Store.gridHeight;
      if (nextY - snapTo < 10) {
        nextY = snapTo;
      } else if (nextY - snapTo > Store.gridHeight - 2) {
        nextY = snapTo + Store.gridHeight;
      }
    }
    return nextY;
  }
  onOver(event) {
    if (!this._isSelected) {
      this._dataGraphic.alpha = 0.8;
    }
  }
  onOut(event) {
    if (!this._isSelected) {
      this._dataGraphic.alpha = 0;
    }
  }
  onObjectChange(change) {
    const {
      name,
      newValue,
      object
    } = change;
    if (name === 'x' || name === 'y' || name ==='z') {
      this.x = Number(object.x);
      this.y = Number(object.y);
      this.z = Number(object.z);
    }
    if (name === 'z' || name === 'y') {
      this.parent.parent.sortObjects();
    }
    if (name === 'filePath') {
      this.loadImage(newValue);
    }
    if (name === 'scaleX' || name === 'scaleY') {
      this.scale.x = Number(object.scaleX);
      this.scale.y = Number(object.scaleY);
      this._dataGraphic.scale.x = 1 / this.scale.x;
      this._dataGraphic.scale.y = 1 / this.scale.y;
    }
    if (name === 'angle') {
      const angle = Number(object.angle) || 0;
      this.rotation = angle * (Math.PI / 180);
      this._dataGraphic.rotation = -this.rotation;
    }
    if (name === 'anchorX' || name === 'anchorY') {
      this.anchor.x = Number(object.anchorX);
      this.anchor.y = Number(object.anchorY);
      this.drawData();
    }
    if (name === 'cols' || name === 'rows' || name === 'index') {
      this.setSprite(this._realTexture);
      this.drawData();
    }
    if (name === 'notes') {
      if (!this.cooldown) {
        this.makeMeta();
        this.applyMeta();
        this.drawData();
        this.cooldown = true;
        window.setTimeout(() => {
          this.cooldown = null;
        }, 1000);
      } else if (!this.requested) {
        this.requested = window.setTimeout(() => {
          this.makeMeta();
          this.applyMeta();
          this.drawData();
          this.requested = null;
        }, 1000);
      }
    }
    if (name === 'isQSprite') {
      if (newValue) {
        this._qSprite = {
          config: Store.getQSprite(newValue),
          pose: null
        }
        this.anchor.x = this._qSprite.config.anchorX;
        this.anchor.y = this._qSprite.config.anchorY;
      } else {
        this._qSprite = null;
      }
      this.setSprite(this._realTexture);
      this.drawData();
    }
    if (name === 'pose' && this._qSprite) {
      this._qSprite.pose = this._qSprite.config.poses[newValue];
    }
  }
  onMapObjectChange(change) {
    this._isSelected = change.newValue === this._obj;
    this._dataGraphic.alpha = this._isSelected ? 0.8 : 0;
  }
  drawData() {
    const {
      cols, rows,
      anchorX, anchorY,
    } = this._qSprite ? this._qSprite.config : this._obj;
    const {
      scaleX, scaleY
    } = this._obj;
    this.updateFrame();
    this._dataGraphic.clear();
    let width  = this.texture.baseTexture.width;
    let height = this.texture.baseTexture.height;
    width  = Math.floor(width / cols);
    height = Math.floor(height / rows);
    const ox = anchorX * width;
    const oy = anchorY * height;
    // edges
    this._dataGraphic.lineStyle(2, DATA_FILL, 1);
    this._dataGraphic.moveTo(-ox, -oy);
    this._dataGraphic.lineTo(-ox, height - oy);
    this._dataGraphic.lineTo(width - ox, height - oy);
    this._dataGraphic.lineTo(width - ox, -oy);
    this._dataGraphic.lineTo(-ox, -oy);
    this._dataGraphic.lineStyle(0);
    // vertices
    this._dataGraphic.lineStyle(2, DATA_OUTLINE, 1);
    this._dataGraphic.beginFill(DATA_FILL, 1);
    this._dataGraphic.drawCircle(-ox, -oy, 4);
    this._dataGraphic.drawCircle(-ox, height - oy, 4);
    this._dataGraphic.drawCircle(width - ox, height - oy, 4);
    this._dataGraphic.drawCircle(width - ox, -oy, 4);
    // anchor
    this._dataGraphic.beginFill(DATA_FILL_ANCHOR, 1);
    this._dataGraphic.drawCircle(0, 0, 4);
    this._dataGraphic.endFill();
    this._dataGraphic.lineStyle(0);
    if (this.meta) {
      if (this.meta.collider) {
        this.drawCollider(toAry(this.meta.collider || ''));
      } else if (this.meta.colliders) {
        let colliders = toObj(this.meta.colliders || '');
        for (let collider in colliders) {
          this.drawCollider(colliders[collider]);
        }
      }
    }
    this._dataGraphic.scale.x = 1 / scaleX;
    this._dataGraphic.scale.y = 1 / scaleY;
    this._dataGraphic.rotation = -this.rotation;
  }
  drawCollider(collider) {
    let type = collider[0];
    let w = collider[1] || 0;
    let h = collider[2] || 0;
    let ox = collider[3] || 0;
    let oy = collider[4] || 0;
    if (w === 0 || h === 0) return;
    const {
      anchorX, anchorY
    } = this._qSprite ? this._qSprite.config : this._obj;
    ox += this._obj.width * -anchorX;
    oy += this._obj.height * -anchorY;
    this._dataGraphic.beginFill(DATA_FILL_COLLIDER, 0.5);
    if (type === 'circle') {
      this._dataGraphic.drawEllipse(ox + w / 2, oy + h / 2, w / 2, h / 2);
    } else if (type === 'box') {
      this._dataGraphic.drawRect(ox, oy, w, h);
    } else if (type === 'poly') {
      ox = this._obj.width * -anchorX;
      oy = this._obj.height * -anchorY;
      const points = collider.slice(1).map(n => {
        if (n.constructor === PIXI.Point) {
          return new PIXI.Point(n.x + ox, n.y + oy);
        }
        return null;
      }).filter(n => {
        return n !== null;
      })
      this._dataGraphic.drawPolygon(points);
    }
    this._dataGraphic.endFill();
  }
  makeMeta() {
    const notes = this._obj.notes || '';
    const inlineRegex = /<([^<>:\/]+)(?::?)([^>]*)>/g;
    const blockRegex = /<([^<>:\/]+)>([\s\S]*?)<\/\1>/g;
    this.meta = {};
    for (;;) {
      var match = inlineRegex.exec(notes);
      if (match) {
        if (match[2] === '') {
          this.meta[match[1]] = true;
        } else {
          this.meta[match[1]] = match[2];
        }
      } else {
          break;
      }
    }
    for (;;) {
      var match = blockRegex.exec(notes);
      if (match) {
        this.meta[match[1]] = match[2];
      } else {
          break;
      }
    }
    this.applyMeta();
    return this.meta;
  }
  applyMeta() {
    if (this.meta.tint) {
      const tint = this.meta.tint.split(',').map(Number);
      if (tint.length > 1) {
        let r = (tint[0]).toString(16) || '00';
        let g = (tint[1]).toString(16) || '00';
        let b = (tint[2]).toString(16) || '00';
        if (r.length === 1) r += '0';
        if (g.length === 1) g += '0';
        if (b.length === 1) b += '0';
        const gray = tint[3] || 0;
        this.tint = parseInt(r + g + b, 16);
      }
    }
  }
  loadImage(filePath) {
    if (filePath) {
      filePath = path.join(Store.projectPath, filePath);
      const fileName = encodeURIComponent(path.basename(filePath));
      filePath = path.join(path.dirname(filePath), fileName);
      const texture = PIXI.BaseTexture.fromImage(filePath);
      texture.on('error', () => {
        this.texture = PIXI.Texture.EMPTY;
        Store.notify('ERROR', 'Failed to load image.');
      })
      if (texture.hasLoaded) {
        this.setSprite(texture);
        this.drawData();
        this.applyMeta();
      } else {
        texture.on('loaded', () => {
          this.setSprite(texture);
          this.drawData();
          this.applyMeta();
        })
      }
    } else {
      this.texture = PIXI.Texture.EMPTY;
    }
  }
  setSprite(texture) {
    this._frames = [];
    this._realTexture = texture;
    this._obj.width = 0;
    this._obj.height = 0;
    if (!texture) return;
    const {
      cols, rows
    } = this._qSprite ? this._qSprite.config : this._obj;
    const frameW = texture.width / cols;
    const frameH = texture.height / rows;
    for (let y = 0; y < rows; y++) {
      const y1 = y * frameH;
      for (let x = 0; x < cols; x++) {
        const x1 = x * frameW;
        const frame = new PIXI.Rectangle(x1, y1, frameW, frameH);
        this._frames.push(new PIXI.Texture(texture, frame));
      }
    }
    this._obj.width = frameW;
    this._obj.height = frameH;
  }
  update() {
    if (this.alpha === 0) return;
    if (this.meta) this.updateMeta();
    if (this._obj.type === 'animated' || this._qSprite) {
      this.updateAnimation();
    }
  }
  updateMeta() {
    if (this.meta.breath) {
      this.updateBreath();
    }
  }
  updateBreath() {
    const args = this.meta.breath.split(',').map(Number);
    if (args.length < 2) return;
    if (isNaN(args[0]) || isNaN(args[1])) return;
    const ot = args[2] || 0;
    const rt = ((this._tick2 + ot) % args[1]) / args[1];
    const s = Math.sin(rt * Math.PI * 2) * (args[0] / 100);
    this.scale = new PIXI.Point(1 + s, 1 + s);
    this._tick2 = (this._tick2 + 1) % args[1];
  }
  updateAnimation() {
    let { speed } = this._obj;
    if (this._qSprite && this._qSprite.pose) {
      speed = this._qSprite.pose.speed;
    }
    if (isNaN(this._obj.speed)) return;
    if (this._tick % this._obj.speed === 0) {
      this.updateFrame();
    }
    this._tick = (this._tick + 1) % this._obj.speed;
  }
  updateFrame() {
    if (!this._realTexture || this._frames.length === 0) {
      this.texture = PIXI.Texture.EMPTY;
      return;
    }
    if (this._obj.type === 'animated') {
      const frame = this._frames[this._frameI];
      if (frame) {
        this.texture = frame;
      }
      this._frameI = (this._frameI + 1) % this._frames.length;
    } else if (this._qSprite && this._qSprite.pose) {
      const { pattern } = this._qSprite.pose;
      const index = pattern[this._frameI];
      const frame = this._frames[index];
      if (frame) {
        this.texture = frame;
      }
      this._frameI = (this._frameI + 1) % pattern.length;
    } else {
      const frame = this._frames[this._obj.index];
      if (frame) {
        this.texture = frame;
      }
    }
  }
}
