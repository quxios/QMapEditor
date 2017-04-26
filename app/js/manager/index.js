import ManagerMain from './managerMain'
import ManagerUtils from './managerUtils'
import ManagerInput from './managerInput'
import ManagerNotifications from './managerNotifications'
import ManagerContext from './managerContext'
import ManagerMap from './managerMap'
import ManagerMapObj from './managerMapObj'

class Manager {
  constructor() {
    const mixin = [
      ManagerMain,
      ManagerUtils,
      ManagerInput,
      ManagerContext,
      ManagerNotifications,
      ManagerMap,
      ManagerMapObj
    ]
    mixin.forEach((s) => {
      s = s.prototype;
      Object.getOwnPropertyNames(s).forEach((prop) => {
        if (prop !== 'constructor') {
          Object.defineProperty(this, prop, Object.getOwnPropertyDescriptor(s, prop));
        }
      })
    })
    document.addEventListener('keydown', ::this._onKeydown);
    document.addEventListener('keyup', ::this._onKeyup);
  }
}

export default new Manager();
