import React from 'react'
import Manager from '../manager'
import { observer } from 'mobx-react'

import MapList from './toolbarMapList'
import ObjList from './toolbarObjList'
import Properties from './toolbarProperties'
import ContextMenu from './contextMenu'

@observer
export default class Toolbar extends React.Component {
  render() {
    const {
      projectPath,
      mapList,
      currentMap,
      currentMapObj,
      mapObjects,
      mapObject,
      context
    } = this.props.store;
    return (
      <div>
        <MapList
          mapList={mapList}
          currentMap={currentMap}
        />
        <ObjList
          mapObjects={mapObjects}
          currentMap={currentMap}
          currentMapObj={currentMapObj}
          selectedContext={context.type === 'mapObj' ? context.selected : -1}
        />
        <Properties
          projectPath={projectPath}
          mapObject={mapObject}
        />
        <ContextMenu context={context} />
      </div>
    )
  }
}
