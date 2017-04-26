import Store from './store'

export default class ManagerContext {
  openContext(x, y, type, i) {
    let items = [];
    switch (type) {
      case 'mapObj': {
        items = [
          { title: 'Duplicate', handler: this.duplicateMapObj.bind(this, i) },
          { title: 'Delete', handler: this.deleteMapObj.bind(this, i) }
        ]
        break;
      }
    }
    Store.context = {
      ...Store.context,
      open: true,
      type,
      selected: i,
      x, y,
      items
    }
  }
  clearContext() {
    Store.context = {
      ...Store.context,
      open: false,
      type: '',
      selected: -1,
      items: []
    }
  }
}
