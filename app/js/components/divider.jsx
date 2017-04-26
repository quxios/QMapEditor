import React from 'react'

export default class Divider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dragging: false,
      y: 0
    }
  }
  onDragStart = (event) => {
    this.setState({
      dragging: true,
      y: event.pageY
    })
  }
  onDragEnd = (event) => {
    this.setState({ dragging: false });
  }
  onDrag = (event) => {
    if (this.state.dragging) {
      let dy = this.state.y - event.pageY;
      let block1 = { ...this.props.block1 };
      let block2 = { ...this.props.block2 };
      if (block1.height - dy < this.props.minHeight) {
        dy = block1.height - this.props.minHeight;
      }
      if (block2.height + dy < this.props.minHeight) {
        dy = block2.height - this.props.minHeight;
      }
      block1.height -= dy;
      block2.height += dy;
      this.props.onResizeBlocks(block1, block2);
      this.setState({
        y: event.pageY
      })
    }
  }
  render() {
    const wrapper = {
      position: 'absolute',
      top: 0,
      height: '100%',
      width: '100%',
      display: this.state.dragging ? 'block' : 'none',
      cursor: 'ns-resize'
    }
    return (
      <div>
        <div
          className='divider'
          onMouseDown={this.onDragStart}
          onMouseUp={this.onDragEnd}
        />
        <div
          style={wrapper}
          onMouseMove={this.onDrag}
          onMouseOut={this.onDragEnd}
          onMouseUp={this.onDragEnd}
        />
      </div>
    )
  }
}
