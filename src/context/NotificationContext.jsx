import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback(
    (message, type = 'info', duration = 5000) => {
      const id = Date.now() + Math.floor(Math.random() * 10000); // éviter collisions
      const notification = { id, message, type, _closedManually: false };

      setNotifications((prev) => [...prev, notification]);

      if (duration > 0) {
        setTimeout(() => {
          setNotifications((prev) => {
            const notif = prev.find((n) => n.id === id);
            if (notif && !notif._closedManually) {
              return prev.filter((n) => n.id !== id);
            }
            return prev;
          });
        }, duration);
      }

      return id;
    },
    []
  );

  const removeNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev
        .map((notif) =>
          notif.id === id ? { ...notif, _closedManually: true } : notif
        )
        .filter((notif) => notif.id !== id)
    );
  }, []);

  const success = useCallback(
    (message, duration = 4000) => addNotification(message, 'success', duration),
    [addNotification]
  );

  const error = useCallback(
    (message, duration = 6000) => addNotification(message, 'error', duration),
    [addNotification]
  );

  const warning = useCallback(
    (message, duration = 5000) => addNotification(message, 'warning', duration),
    [addNotification]
  );

  const info = useCallback(
    (message, duration = 4000) => addNotification(message, 'info', duration),
    [addNotification]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
