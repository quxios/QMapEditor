import React from 'react'
import Store from './../store'

const ITEM_SHIFT = 10;

export default class ToolbarMapList extends React.Component {
  createList() {
    let list = [];
    this.props.mapList.forEach((map, index) => {
      if (map) {
        const isSelected = map.id === this.props.currentMap;
        const clss = 'item' + (isSelected ? ' selected' : '');
        const style = {
          paddingLeft: 5 + this.calcLeft(map.id),
          paddingRight: 5
        }
        const onClick2 = () => {
          this.onClick(map.id);
        }
        list[map.order] = (
          <li
            key={`map-${index}`}
            className={clss}
            style={style}
            onClick={onClick2}>
            {map.name}
          </li>
        )
      }
    })
    return list;
  }
  calcLeft(id) {
    let left = 0;
    let current = id;
    while (true) {
      if (this.props.mapList[current].parentId > 0) {
        left += ITEM_SHIFT;
      } else {
        break;
      }
      current = this.props.mapList[current].parentId;
    }
    return left;
  }
  onClick(index) {
    Store.selectMap(index, true);
  }
  render() {
    return (
      <div className="toolbar map">
        <div className="header">Map List</div>
        <ul>
          { this.createList() }
        </ul>
      </div>
    )
  }
}
