import React from 'react'
import Store from './../store'
import { observer } from 'mobx-react'
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

const SortableItem = SortableElement(({value, i, onClick, onContext, left, isSelected, isContextSelected}) => {
  const onClick2 = (e) => {
    if (onClick) onClick(e, i);
  }
  const onContext2 = (e) => {
    if (onContext) onContext(e, i);
  }
  let cls = isSelected ? 'selected' : '';
  //let clss = 'item' + (isSelected ? ' selected' : '');
  if (isContextSelected) cls += ' contextSelected';
  return (
    <li className={cls} onClick={onClick2} onContextMenu={onContext2}>
      <i className="handle" aria-hidden />
      <a>{value}</a>
    </li>
  )
});

const SortableList = SortableContainer(observer(({items, onClick, onContextMenu, selected, selectedContext}) => {
  return (
    <ul>
      {items.map((value, index) => {
        return (
          <SortableItem
            key={`obj-${index}`}
            index={index}
            i={index}
            value={value.name}
            onClick={onClick}
            onContext={onContextMenu}
            isSelected={selected === index}
            isContextSelected={selectedContext === index}
          />
        )
      })}
    </ul>
  );
}));

export default class ToolbarObjList extends React.Component {
  onSortStart = (data, e) => {
    Store.selectMapObj(data.index);
  }
  onSortEnd = (data, e) => {
    Store.moveMapObj(data);
    Store.selectMapObj(data.newIndex);
  }
  onClick = (e, i) => {
    Store.selectMapObj(i, true);
    e.stopPropagation();
  }
  onContextMenu = (e, i) => {
    const {
      clientX,
      clientY
    } = e.nativeEvent;
    Store.openContext(clientX, clientY, 'mapObj', i);
    e.stopPropagation();
  }
  onDelete = () => {
    Store.deleteMapObj(this.props.currentMapObj);
  }
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.currentMap !== this.props.currentMap ||
      nextProps.currentMapObj !== this.props.currentMapObj ||
      nextProps.mapObjects !== this.props.mapObjects ||
      nextProps.selectedContext !== this.props.selectedContext
  }
  body() {
    const {
      mapObjects,
      currentMap,
      currentMapObj,
      selectedContext
    } = this.props;
    return (
      <div style={{height: '100%'}}>
        <div className="header">
          Map Objects
        </div>
        <SortableList
          items={mapObjects}
          onSortEnd={this.onSortEnd}
          onClick={this.onClick}
          onContextMenu={this.onContextMenu}
          selected={currentMapObj}
          selectedContext={selectedContext}
          distance={5}
          transitionDuration={200}
          lockAxis="y"
          lockToContainerEdges
          helperClass="sortHelperList"
        />
        <div className="footer">
          <button onClick={::Store.addMapObj}>
            <i className="fa fa-plus" aria-hidden />
            New
          </button>
          { currentMapObj !== -1 && this.delButton() }
        </div>
      </div>
    )
  }
  delButton() {
    return (
      <button onClick={this.onDelete}>
        <i className="fa fa-minus" aria-hidden />
        Delete
      </button>
    )
  }
  render() {
    const {
      currentMap,
      currentMapObj
    } = this.props;
    const show = currentMap > 0;
    const style = {
      left: show ? 175 : 0
    }
    return (
      <div className="toolbar mapObjs" style={style}>
        { show && this.body() }
      </div>
    )
  }
}
