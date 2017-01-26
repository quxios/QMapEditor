import * as fs from 'fs'
import * as path from 'path'

import React from 'react'
import Manager from './../manager'

import { loadFile, saveFile, selectMap } from './../manager/actions'
import { remote, ipcRenderer } from 'electron'
const dialog = remote.dialog

const defaultPath = ipcRenderer.sendSync('getDefaultPath');

export default class Menubar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projectPath: Manager.state.projectPath,
      selectedMap: Manager.state.selectedMap,
      highlightSave: false,
      highlightScreenshot: false
    }
    this.getStates = ::this.getStates;
    this.onFocus = ::this.onFocus;
  }
  componentWillMount() {
    Manager.on('UPDATE_STATE', this.getStates);
    ipcRenderer.on('focus', this.onFocus);
  }
  getStates(newStates) {
    const { projectPath, selectedMap, validProject } = newStates;
    this.setState({ projectPath, selectedMap });
    if (validProject) {
      const mapInfos = path.join(projectPath, 'data/MapInfos.json')
      const project = path.join(projectPath, 'Game.rpgproject')
      this.startWatch(mapInfos, project);
    } else if (this._watching) {
      fs.unwatchFile(this._watching[0])
    }
  }
  onLoad() {
    dialog.showOpenDialog({
      title: 'Open Project',
      defaultPath: this.state.projectPath || defaultPath,
      filters: [
        { name: 'RPG Maker MV Project', extensions: ['rpgproject'] }
      ]
    }, ::this.doLoad)
  }
  doLoad(filePaths) {
    if (filePaths) {
      Manager.run(loadFile(filePaths[0]));
    }
  }
  startWatch(file, projectFile) {
    fs.stat(file, (err, stats) => {
      if (!err) {
        if (this._watching) {
          fs.unwatchFile(this._watching[0])
        }
        fs.watchFile(file, (current, prev) => {
          this._watching[2] = JSON.stringify(fs.statSync(file).mtime);
          Manager.run(loadFile(this._watching[1]));
          Manager.run(selectMap(this.props.selectedMap));
        })
        this._watching = [file, projectFile, JSON.stringify(stats.mtime)];
      }
    });
  }
  onSave() {
    Manager.run(saveFile());
    // should probably have this set on a callback from the save function
    // so it doesnt highlight if an error
    this.setState({ highlightSave: true }, () => {
      window.setTimeout(() => {
        this.setState({ highlightSave: false });
      }, 1000)
    });
  }
  onScreenshot() {
    Manager.emit('SCREENSHOT');
    this.setState({ highlightScreenshot: true }, () => {
      window.setTimeout(() => {
        this.setState({ highlightScreenshot: false });
      }, 1000)
    });
  }
  onFocus() {
    if (this.props.validProject && this._watching) {
      let mtime = JSON.stringify(fs.statSync(this._watching[0]).mtime);
      if (mtime !== this._watching[2]) {
        Manager.run(loadFile(this._watching[1]));
        Manager.run(selectMap(this.props.selectedMap));
        this._watching[2] = mtime;
      }
    }
  }
  render() {
    const saveClass = this.props.validProject ? '' : 'disabled';
    const { highlightScreenshot, highlightSave } = this.state
    return (
      <div className='menubar'>
        <button onClick={::this.onLoad}>
          Load
        </button>
        { this.state.selectedMap > 0 ?
          <button onClick={::this.onSave} className={highlightSave ? 'accepted' : ''}>
            Save
          </button>
          : null
        }
        { this.state.selectedMap > 0 ?
          <button onClick={::this.onScreenshot} className={highlightScreenshot ? 'accepted' : ''}>
            Screenshot
          </button>
          : null
        }
      </div>
    )
  }
}
