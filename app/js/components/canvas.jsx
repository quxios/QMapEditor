import React from 'react'
import Store from './../manager/store'
import Manager from './../manager'
import { ipcRenderer, screen } from 'electron'

import Stage from './../display/stage'

const MENUBAR_HEIGHT = 34;

export default class Canvas extends React.Component {
  componentWillMount() {
    ipcRenderer.on('resize', this.onResize);
    window.addEventListener('mouseup', this.onMouseUp);
  }
  componentDidMount() {
    let winSize = ipcRenderer.sendSync('getContentSize');
    winSize[1] -= MENUBAR_HEIGHT;
    this.renderer = Manager.renderer = new PIXI.WebGLRenderer(winSize[0], winSize[1], {
      view: this.canvas,
      transparent: true,
      roundPixels: true,
      antialias: true
    })
    Manager.ticker = new PIXI.ticker.Ticker();
    Manager.ticker.add(this.updatePIXI)
    Manager.ticker.start();
  }
  componentWillUnmount() {
    ipcRenderer.removeListener('resize', this.onResize);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.ticker = null;
  }
  updatePIXI = () => {
    this.renderer.render(Stage);
    Stage.update();
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
  onResize = (event, width, height) => {
    height -= MENUBAR_HEIGHT;
    this.renderer.resize(width, height);
  }
  onClick = (event) => {
    this.canvas.focus();
  }
  onMouseDown = (event) => {
    if (this.props.currentMap === -1) return;
    if (event.button === 1 || event.button === 2) {
      const { x, y } = screen.getCursorScreenPoint();
      this._mouseX = x;
      this._mouseY = y;
      this._isDragging = true;
      this._draggingWith = event.button;
    }
  }
  onMouseUp = (event) => {
    if (this.props.currentMap === -1) return;
    if (this._isDragging && event.button === this._draggingWith) {
      this._isDragging = false;
    }
  }
  onWheel = (event) => {
    if (this.props.currentMap === -1) return;
    const x = event.pageX - event.target.offsetLeft;
    const y = event.pageY - event.target.offsetTop;
    Stage.zoomAt(x, y, event.deltaY);
  }
  shouldComponentUpdate(nextProps, nextState) {
    return false;
  }
  render() {
    return (
      <canvas
        className="pixi"
        tabIndex="0"
        ref={(ref) => { this.canvas = ref; }}
        onClick={this.onClick}
        onMouseDown={this.onMouseDown}
        onWheel={this.onWheel}
      />
    )
  }
}
