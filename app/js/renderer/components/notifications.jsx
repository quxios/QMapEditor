import React from 'react'
import Store from './../store'
import { observer } from 'mobx-react'

@observer
export default class Notifications extends React.Component {
  render() {
    const {
      notifications
    } = this.props;
    const list = notifications.map((obj, i) => {
      const {
        type,
        msg,
        duration
      } = obj;
      const onClick = () => {
        Store.clearNotification(obj);
      }
      return (
        <li key={`notification-${i}`} onClick={onClick} className={type.toLowerCase()}>
          {type === 'ERROR' && (<span><i className="fa fa-exclamation-triangle" aria-hidden />ERROR<br /></span>)}
          {msg}
        </li>
      )
    })
    return (
      <ul className="notifications">
        {list}
      </ul>
    )
  }
}
