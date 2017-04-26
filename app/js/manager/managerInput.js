import Store from './store'

export default class ManagerInput {
  isPressed(keyCode) {
    return Store.keyState[keyCode];
  }
  _onKeydown(event) {
    const { keyCode } = event;
    Store.keyState[keyCode] = true;
  }
  _onKeyup(event) {
    Store.keyState[event.keyCode] = false;
  }
}
