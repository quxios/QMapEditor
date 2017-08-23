import { action } from 'mobx'

export default (C) => {
  return class ActionHistory extends C {
    _history = [];

    @action.bound
    clearHistory() {
      this._history = [];
    }

    @action.bound
    pushHistory(action) {
      this._history.push(action);
      if (this._history.length > 20) {
        this._history.shift();
      }
    }

    @action.bound
    undoHistory(action) {
      const lastAction = this._history.pop();
      if (!lastAction) return;

    }
  }
}
