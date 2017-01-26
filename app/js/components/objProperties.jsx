import React from 'react'
import Manager from './../manager'
import { updateObject } from './../manager/actions'
import { remote } from 'electron'
const dialog = remote.dialog

//import Stage from './../display/stage'

const _intRegex  = /^-?[0-9]*$/; // positive and negative
const _int2Regex = /^[0-9]*$/;   // positive only
const _decimalRegex = /^-?[0-9]*(.[0-9]*)?$/;

export default class ObjProperties extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedObj: Manager.state.selectedObj,
      mapObjects: Manager.state.mapObjects,
      projectPath: Manager.state.projectPath,
      name: '',
      x: 0, y: 0, z: 0,
      anchorX: 0, anchorY: 0,
      filePath: '', type: '',
      cols: 0,  rows: 0, index: 0,
      notes: ''
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
    const { selectedObj, mapObjects, projectPath } = newStates;
    const newState = {
      selectedObj,
      mapObjects,
      projectPath
    }
    if (selectedObj !== -1) {
      const data = selectedObj;
      this.setState({ ...data, ...newState, valid: true });
    } else {
      this.setState({ ...newState, valid: false });
    }
  }
  onNameChange(event) {
    const name = event.target.value;
    this.setState({ name });
  }
  onFile() {
    dialog.showOpenDialog({
      title: 'Select Image',
      filters: [
        { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
      ]
    }, ::this.doLoad)
  }
  onTypeChange(event) {
    const type = event.target.value;
    let { cols, rows, index} = this.state;
    if (type === 'full') {
      cols = 1;
      rows = 1;
      index = 0;
    }
    this.setState({ type, cols, rows, index }, ::this.onBlur);
  }
  onPosXChange(event) {
    const x = event.target.value;
    if (_intRegex.test(x)) {
      this.setState({ x });
    } else {
      // send an error on invalid input
    }
  }
  onPosYChange(event) {
    const y = event.target.value;
    if (_intRegex.test(y)) {
      this.setState({ y });
    } else {
      // send an error on invalid input
    }
  }
  onPosZChange(event) {
    const z = event.target.value;
    if (_intRegex.test(z)) {
      this.setState({ z });
    } else {
      // send an error on invalid input
    }
  }
  onAnchorXChange(event) {
    const anchorX = event.target.value;
    if (_decimalRegex.test(anchorX)) {
      this.setState({ anchorX });
    } else {
      // send an error on invalid input
    }
  }
  onAnchorYChange(event) {
    const anchorY = event.target.value;
    if (_decimalRegex.test(anchorY)) {
      this.setState({ anchorY });
    } else {
      // send an error on invalid input
    }
  }
  onColsChange(event) {
    const cols = event.target.value;
    if (_int2Regex.test(cols)) {
      this.setState({ cols });
    } else {
      // send an error on invalid input
    }
  }
  onRowsChange(event) {
    const rows = event.target.value;
    if (_int2Regex.test(rows)) {
      this.setState({ rows });
    } else {
      // send an error on invalid input
    }
  }
  onIndexChange(event) {
    const index = event.target.value;
    const maxI = this.state.rows * this.state.cols;
    if (index >= 0 && index < maxI) {
      this.setState({ index });
    } else {
      // send an error on invalid input
    }
  }
  onNotesChange(event) {
    const notes = event.target.value;
    this.setState({ notes }, ::this.onBlur);
  }
  doLoad(filePaths) {
    if (filePaths) {
      var path = filePaths[0].replace(this.state.projectPath + '\\', '');
      Manager.run(updateObject(this.state.selectedObj, {
        filePath: path
      }))
    }
  }
  onBlur() {
    const newState = {
      name: this.state.name,
      filePath: this.state.filePath,
      type: this.state.type,
      x: Number(this.state.x) || 0,
      y: Number(this.state.y) || 0,
      z: Number(this.state.z) || 0,
      anchorX: Number(this.state.anchorX) || 0,
      anchorY: Number(this.state.anchorY) || 0,
      cols: Number(this.state.cols) || 0,
      rows: Number(this.state.rows) || 0,
      index: Number(this.state.index) || 0,
      notes: this.state.notes
    }
    Manager.run(updateObject(this.state.selectedObj, newState));
  }
  checkEnter(event) {
    if (event.keyCode === 13) {
      event.target.dispatchEvent(new Event('blur', { bubbles: true }));
    }
  }
  render() {
    if (!this.state.valid) return null;
    const {
      name,
      x, y, z,
      anchorX, anchorY,
      filePath, type,
      cols, rows, index,
      notes
    } = this.state;
    let style = { ...this.props.style };
    style.height -= 35 + 15; // header height
    return (
      <div className='block' style={this.props.style}>
        <h1 className='header'>Object Properties</h1>
        <div className='propsContainer' style={style} >
          { this.block1(name) }
          { this.block2(x, y, z) }
          { this.block3(anchorX, anchorY) }
          { this.block4(filePath, type) }
          { this.block5(type, cols, rows, index) }
          { this.block6(notes) }
        </div>
      </div>
    )
  }
  block1(name) {
    return (
      <div className='props'>
        <div className='full'>
          Name
        </div>
        <div className='full'>
          <input
            type='text'
            onChange={::this.onNameChange}
            onBlur={::this.onBlur}
            onKeyDown={::this.checkEnter}
            value={name}
          />
        </div>
      </div>
    )
  }
  block2(x, y, z) {
    return (
      <div className='props'>
        <div className='third'>
          x
        </div>
        <div className='third'>
          y
        </div>
        <div className='third'>
          z
        </div>
        <div className='third'>
          <input
            type='text'
            onChange={::this.onPosXChange}
            onBlur={::this.onBlur}
            onKeyDown={::this.checkEnter}
            value={x}
          />
        </div>
        <div className='third'>
          <input
            type='text'
            onChange={::this.onPosYChange}
            onBlur={::this.onBlur}
            onKeyDown={::this.checkEnter}
            value={y}
          />
        </div>
        <div className='third'>
          <input
            type='text'
            onChange={::this.onPosZChange}
            onBlur={::this.onBlur}
            onKeyDown={::this.checkEnter}
            value={z}
          />
        </div>
      </div>
    )
  }
  block3(anchorX, anchorY) {
    return (
      <div className='props'>
        <div className='half'>
          Anchor X
        </div>
        <div className='half'>
          Anchor Y
        </div>
        <div className='half'>
          <input
            type='text'
            onChange={::this.onAnchorXChange}
            onBlur={::this.onBlur}
            onKeyDown={::this.checkEnter}
            value={anchorX}
          />
        </div>
        <div className='half'>
          <input
            type='text'
            onChange={::this.onAnchorYChange}
            onBlur={::this.onBlur}
            onKeyDown={::this.checkEnter}
            value={anchorY}
          />
        </div>
      </div>
    )
  }
  block4(filePath, type) {
    return (
      <div className='props'>
        <div className='half'>
          Image
        </div>
        <div className='half'>
          Type
        </div>
        <div className='half'>
          <button onClick={::this.onFile}>
            Select File
          </button>
          { filePath }
        </div>
        <div className='half'>
          <select value={type} onChange={::this.onTypeChange}>
            <option value="full">Full</option>
            <option value="spritesheet">SpriteSheet</option>
          </select>
        </div>
      </div>
    )
  }
  block5(type, cols, rows, index) {
    if (type !== 'spritesheet' && type !== 'animated') return null;
    return (
      <div className='props'>
        <div className='third'>
          Cols
        </div>
        <div className='third'>
          Rows
        </div>
        <div className='third'>
          Index
        </div>
        <div className='third'>
          <input
            type='text'
            onChange={::this.onColsChange}
            onBlur={::this.onBlur}
            onKeyDown={::this.checkEnter}
            value={cols}
          />
        </div>
        <div className='third'>
          <input
            type='text'
            onChange={::this.onRowsChange}
            onBlur={::this.onBlur}
            onKeyDown={::this.checkEnter}
            value={rows}
          />
        </div>
        <div className='third'>
          <input
            type='text'
            onChange={::this.onIndexChange}
            onBlur={::this.onBlur}
            onKeyDown={::this.checkEnter}
            value={index}
          />
        </div>
      </div>
    )
  }
  block6(notes) {
    return (
      <div className='props'>
        <div className='full'>
          Notes
        </div>
        <div className='full'>
          <textarea
            onChange={::this.onNotesChange}
            onBlur={::this.onBlur}
            value={notes}
          />
        </div>
      </div>
    )
  }
}
