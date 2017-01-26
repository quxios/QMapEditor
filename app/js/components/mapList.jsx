import React from 'react'
import Manager from './../manager'
import { selectMap } from './../manager/actions'
import Item from './listItem'

const _itemShift = 10;

export default class MapList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mapList: Manager.state.mapList
    }
    this.getStates = ::this.getStates;
  }
  componentWillMount() {
    Manager.on('UPDATE_STATE', this.getStates);
  }
  componentWillUnmount() {
    Manager.remove('UPDATE_STATE', this.getStates);
  }
  getStates(newStates) {
    const { mapList } = newStates;
    this.setState({ mapList });
  }
  calcLeft(id) {
    let left = 0;
    let current = id;
    while (true) {
      if (this.state.mapList[current].parentId > 0) {
        left += _itemShift;
      } else {
        break;
      }
      current = this.state.mapList[current].parentId;
    }
    return left;
  }
  createList() {
    let list = [];
    this.state.mapList.forEach(map => {
      if (map) {
        let left = this.calcLeft(map.id);
        list[map.order] = (
          <Item
            name={map.name}
            type='map'
            id={map.id}
            key={`map${map.id}`}
            left={left}
            onClick={this.onClick.bind(this, map.id)}
          />
        )
      }
    })
    return list;
  }
  onClick(id) {
    Manager.run(selectMap(id));
  }
  render() {
    let style = { ...this.props.style };
    style.height -= 35; // header height
    return (
      <div className='block'>
        <h1 className='header'>Map List</h1>
        <div className='listContainer' style={style} >
          <div className='list'>
            { this.createList() }
          </div>
        </div>
      </div>
    )
  }
}
