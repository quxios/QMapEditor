import React from 'react'
import Manager from '../manager'
import Stage from '../display/stage'

import { ipcRenderer, remote } from 'electron'
import fs from 'fs'
import path from 'path'

export default class Menubar extends React.Component {
  componentWillMount() {
    ipcRenderer.on('focus', this.onFocus);
  }
  openLoad = () => {
    remote.dialog.showOpenDialog({
      title: 'Open Project',
      defaultPath: this.props.projectPath,
      filters: [{
        name: 'RPG Maker MV Project',
        extensions: ['rpgproject']
      }]
    }, ::Manager.load);
  }
  startWatch(file, projectFile) {
    fs.stat(file, (err, stats) => {
      if (!err) {
        if (this._watching) {
          fs.unwatchFile(this._watching[0])
        }
        this._watching = [file, projectFile, JSON.stringify(stats.mtime)];
        fs.watchFile(file, (current, prev) => {
          this._watching[2] = JSON.stringify(fs.statSync(file).mtime);
          Manager.load([this._watching[1]]);
          Manager.selectMap(this.props.currentMap);
        })
      }
    });
  }
  openHelp = () => {
    ipcRenderer.send('openHelp');
  }
  onFocus = () => {
    if (this.props.isLoaded && this._watching) {
      const mtime = JSON.stringify(fs.statSync(this._watching[0]).mtime);
      if (mtime !== this._watching[2]) {
        this._watching[2] = mtime;
        Manager.load([this._watching[1]]);
        Manager.selectMap(this.props.currentMap);
      }
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.isLoaded !== this.props.isLoaded ||
      nextProps.projectPath !== this.props.projectPath) {
      if (nextProps.isLoaded) {
        const mapInfos = path.join(nextProps.projectPath, 'data/MapInfos.json');
        const project = path.join(nextProps.projectPath, 'Game.rpgproject');
        this.startWatch(mapInfos, project);
      } else if (this._watching) {
        fs.unwatchFile(this._watching[0]);
      }
    }
  }
  render() {
    const {
      isLoaded
    } = this.props;
    return (
      <div className="menubar">
        <div className="left">
          <button onClick={this.openLoad}>
            Load
          </button>
          { isLoaded &&
            <button onClick={::Manager.save}>
              Save
            </button>
          }
          { isLoaded &&
            <button onClick={::Stage.screenShot}>
              Screenshot
            </button>
          }
        </div>
        <div className="right">
          <button onClick={this.openHelp}>
            Help
          </button>
        </div>
      </div>
    )
  }
}
