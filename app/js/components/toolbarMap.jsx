import React from 'react'
import { ipcRenderer } from 'electron'

import MapList from './mapList'
//import MapProps from './mapProperties'
//import Divider from './divider'

const _offsetHeight = 34; // menubar height

export default class ToolbarMap extends React.Component {
  constructor() {
    super();
    const height = ipcRenderer.sendSync('getContentSize')[1] - _offsetHeight;
    this.state = {
      height,
      block1: { height: height / 2 },
      block2: { height: height / 2 }
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
    const style = {
      height: this.state.height
    }
    return (
      <div className='toolbar map' style={style}>
        <MapList style={{...style}} />
        {/*
        <Divider
          maxHeight={this.state.height}
          onResizeBlocks={::this.onResizeBlocks}
          block1={this.state.block1}
          block2={this.state.block2}
        />
        <MapProps style={this.state.block2} />
        */}
      </div>
    )
  }
}
