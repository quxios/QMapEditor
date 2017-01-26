import React from 'react'
import Manager from './../manager'
import { screenshot, selectObject, closeContext } from './../manager/actions'
import { ipcRenderer, screen } from 'electron'

import Stage from './../display/stage'

const _menuBarHeight = 34; // .menubar height
const _toolbarWidth  = 250;

export default class Canvas extends React.Component {
  constructor(props) {
    super(props);
    const winSize = ipcRenderer.sendSync('getContentSize');
    const width = winSize[0];
    const height = winSize[1];
    this.state = {
      width,
      height
    }
    this.onResize = ::this.onResize;
    this.onMouseUp = ::this.onMouseUp;
    this.onScreenshot = ::this.onScreenshot;
  }
  get width() {
    return this.state.width - _toolbarWidth * ( this.props.validMap ? 2 : 1);
  }
  get height() {
    return this.state.height - _menuBarHeight;
  }
  componentWillMount() {
    Manager.on('SCREENSHOT', this.onScreenshot);
    ipcRenderer.on('resize', this.onResize);
    window.addEventListener('mouseup', this.onMouseUp);
  }
  componentDidMount() {
    this.setupPixi();
  }
  componentWillUnmount() {
    Manager.removeListener('SCREENSHOT', this.onScreenshot);
    ipcRenderer.removeListener('resize', this.onResize);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.ticker = null;
  }
  setupPixi() {
    this.renderer = new PIXI.WebGLRenderer(this.width, this.height, {
      view: this.canvas,
      transparent: true,
      roundPixels: true,
      antialias: true
    })
    this.ticker = new PIXI.ticker.Ticker();
    this.ticker.add(::this.updatePIXI)
    this.ticker.start();
  }
  updatePIXI() {
    this.renderer.render(Stage);
    if (this._isDragging) {
      this.updateDrag();
    }
  }
  updateDrag() {
    const { x, y } = screen.getCursorScreenPoint();
    const dx = this._mouseX - x;
    const dy = this._mouseY - y;
    Stage.x -= dx;
    Stage.y -= dy;
    this._mouseX = x;
    this._mouseY = y;
  }
  onResize(event, width, height) { // called from electron
    this.setState({ width, height }, () => {
      this.renderer.resize(this.width, this.height);
    });
  }
  onMouseDown(event) { // called from react canvas
    Manager.run(closeContext())
    if (event.button === 1) { // Middle Mouse Button
      const { x, y } = screen.getCursorScreenPoint();
      this._mouseX = x;
      this._mouseY = y;
      this._isDragging = true;
    }
  }
  onMouseUp(event) { // called from window
    if (this._isDragging && event.button === 1) { // Middle Mouse Button
      this._isDragging = false;
    }
  }
  onClick(event) {
    this.canvas.focus();
  }
  onWheel(event) { // called from react canvas
    const x = event.pageX - event.target.offsetLeft;
    const y = event.pageY - event.target.offsetTop;
    Stage.zoomAt(x, y, event.deltaY);
  }
  onScreenshot() {
    if (!this.renderer) return;
    if (Stage && Stage._selectedMap > 0) {
      const width  = Stage._mapWidth * Stage._gridWidth;
      const height = Stage._mapHeight * Stage._gridHeight;
      const renderTexture = PIXI.RenderTexture.create(width, height);
      const selected = Manager.state.selectedObj;
      const oldX = Stage.x;
      const oldY = Stage.y;
      const oldScaleX = Stage.scale.x;
      const oldScaleY = Stage.scale.y;
      Stage.x = 0;
      Stage.y = 0;
      Stage.scale.x = 1;
      Stage.scale.y = 1;
      Manager.run(selectObject(-1));
      this.renderer.render(Stage, renderTexture);
      let image = this.renderer.extract.base64(renderTexture);
      image = image.replace(/^data:image\/\w+;base64,/, '');
      Manager.run(screenshot(image));
      Manager.run(selectObject(selected));
      Stage.x = oldX;
      Stage.y = oldY;
      Stage.scale.x = oldScaleX;
      Stage.scale.y = oldScaleY;
      renderTexture.destroy(true);
    }
  }
  render() {
    if (this.renderer) {
      this.renderer.resize(this.width, this.height);
    }
    const style = {
      position: 'absolute',
      top: _menuBarHeight,
      left: _toolbarWidth
    }
    return (
        <canvas
          tabIndex='0'
          ref={canvas => { this.canvas = canvas; }}
          onClick={::this.onClick}
          onMouseDown={::this.onMouseDown}
          onWheel={::this.onWheel}
          style={style}
        />
    )
  }
}
