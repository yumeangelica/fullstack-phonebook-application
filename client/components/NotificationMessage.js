const NotificationMessage = ({ notificationMessage, errorHappened }) => {
  return notificationMessage ? (
    <div className={errorHappened ? "error_red" : "notification_green"}>
      {notificationMessage}
    </div>
  ) : null;
};

export default NotificationMessage;
