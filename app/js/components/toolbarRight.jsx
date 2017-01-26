import React from 'react'
import { ipcRenderer } from 'electron'

import ObjProperties from './objProperties'

const _offsetHeight = 34; // menubar height

export default class ToolbarObj extends React.Component {
  constructor() {
    super();
    const height = ipcRenderer.sendSync('getContentSize')[1] - _offsetHeight;
    this.state = {
      height
    }
    this.onResize = ::this.onResize;
  }
  componentWillMount() {
    ipcRenderer.on('resize', this.onResize);
  }
  componentWillUnmount() {
    ipcRenderer.removeListener('resize', this.onResize);
  }
  onResize(event, width, height) {
    height -= _offsetHeight;
    this.setState({ height });
  }
  render() {
    const style = {
      height: this.state.height
    }
    return (
      <div className='toolbar obj' style={style}>
        <ObjProperties style={style} />
      </div>
    )
  }
}
