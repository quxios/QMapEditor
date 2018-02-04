import React from 'react'
import { ipcRenderer } from 'electron'
import fs from 'fs'
import path from 'path'

export default class Layout extends React.Component {
  constructor(props) {
    super(props);
    let type = 'switch';
    let value = ['0', 'true'];
    const {
      conditions,
      index
    } = props;
    if (index >= 0) {
      type = conditions[index].type;
      value = conditions[index].value;
    }
    this.disabledSwitches = [];
    this.disabledVariables = [];
    conditions.forEach(v => {
      if (!v) return;
      const i = v.value[0];
      if (value[0] === i) return;
      if (v.type === 'switch') {
        this.disabledSwitches.push(Number(i));
      }
      if (v.type === 'var') {
        this.disabledVariables.push(Number(i));
      }
    });
    this.state = {
      type,
      value,
      switches: [],
      variables: []
    }
  }
  componentWillMount() {
    const { projectPath } = this.props;
    const filePath = path.join(projectPath, './data/System.json');
    let system;
    try {
      system = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch(e) {
      system = {
        switches: [],
        variables: []
      }
    }
    const {
      switches,
      variables
    } = system;
    this.setState({
      switches,
      variables
    });
  }
  onOk = () => {
    const {
      type,
      value
    } = this.state;
    const isOk = this.checkIfOk();
    if (isOk === true) {
      ipcRenderer.send('setCondition', {
        index: this.props.index,
        type,
        value
      });
      window.close();
    } else {
      const errs = {
        'empty-js': 'JS field is empty',
        'empty-switch': 'No Switch selected',
        'empty-var': 'No Variable selected',
        'disabled-switch': 'The Switch is already in the condition list',
        'disabled-var': 'The Variable is already in the condition list'
      }
      window.alert(`Error: ${errs[`${isOk}-${type}`] || '???'}`);
    }
  }
  checkIfOk() {
    const {
      type,
      value
    } = this.state;
    if (!value[0] || !value[0].trim()) {
      return 'empty';
    }
    if (type === 'js') {
      return true;
    }
    if (value[0] === '0') {
      return 'empty';
    }
    const disabled = type === 'switch' ? this.disabledSwitches : this.disabledVariables;
    if (disabled.includes(Number(value[0]))) {
      return 'disabled';
    }
    return true;
  }
  onTypeChange = (e) => {
    const type = e.target.value;
    let value = [];
    if (type === 'switch') {
      value = ['1', 'true'];
    } else if (type === 'var') {
      value = ['1', ''];
    }
    this.setState({
      type,
      value
    });
  }
  onValueChange = (e) => {
    let value = [...this.state.value];
    let i = 0;
    if (e.target.className === 'col1') i = 0;
    if (e.target.className === 'col2') i = 1;
    value[i] = e.target.value;
    this.setState({
      value
    });
  }
  renderValue() {
    const {
      type
    } = this.state;
    if (!type) return null;
    if (type === 'switch') {
      return this.renderSwitch();
    }
    if (type === 'var') {
      return this.renderVar();
    }
    if (type === 'js') {
      return this.renderJS();
    }
  }
  renderSwitch() {
    const {
      switches,
      value
    } = this.state;
    return (
      <div>
        <select size="10" className="col1" onChange={this.onValueChange} value={value[0]}>
          {switches.map((name, i) => {
            name = name || '-UNNAMED-';
            if (i > 0) {
              return (
                <option value={i} key={`switch-${i}`} disabled={this.disabledSwitches.includes(i)}>
                  {`${i}. ${name}`}
                </option>
              );
            }
            return null;
          })}
        </select>
        <select className="col2" onChange={this.onValueChange} value={value[1]}>
          <option value="true">On</option>
          <option value="false">Off</option>
        </select>
      </div>
    )
  }
  renderVar() {
    const {
      variables,
      value
    } = this.state;
    return (
      <div>
        <select size="10" className="col1" onChange={this.onValueChange} value={value[0]}>
          {variables.map((name, i) => {
            name = name || '-UNNAMED-';
            if (i > 0) {
              return (
                <option value={i} key={`var-${i}`} disabled={this.disabledVariables.includes(i)}>
                  {`${i}. ${name}`}
                </option>
              );
            }
            return null;
          })}
        </select>
        <input
          type="text"
          className="col2"
          onChange={this.onValueChange}
          placeholder="Value"
          value={value[1] || ''}
        />
      </div>
    )
  }
  renderJS() {
    const {
      value
    } = this.state;
    return (
      <input
        type="text"
        className="col0"
        onChange={this.onValueChange}
        placeholder="JS to eval"
        value={value[0]}
      />
    )
  }
  render() {
    const {
      type
    } = this.state;
    return (
      <div className="conditionSelect">
        <div className="header">
          <span className="type">
            Type
          </span>
          <select onChange={this.onTypeChange} value={type}>
            <option value="switch">
              Switch
            </option>
            <option value="var">
              Variable
            </option>
            <option value="js">
              Script
            </option>
          </select>
        </div>
        <div className="body">
          <span className="value">
            Value
          </span>
          { this.renderValue() }
        </div>
        <div className='fixedRight'>
          <button onClick={this.onOk}>
            Ok
          </button>
          <button onClick={window.close}>
            Cancel
          </button>
        </div>
      </div>
    )
  }
}
