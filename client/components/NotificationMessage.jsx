const NotificationMessage = ({ notificationMessage, errorHappened }) => {
  return notificationMessage ? (
    <div
      className={`notification-alert ${errorHappened ? 'error_red' : 'notification_green'}`}
      // Errors interrupt (assertive); success messages wait politely
      role={errorHappened ? 'alert' : 'status'}
    >
      {notificationMessage}
    </div>
  ) : null;
};

export default NotificationMessage;
