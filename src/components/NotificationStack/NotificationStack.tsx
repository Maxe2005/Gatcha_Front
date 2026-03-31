import React from 'react';
import { Alert, Stack, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNotification } from '../../context/NotificationContext';
import './NotificationStack.css';

const NotificationStack = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <Stack
      className="notification-stack"
      spacing={2}
      sx={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        maxWidth: 500,
        pointerEvents: 'auto',
      }}
    >
      {notifications.map((notification) => (
        <Alert
          key={notification.id}
          severity={notification.type}
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={() => removeNotification(notification.id)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
          sx={{
            animation: 'slideIn 0.3s ease-out',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: '8px',
          }}
        >
          {notification.message}
        </Alert>
      ))}
    </Stack>
  );
};

export default NotificationStack;
