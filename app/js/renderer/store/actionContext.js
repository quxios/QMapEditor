import { action } from 'mobx'

export default (C) => {
  return class ActionContext extends C {
    @action.bound
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
      this.context = {
        ...this.context,
        open: true,
        type,
        selected: i,
        x, y,
        items
      }
    }

    @action.bound
    clearContext() {
      this.context = {
        ...this.context,
        open: false,
        type: '',
        selected: -1,
        items: []
      }
    }
  }
}
