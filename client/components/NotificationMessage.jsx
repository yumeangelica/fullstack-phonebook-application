const NotificationMessage = ({ notificationMessage, errorHappened }) => {
  return notificationMessage ? (
    <div
      className={`notification-alert ${errorHappened ? 'error_red' : 'notification_green'}`}
      role="alert"
    >
      {notificationMessage}
    </div>
  ) : null;
};

export default NotificationMessage;
