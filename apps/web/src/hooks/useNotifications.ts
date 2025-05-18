import { useState, useCallback, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

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
  const { send, connected } = useWebSocket();

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'read'>) => {
    setNotifications(prev => [
      {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        read: false,
      },
      ...prev,
    ]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    if (!connected) return;

    const handleMessage = (data: any) => {
      if (data.type === 'message') {
        addNotification({
          type: 'message',
          title: 'New Message',
          message: data.content,
          timestamp: new Date(data.createdAt),
        });
      } else if (data.type === 'conversation' && data.priority === 'HIGH') {
        addNotification({
          type: 'conversation',
          title: 'High Priority Conversation',
          message: `Conversation ${data.id} has been marked as high priority`,
          timestamp: new Date(data.updatedAt),
        });
      } else if (data.type === 'account' && data.status === 'ERROR') {
        addNotification({
          type: 'account',
          title: 'Account Error',
          message: `Error with ${data.platform} account`,
          timestamp: new Date(data.lastSyncAt),
        });
      } else if (data.type === 'error') {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data.message,
          timestamp: new Date(data.timestamp),
        });
      }
    };

    return () => {
      // Cleanup is handled by the useWebSocket hook
    };
  }, [connected, addNotification]);

  return {
    notifications,
    markAsRead,
    clearAll,
  };
}
