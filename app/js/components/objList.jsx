import React from 'react'
import Manager from './../manager'
import {
  addObject,
  deleteObject,
  deleteAllObjects,
  selectObject,
  copyObject,
  setContext,
  closeContext
} from './../manager/actions'

import Item from './listItem'

export default class ObjList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedObj: Manager.state.selectedObj,
      mapObjects: Manager.state.mapObjects
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
    const { selectedObj, mapObjects } = newStates;
    this.setState({ selectedObj, mapObjects });
  }
  createList() {
    let list = [];
    this.state.mapObjects.forEach((obj, i) => {
      list[i] = (
        <Item
          name={obj.name}
          type='obj'
          id={obj}
          key={i}
          onClick={this.onClick.bind(this, obj)}
          onContextMenu={this.onContext.bind(this, obj)}
        />
      )
    })
    return list;
  }
  onClick(obj, event) {
    event.stopPropagation();
    if (this.state.selectObject === obj) {
      obj = -1;
    }
    Manager.run(selectObject(obj));
  }
  onContext(obj, event) {
    event.stopPropagation();
    this.onClick(obj, event);
    let items = [];
    items.push({ title: 'Duplicate', handler: this.onDuplicate.bind(this, obj) })
    items.push({ title: 'Delete', handler: this.onDelete.bind(this, obj) })
    Manager.run(setContext(items, event.pageY, event.pageX))
  }
  deselect() {
    Manager.run(selectObject(-1));
  }
  onAdd() {
    Manager.run(addObject());
  }
  onDuplicate(obj, event) {
    Manager.run(copyObject(obj));
    Manager.run(closeContext());
  }
  onDelete(obj, event) {
    Manager.run(deleteObject(obj));
    Manager.run(closeContext());
  }
  onDeleteAll() {
    Manager.run(deleteAllObjects());
  }
  render() {
    let style = { ...this.props.style };
    style.height -= 35 + 30;// + 5 + 12; // header height, footer height, divider and padding
    const list = this.createList();
    return (
      <div className='block' style={this.props.style}>
        <h1 className='header'>Object List</h1>
        <div className='listContainer' style={style} onClick={::this.deselect}>
          <div className='list'>
            { list }
          </div>
        </div>
        <div className='footer'>
          <button onClick={::this.onAdd}>
            Add
          </button>
          { this.state.selectedObj !== -1 ?
              <button onClick={this.onDelete.bind(this, this.state.selectedObj)}>
                Delete
              </button>
            :
              <button onClick={::this.onDeleteAll}>
                Delete All
              </button>
          }
        </div>
      </div>
    )
  }
}
