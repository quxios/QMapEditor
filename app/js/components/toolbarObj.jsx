import React from 'react'
import { ipcRenderer } from 'electron'

import ObjList from './objList'
import ObjProperties from './objProperties'
import Divider from './divider'

const _offsetHeight = 34; // menubar height

export default class ToolbarObj extends React.Component {
  constructor() {
    super();
    const height = ipcRenderer.sendSync('getContentSize')[1] - _offsetHeight;
    this.state = {
      height,
      block1: { height: height / 2 },
      block2: { height: height / 2 },
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
  onResizeBlocks(block1, block2) {
    this.setState({
      block1,
      block2
    })
  }
  render() {
    return (
      <div className='toolbar obj' style={{ height: this.state.height }}>
        <ObjList style={this.state.block1} />
        <Divider
          maxHeight={this.state.height}
          onResizeBlocks={::this.onResizeBlocks}
          block1={this.state.block1}
          block2={this.state.block2}
        />
        <ObjProperties style={this.state.block2} />
      </div>
    )
  }
}
