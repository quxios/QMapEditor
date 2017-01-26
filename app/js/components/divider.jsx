import React from 'react'

const _maxHeight = 200;

export default class Divider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dragging: false,
      y: 0
    }
  }
  onDragStart(event) {
    this.setState({
      dragging: true,
      y: event.pageY
    })
  }
  onDragEnd(event) {
    this.setState({ dragging: false })
  }
  onDrag(event) {
    if (this.state.dragging) {
      const dy = this.state.y - event.pageY;
      let block1 = { ...this.props.block1 };
      block1.height -= dy;
      let block2 = { ...this.props.block2 };
      block2.height += dy;
      if (block1.height < _maxHeight) {
        block1.height = _maxHeight;
        block2.height = this.props.maxHeight - _maxHeight;
      }
      if (block2.height < _maxHeight) {
        var dh = block2.height - _maxHeight;
        block2.height = _maxHeight;
        block1.height = this.props.maxHeight - _maxHeight;
      }
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
          onMouseDown={::this.onDragStart}
          onMouseUp={::this.onDragEnd}
        />
        <div
          style={wrapper}
          onMouseMove={::this.onDrag}
          onMouseOut={::this.onDragEnd}
          onMouseUp={::this.onDragEnd}
        />
      </div>
    )
  }
}
