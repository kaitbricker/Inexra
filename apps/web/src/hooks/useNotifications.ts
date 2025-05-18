import { useState, useCallback, useEffect } from 'react';
import { useWebSocket } from '../services/websocket';

interface Notification {
  id: string;
  type: 'message' | 'conversation' | 'account' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { onMessage, onConversation, onAccount, onError } = useWebSocket();

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read'>) => {
    setNotifications((prev) => [
      {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        read: false,
      },
      ...prev,
    ]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    const unsubscribeMessage = onMessage((message) => {
      addNotification({
        type: 'message',
        title: 'New Message',
        message: message.content,
        timestamp: new Date(message.createdAt),
      });
    });

    const unsubscribeConversation = onConversation((conversation) => {
      if (conversation.priority === 'HIGH') {
        addNotification({
          type: 'conversation',
          title: 'High Priority Conversation',
          message: `Conversation ${conversation.id} has been marked as high priority`,
          timestamp: new Date(conversation.updatedAt),
        });
      }
    });

    const unsubscribeAccount = onAccount((account) => {
      if (account.status === 'ERROR') {
        addNotification({
          type: 'account',
          title: 'Account Error',
          message: `Error with ${account.platform} account`,
          timestamp: new Date(account.lastSyncAt),
        });
      }
    });

    const unsubscribeError = onError((error) => {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message,
        timestamp: new Date(error.timestamp),
      });
    });

    return () => {
      unsubscribeMessage();
      unsubscribeConversation();
      unsubscribeAccount();
      unsubscribeError();
    };
  }, [onMessage, onConversation, onAccount, onError, addNotification]);

  return {
    notifications,
    markAsRead,
    clearAll,
  };
} 