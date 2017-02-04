import * as fs from 'fs'
import Manager from './../manager'
import Input from './../manager/input'

import { selectObject, updateObject, sortObjects } from './../manager/actions'

const _dataOutline = 0xFFFFFF;
const _dataFill = 0x29B6F6;
const _dataFillAnchor = 0xF44336;
const _dataFillCollider = 0xAA0000;

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
  return string.split(',').map(function(s) {
    s = s.trim();
    if (/^-?\d+\.?\d*$/.test(s)) return Number(s);
    if (s === 'true') return true;
    if (s === 'false') return false;
    if (s === 'null' || s === '') return null;
    return s;
  })
};

export default class Sprite extends PIXI.Sprite {
  constructor(obj) {
    super();
    this._obj = obj;
    this._isSelected = false;
    this._dataGraphic = new PIXI.Graphics();
    this._dataGraphic.alpha = 0;
    this.addChild(this._dataGraphic);
    this.addListeners();
    this.updateState(Manager.state);
    this.updateObject(this._obj);
  }
  addListeners() {
    this.updateState = ::this.updateState;
    this.updateObject = ::this.updateObject;
    this.updateSelect = ::this.updateSelect;
    Manager.on('UPDATE_STATE', this.updateState);
    Manager.on('UPDATE_OBJECT', this.updateObject);
    Manager.on('SELECT_OBJECT', this.updateSelect);
    this.buttonMode = true;
    this.interactive = true;
    this.on('mousedown', ::this.startDrag);
    this.on('mouseup', ::this.endDrag);
    this.on('mouseupoutside', ::this.endDrag);
    this.on('mousemove', ::this.onDrag);
    this.on('mouseover', ::this.onOver);
    this.on('mouseout', ::this.onOut);
  }
  removeListeners() {
    Manager.remove('UPDATE_STATE', this.updateState);
    Manager.remove('UPDATE_OBJECT', this.updateObject);
    Manager.remove('SELECT_OBJECT', this.updateSelect);
  }
  startDrag(event) {
    if (event.data.originalEvent.button === 0) { // Leftclick
      this._prevPos = { ...event.data.global };
      this._dragging = true;
      this.alpha = 0.7;
      Manager.run(selectObject(this._obj));
    }
  }
  endDrag(event) {
    if (this._dragging) {
      this._data = null;
      this._dragging = false;
      this.alpha = 1;
      Manager.run(updateObject(this._obj, {
        x: this.x,
        y: this.y
      }));
    }
  }
  onDrag(event) {
    if (this._dragging) {
      const newPos = event.data.global;
      const dx = newPos.x - this._prevPos.x;
      const dy = newPos.y - this._prevPos.y;
      var x = this.x + dx / this.parent.parent.scale.x;
      var y = this.y + dy / this.parent.parent.scale.y;
      this.x = this.adjustXWithSnap(this.x, x);
      this.y = this.adjustYWithSnap(this.y, y);
      this._prevPos = { ...event.data.global };
      Manager.run(updateObject(this._obj, {
        x: Math.round(this.x),
        y: Math.round(this.y)
      }, true));
    }
  }
  adjustXWithSnap(prevX, nextX) {
    if (Input.isPressed(0x12)) return nextX;
    prevX += this.width * -this.anchor.x;
    nextX += this.width * -this.anchor.x;
    let dx = nextX - prevX;
    let gridPos = nextX / this._gridWidth;
    let snapTo;
    if (dx > 0) {
      snapTo = Math.ceil(gridPos + 0.005) * this._gridWidth;
      if (snapTo - nextX < 10) {
        nextX = snapTo;
      } else if (snapTo - nextX > this._gridWidth - 2) {
        nextX = snapTo - this._gridWidth;
      }
    } else if (dx < 0) {
      snapTo = Math.floor(gridPos - 0.005) * this._gridWidth;
      if (nextX - snapTo < 10) {
        nextX = snapTo;
      } else if (nextX - snapTo > this._gridWidth - 2) {
        nextX = snapTo + this._gridWidth;
      }
    }
    return nextX += this.width * this.anchor.x;
  }
  adjustYWithSnap(prevY, nextY) {
    if (Input.isPressed(0x12)) return nextY;
    prevY += this.height * -this.anchor.y;
    nextY += this.height * -this.anchor.y;
    let dy = nextY - prevY;
    let gridPos = nextY / this._gridHeight;
    let snapTo;
    if (dy > 0) {
      snapTo = Math.ceil(gridPos + 0.005) * this._gridHeight;
      if (snapTo - nextY < 10) {
        nextY = snapTo;
      } else if (snapTo - nextY > this._gridHeight - 2) {
        nextY = snapTo - this._gridHeight;
      }
    } else if (dy < 0) {
      snapTo = Math.floor(gridPos - 0.005) * this._gridHeight;
      if (nextY - snapTo < 10) {
        nextY = snapTo;
      } else if (nextY - snapTo > this._gridHeight - 2) {
        nextY = snapTo + this._gridHeight;
      }
    }
    return nextY += this.height * this.anchor.y;
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
  drawData() {
    this.updateFrame();
    this._dataGraphic.clear();
    let width  = this.texture.baseTexture.width;
    let height = this.texture.baseTexture.height;
    width  = Math.floor(width / this.cols);
    height = Math.floor(height / this.rows);
    const ox = this.anchor.x * width;
    const oy = this.anchor.y * height;
    // edges
    this._dataGraphic.lineStyle(2, _dataFill, 1);
    this._dataGraphic.moveTo(-ox, -oy);
    this._dataGraphic.lineTo(-ox, height - oy);
    this._dataGraphic.lineTo(width - ox, height - oy);
    this._dataGraphic.lineTo(width - ox, -oy);
    this._dataGraphic.lineTo(-ox, -oy);
    this._dataGraphic.lineStyle(0);
    // vertices
    this._dataGraphic.lineStyle(2, _dataOutline, 1);
    this._dataGraphic.beginFill(_dataFill, 1);
    this._dataGraphic.drawCircle(-ox, -oy, 4);
    this._dataGraphic.drawCircle(-ox, height - oy, 4);
    this._dataGraphic.drawCircle(width - ox, height - oy, 4);
    this._dataGraphic.drawCircle(width - ox, -oy, 4);
    // anchor
    this._dataGraphic.beginFill(_dataFillAnchor, 1);
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
  }
  drawCollider(collider) {
    let w = collider[1] || 0;
    let h = collider[2] || 0;
    let ox = collider[3] || 0;
    let oy = collider[4] || 0;
    if (w === 0 || h === 0) return;
    ox += this._frameW * -this.anchor.x;
    oy += this._frameH * -this.anchor.y;
    this._dataGraphic.beginFill(_dataFillCollider, 0.5);
    this._dataGraphic.drawRect(ox, oy, w, h);
    this._dataGraphic.endFill();
  }
  updateState(newState) {
    const {
      projectPath,
      gridWidth,
      gridHeight
    } = newState;
    this._projectPath = projectPath;
    this._gridWidth = gridWidth;
    this._gridHeight = gridHeight;
  }
  updateSelect(obj) {
    this._isSelected = this._obj === obj;
    this._dataGraphic.alpha = this._isSelected ? 1 : 0;
    Manager.run(sortObjects());
  }
  updateObject(obj) {
    if (this._obj !== obj) return;
    const newObjData = obj;
    const oldY = this.y;
    this.x = newObjData.x;
    this.y = newObjData.y;
    this.z = newObjData.z;
    this.cols  = newObjData.cols;
    this.rows  = newObjData.rows;
    this.index = newObjData.index;
    let needsRedraw = true;
    if (this.notes !== newObjData.notes) {
      this.notes = newObjData.notes;
      this.makeMeta();
      needsRedraw = true;
    }
    if (this.filePath !== newObjData.filePath) {
      this.loadImage(newObjData.filePath);
      needsRedraw = false;
    }
    if (needsRedraw || (this.anchor.x !== newObjData.anchorX || this.anchor.y !== newObjData.anchorY)) {
      this.anchor.x = newObjData.anchorX;
      this.anchor.y = newObjData.anchorY;
      this.drawData();
    }
  }
  makeMeta() {
    const notes = this.notes || '';
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
    return this.meta;
  };
  updateFrame() {
    const width  = this.texture.baseTexture.width;
    const height = this.texture.baseTexture.height;
    const frameW = Math.floor(width / this.cols);
    const frameH = Math.floor(height / this.rows);
    const index  = this.index;
    let x = index % this.cols;
    let y = (index - x) / this.cols;
    x *= frameW;
    y *= frameH;
    if (x + frameW <= width && y + frameH <= height) {
      if (this._frameW !== frameW || this._frameH !== frameH) {
        this._frameW = frameW;
        this._frameH = frameH;
        Manager.run(updateObject(this._obj, {
          width: frameW,
          height: frameH
        }));
      }
      this.texture.frame = new PIXI.Rectangle(x, y, frameW, frameH);
    }
  }
  loadImage(filePath) {
    this.filePath = filePath;
    if (filePath === '') return;
    filePath = this._projectPath + '\\' + filePath;
    fs.stat(filePath, (err, stats) => {
      if (!err && stats.isFile()) {
        filePath = filePath.replace('#', '%23');
        let loader = new PIXI.loaders.Loader()
          .add('sprite', filePath)
          .load((loader, resources) => {
            this.texture = new PIXI.Texture(resources.sprite.texture.baseTexture);
            this.drawData();
          })
        loader = null;
      } else {
        console.log('Error:', err);
        this.texture = PIXI.Texture.EMPTY;
      }
    })
  }
}
