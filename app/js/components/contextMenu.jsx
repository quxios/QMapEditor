import React from 'react'
import Manager from './../manager'
import { ipcRenderer } from 'electron'
import { closeContext } from './../manager/actions'

export default class ContextMenu extends React.Component {
  constructor() {
    super();
    this.state = {
      items: [],
      top: 0,
      left: 0,
      visible: false,
      winWidth: ipcRenderer.sendSync('getContentSize')[0],
      winHeight: ipcRenderer.sendSync('getContentSize')[1]
    }
    this.setContext = ::this.setContext;
    this.closeContext = ::this.closeContext;
    this.onResize = ::this.onResize;
  }
  componentWillMount() {
    Manager.on('SET_CONTEXT', this.setContext)
    Manager.on('CLOSE_CONTEXT', this.closeContext)
    ipcRenderer.on('resize', this.onResize)
  }
  onResize(event, winWidth, winHeight) {
    this.setState({ winWidth, winHeight })
  }
  setContext(items, top, left) {
    this.setState({ items, top, left, visible: true })
  }
  closeContext() {
    this.setState({ visible: false })
  }
  onVeilClick() {
    Manager.run(closeContext())
  }
  render() {
    const style = {
      top: this.state.top,
      left: this.state.left,
      display: this.state.visible ? 'block' : 'none'
    }
    const veilStyle = {
      width: this.state.winWidth,
      height: this.state.winHeight,
      display: this.state.visible ? 'block' : 'none'
    }
    const items = this.state.items.map((item, i) => {
      let title = item.title;
      let handler = item.handler;
      return <div key={i} onClick={handler} className='item'>{title}</div>;
    })
    return (
      <div>
        <div
          className='veil'
          style={veilStyle}
          onClick={::this.onVeilClick}>
        </div>
        <div className='contextMenu' style={style}>
          {items}
        </div>
      </div>
    )
  }
}
