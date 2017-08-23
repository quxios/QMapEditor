import ActionMain from './actionMain'
import ActionUtils from './actionUtils'
import ActionInput from './actionInput'
import ActionNotifications from './actionNotifications'
import ActionContext from './actionContext'
import ActionHistory from './actionHistory'
import ActionMap from './actionMap'
import ActionMapObj from './actionMapObj'

function Mixin(...funcs) {
  let mixin = funcs[0](Object);
  for (let i = 1; i < funcs.length; i++) {
    mixin = funcs[i](mixin);
  }
  return mixin;
}

export default Mixin(
  ActionMain,
  ActionUtils,
  ActionInput,
  ActionNotifications,
  ActionContext,
  ActionHistory,
  ActionMap,
  ActionMapObj
);
