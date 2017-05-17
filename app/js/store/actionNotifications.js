import { action } from 'mobx'

export default (C) => {
  return class ActionNotifications extends C {
    @action.bound
    notify(type, msg, duration = -1) {
      this.notifications.push({
        type,
        msg
      })
      if (duration > 0) {
        let obj = this.notifications[this.notifications.length - 1];
        obj.timeout = window.setTimeout(() => {
          this.clearNotification(obj);
        }, duration)
      }
    }

    @action.bound
    clearNotification(obj) {
      const i = this.notifications.indexOf(obj);
      if (i === -1) return;
      this.notifications.splice(i, 1);
      if (obj.timeout) window.clearTimeout(obj.timeout);
    }
  }
}
