import React from 'react'
import Manager from './../manager'

export default class Item extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedMap: Manager.state.selectedMap,
      selectedObj: Manager.state.selectedObj
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
    const { selectedMap, selectedObj } = newStates;
    this.setState({ selectedMap, selectedObj });
  }
  isSelected() {
    if (this.props.type === 'map') {
      return this.state.selectedMap === this.props.id;
    }
    if (this.props.type === 'obj') {
      return this.state.selectedObj === this.props.id;
    }
    return false;
  }
  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.selectedMap !== this.props.selectedMap) {
      return true;
    }
    if (nextState.selectedObj !== this.props.selectedObj && this.props.type === 'obj') {
      return true;
    }
    return false;
  }
  render() {
    const style = {
      paddingLeft: 5 + (this.props.left || 0),
      paddingRight: 5
    }
    let itemClasses = 'item';
    if (this.isSelected()) itemClasses += ' selected';
    return (
      <div
        className={itemClasses}
        style={style}
        onClick={this.props.onClick}
        onContextMenu={this.props.onContextMenu}>
        {this.props.name}
      </div>
    )
  }
}
