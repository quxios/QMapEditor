import React from 'react'
import { observer } from 'mobx-react'

import Menubar from './menubar'
import Toolbar from './toolbar'
import Canvas from './canvas'
import Notifications from './notifications'

@observer
export default class Layout extends React.Component {
  render() {
    const {
      theme,
      isLoaded,
      projectPath,
      currentMap,
      currentMapObj,
      mapList,
      notifications
    } = this.props.store;
    return (
      <div>
        <Menubar
          theme={theme}
          isLoaded={isLoaded}
          projectPath={projectPath}
          currentMap={currentMap}
        />
        { isLoaded && <Toolbar store={this.props.store} /> }
        <Canvas currentMap={currentMap} currentMapObj={currentMapObj} />
        <Notifications notifications={notifications} />
      </div>
    )
  }
}
