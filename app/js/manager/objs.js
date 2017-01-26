import Manager from './'

const mapObject = {
  name: 'Map Object',
  x: 0, y: 0, z: 3,
  anchorX: 0, anchorY: 0,
  width: 0, height: 0,
  filePath: '', type: 'full',
  cols: 1,  rows: 1, index: 0,
  notes: ''
}

let id = 0;

export function add(args) {
  const newObj = {
    ...mapObject,
    x: args.x,
    y: args.y
  }
  const mapObjects = [
    ...Manager.state.mapObjects,
    newObj
  ]
  Manager.state.qMap[Manager.state.selectedMap] = mapObjects;
  const selectedObj = newObj;
  Manager.autosave();
  Manager.update({
    mapObjects,
    selectedObj
  })
  Manager.emit('ADD_OBJECT', newObj);
  Manager.emit('SELECT_OBJECT', newObj);
}

export function remove(args) {
  if (args.obj) {
    let selectedObj = args.obj;
    const i = Manager.state.mapObjects.indexOf(args.obj);
    const mapObjects = [
      ...Manager.state.mapObjects.slice(0, i),
      ...Manager.state.mapObjects.slice(i + 1)
    ]
    Manager.state.qMap[Manager.state.selectedMap] = mapObjects;
    if (i >= mapObjects.length) {
      selectedObj = -1;
    }
    Manager.autosave();
    Manager.update({
      mapObjects,
      selectedObj
    })
    Manager.emit('REMOVE_OBJECT', args.obj);
  }
}

export function removeAll() {
  for (let i = 0; i < Manager.state.mapObjects.length; i++) {
    Manager.emit('REMOVE_OBJECT', Manager.state.mapObjects[i]);
  }
  Manager.state.qMap[Manager.state.selectedMap] = [];
  Manager.autosave();
  Manager.update({
    mapObjects: [],
    selectedObj: -1
  })
}

export function update(args) {
  let needsSort = false;
  if (args.props.y || args.props.y === 0) {
    const oldY = args.obj.y;
    const newY = args.props.y;
    const oldZ = args.obj.z;
    const newZ = args.props.z;
    if (oldY !== newY || oldZ !== newZ) {
      needsSort = true;
    }
  }
  Object.assign(args.obj, args.props);
  if (!args.skipSave) {
    Manager.autosave();
  }
  Manager.update({
    selectedObj: args.obj
  })
  Manager.emit('UPDATE_OBJECT', args.obj);
  if (needsSort) {
    Manager.emit('SORT');
  }
}

export function select(args) {
  Manager.update({
    selectedObj: args.obj
  })
  Manager.emit('SELECT_OBJECT', args.obj);
}

export function sort(dt) {
  if (dt > 16) {
    Manager.emit('SORT');
  }
}
