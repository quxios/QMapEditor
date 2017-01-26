import React from 'react'
import Manager from './../manager'

import Context from './contextMenu'
import Menubar from './menubar'
import ToolbarMap from './toolbarMap'
import ToolbarObj from './toolbarObj'
//import ToolbarLeft from './toolbarLeft'
//import ToolbarRight from './toolbarRight'
import Canvas from './canvas'

export default class Layout extends React.Component {
  constructor() {
    super();
    this.state = {
      validProject: Manager.state.validProject
    }
    this.getStates = ::this.getStates;
  }
  componentWillMount() {
    Manager.on('UPDATE_STATE', this.getStates);
  }
  getStates(newStates) {
    const { validProject, validMap } = newStates;
    this.setState({ validProject, validMap });
  }
  render() {
    const validProject = this.state.validProject;
    const validMap = this.state.validMap;
    return (
      <div>
        <Context />
        <Menubar validProject={validProject} />
        {validProject && <ToolbarMap />}
        {/*validProject && <ToolbarLeft validMap={validMap} />*/}
        {validProject && <Canvas validMap={validMap} />}
        {/*validMap && <ToolbarRight />*/}
        {validMap && <ToolbarObj />}
      </div>
    )
  }
}
