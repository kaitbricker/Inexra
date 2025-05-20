'use client';

import { useEffect, useCallback, useState } from 'react';
import wsService from '@/services/websocket';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  const send = useCallback((data: any) => {
    if (wsService) {
      wsService.send(data);
    }
  }, []);

  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    if (!wsService) {
      return () => {};
    }

    const service = wsService;
    service.on(event, callback);
    return () => {
      service.off(event, callback);
    };
  }, []);

  useEffect(() => {
    if (!wsService) return;

    const handleMessage = (data: any) => {
      // Handle incoming messages
      console.log('Received message:', data);
    };

    const handleError = (error: any) => {
      console.error('WebSocket error:', error);
    };

    const handleDisconnect = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    const handleConnect = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    const handleReconnectFailed = () => {
      console.error('WebSocket reconnection failed');
    };

    // Subscribe to events
    if (wsService) {
      const service = wsService;
      service.on('message', handleMessage);
      service.on('error', handleError);
      service.on('disconnected', handleDisconnect);
      service.on('connected', handleConnect);
      service.on('reconnect_failed', handleReconnectFailed);

      // Set initial connection state
      setIsConnected(service.listenerCount('connected') > 0);

      // Cleanup
      return () => {
        service.removeListener('message', handleMessage);
        service.removeListener('error', handleError);
        service.removeListener('disconnected', handleDisconnect);
        service.removeListener('connected', handleConnect);
        service.removeListener('reconnect_failed', handleReconnectFailed);
      };
    }
  }, []);

  return {
    send,
    subscribe,
    connected: isConnected,
  };
};
