import React from 'react'
import Store from '../store'
import { observer } from 'mobx-react'

@observer
export default class ContextMenu extends React.Component {
  onVeilClick = (e) => {
    Store.clearContext();
    // TODO pass event through events behind veil
    //e.target.style.display = 'none';
    //const elem = document.elementFromPoint(e.clientX, e.clientY);
    //elem.click();
  }
  render() {
    const {
      open,
      x, y,
      items
    } = this.props.context;
    const style = {
      top: y,
      left: x,
      display: open ? 'block' : 'none'
    }
    const veilStyle = {
      display: open ? 'block' : 'none'
    }
    const list = items.map((item, i) => {
      const title = item.title;
      const handler = () => {
        item.handler();
        Store.clearContext();
      }
      return (
        <div key={`context-${i}`} onClick={handler} className="item">
          {title}
        </div>
      )
    })
    return (
      <div>
        <div
          className="veil"
          style={veilStyle}
          onClick={this.onVeilClick}
          onContextMenu={this.onVeilClick}
        />
        <div className="contextMenu" style={style}>
          { list }
        </div>
      </div>
    )
  }
}
