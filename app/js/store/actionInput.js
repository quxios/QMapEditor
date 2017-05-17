import { action } from 'mobx'

export default (C) => {
  return class ActionInput extends C {
    @action.bound
    isPressed(keyCode) {
      return this.keyState[keyCode];
    }

    @action.bound
    _onKeydown(event) {
      const { keyCode } = event;
      this.keyState[keyCode] = true;
    }

    @action.bound
    _onKeyup(event) {
      this.keyState[event.keyCode] = false;
    }
  }
}
