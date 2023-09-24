// component that renders notification message
const NotificationMessage = ({ notificationMessage, errorHappened }) => {

  if (notificationMessage === null) { // if notificationMessage is null, then return null
    return null
  }

  else if (errorHappened) { // if error happened (boolean is true), then notification message has red background
    return (
      <div className="error_red">
        {notificationMessage}
      </div>
    )
  }

  else { // if error didn't happen (boolean is false), then notification message has green background
    return (
      <div className="notification_green">
        {notificationMessage}
      </div>
    )
  }
}

export default NotificationMessage