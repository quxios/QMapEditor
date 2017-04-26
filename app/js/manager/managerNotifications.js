import Store from './store'

export default class ManagerNotifications {
  notify(type, msg, duration = -1) {
    Store.notifications.push({
      type,
      msg
    })
    if (duration > 0) {
      let obj = Store.notifications[Store.notifications.length - 1];
      obj.timeout = window.setTimeout(() => {
        this.clearNotification(obj);
      }, duration)
    }
  }
  clearNotification(obj) {
    const i = Store.notifications.indexOf(obj);
    if (i === -1) return;
    Store.notifications.splice(i, 1);
    if (obj.timeout) window.clearTimeout(obj.timeout);
  }
}
