export default class Input {
  static state = {};
  static _onKeydown(event) {
    this.state[event.keyCode] = true;
  }
  static _onKeyup(event) {
    this.state[event.keyCode] = false;
  }
  static isPressed(keycode) {
    return this.state[keycode];
  }
}

document.addEventListener('keydown', Input._onKeydown.bind(Input))
document.addEventListener('keyup', Input._onKeyup.bind(Input))
