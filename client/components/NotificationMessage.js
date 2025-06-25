import React from 'react';
import { Alert } from 'react-bootstrap';

const NotificationMessage = ({ notificationMessage, errorHappened }) => {
  return notificationMessage ? (
    <Alert
      variant={errorHappened ? "danger" : "success"}
      className="notification-alert"
    >
      {notificationMessage}
    </Alert>
  ) : null;
};

export default NotificationMessage;
