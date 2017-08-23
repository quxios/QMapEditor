import { action } from 'mobx'

export default (C) => {
  return class ActionInput extends C {
    _keyState = {};
    _lastDown = null;
    _lastReleased = null;

    constructor() {
      super();
      document.addEventListener('keydown', ::this._onKeydown);
      document.addEventListener('keyup', ::this._onKeyup);
    }

    @action.bound
    isTriggered(keyCode) {
      return this._lastDown === keyCode;
    }

    @action.bound
    isPressed(keyCode) {
      return this._keyState[keyCode];
    }

    @action.bound
    isLongPressed(keyCode) {
      if (!this.isPressed(keyCode)) return false;
      const dt = Date.now() - this._keyState[keyCode];
      return this.isTriggered(keyCode) || dt > 300;
    }

    @action.bound
    isReleased(keyCode) {
      return this._lastReleased === keyCode;
    }

    @action.bound
    _onKeydown(event) {
      const { keyCode } = event;
      const oldState = this._keyState[keyCode];
      if (!oldState) {
        this._keyState[keyCode] = Date.now();
        this._lastDown = keyCode;
      }
    }

    @action.bound
    _onKeyup(event) {
      const { keyCode } = event;
      this._keyState[keyCode] = false;
      this._lastReleased = keyCode;
    }

    @action.bound
    updateInput() {
      this._lastDown = null;
      this._lastReleased = null;
    }
  }
}
