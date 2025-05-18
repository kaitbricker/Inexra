'use client';

import { useEffect, useCallback } from 'react';
import wsService from '@/services/websocket';

export const useWebSocket = () => {
  const send = useCallback((data: any) => {
    wsService.send(data);
  }, []);

  useEffect(() => {
    const handleMessage = (data: any) => {
      // Handle incoming messages
      console.log('Received message:', data);
    };

    const handleError = (error: any) => {
      console.error('WebSocket error:', error);
    };

    const handleDisconnect = () => {
      console.log('WebSocket disconnected');
    };

    const handleReconnectFailed = () => {
      console.error('WebSocket reconnection failed');
    };

    // Subscribe to events
    wsService.on('message', handleMessage);
    wsService.on('error', handleError);
    wsService.on('disconnected', handleDisconnect);
    wsService.on('reconnect_failed', handleReconnectFailed);

    // Cleanup
    return () => {
      wsService.removeListener('message', handleMessage);
      wsService.removeListener('error', handleError);
      wsService.removeListener('disconnected', handleDisconnect);
      wsService.removeListener('reconnect_failed', handleReconnectFailed);
    };
  }, []);

  return {
    send,
    connected: wsService.listenerCount('connected') > 0,
  };
}; 