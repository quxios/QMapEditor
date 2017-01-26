import * as fs from 'fs'
import * as path from 'path'

import Manager from './'

export function select(args) {
  const { projectPath } = Manager.state;
  const num = String(args.id).padStart(3, '0');
  const mapPath = path.join(projectPath, `./data/Map${num}.json`);
  const objPath = path.join(projectPath, `./data/Map${num}Q.json`);
  let mapData = null;
  let mapObjects = [];
  let validMap = true;
  try {
    mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  } catch (e) {
    validMap = false;
  }
  if (validMap) {
    mapObjects = Manager.state.qMap[args.id] || [];
  }
  Manager.autosave();
  Manager.update({
    selectedMap: args.id,
    selectedObj: -1,
    validMap,
    mapData,
    mapObjects
  })
  Manager.emit('SELECT_MAP', validMap, args.id, mapData, mapObjects);
}
