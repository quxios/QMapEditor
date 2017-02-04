export function someAction() {
  return {
    type: '',
    args: {}
  }
}

export function loadFile(path) {
  return {
    type: 'LOAD_FILE',
    args: {
      path
    }
  }
}

export function saveFile() {
  return {
    type: 'SAVE_FILE'
  }
}

export function selectMap(id) {
  return {
    type: 'SELECT_MAP',
    args: {
      id
    }
  }
}

export function addObject(x = 0, y = 0) {
  return {
    type: 'ADD_OBJECT',
    args: {
      x, y
    }
  }
}

export function deleteObject(obj) {
  return {
    type: 'DELETE_OBJECT',
    args: {
      obj
    }
  }
}

export function deleteAllObjects() {
  return {
    type: 'DELETE_ALL_OBJECTS'
  }
}

export function copyObject(obj) {
  return {
    type: 'COPY_OBJECT',
    args: {
      obj
    }
  }
}

export function selectObject(obj) {
  return {
    type: 'SELECT_OBJECT',
    args: {
      obj
    }
  }
}

export function updateObject(obj, props, skipSave = false) {
  return {
    type: 'UPDATE_OBJECT',
    args: {
      obj,
      props,
      skipSave
    }
  }
}

export function sortObjects() {
  return {
    type: 'SORT_OBJECTS'
  }
}

export function screenshot(image) {
  return {
    type: 'SCREENSHOT',
    args: {
      image
    }
  }
}

export function setContext(items, top, left) {
  return {
    type: 'OPEN_CONTEXT',
    args: {
      items,
      top,
      left
    }
  }
}

export function closeContext() {
  return {
    type: 'CLOSE_CONTEXT'
  }
}
