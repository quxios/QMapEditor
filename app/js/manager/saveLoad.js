import * as fs from 'fs'
import * as path from 'path'

import { ipcRenderer } from 'electron'

import Manager from './'

export function load(args) {
  const projectPath = path.dirname(args.path);
  const file1Path = path.join(projectPath, './data/MapInfos.json');
  const file2Path = path.join(projectPath, './data/QMap.json');
  let mapList = [];
  let qMap = [];
  let validProject = true;
  try {
    mapList = JSON.parse(fs.readFileSync(file1Path, 'utf8'));
  } catch (e) {
    validProject = false;
  }
  if (validProject) {
    try {
      qMap = JSON.parse(fs.readFileSync(file2Path, 'utf8'));
    } catch (e) {
      qMap = [];
    }
  }
  ipcRenderer.send('setDefaultPath', projectPath);
  Manager.update({
    validProject,
    validMap: false,
    projectPath,
    mapList,
    qMap,
    selectedMap: 0,
    mapData: [],
    mapObjects: []
  })
  Manager.emit('SELECT_MAP', false);
}

export function save(args) {
  if (args.selectedMap > 0) {
    const filePath = path.join(Manager.state.projectPath, `./data/QMap.json`);
    const data = JSON.stringify(args.qMap);
    fs.writeFileSync(filePath, data);
  }
}

export function saveScreenshot(args) {
  const projectPath = Manager.state.projectPath;
  if (!projectPath) return;
  makeScreenshot(args, projectPath, 0);
}

function makeScreenshot(args, projectPath, id) {
  const imagePath = path.join(projectPath, `screenshot${id}.png`);
  fs.stat(imagePath, (err) => {
    if (err) {
      fs.writeFile(imagePath, args.image, 'base64', (err) => {
        if (err) {
          console.error(err);
        }
      });
    } else {
      makeScreenshot(args, projectPath, ++id);
    }
  })
}
