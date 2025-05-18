import { useEffect, useCallback } from 'react';
import wsService from '../services/websocket';

type WebSocketEventHandler = (data: any) => void;

const useWebSocket = () => {
  useEffect(() => {
    // Set up connection status handlers
    const handleConnect = () => console.log('WebSocket connected');
    const handleDisconnect = () => console.log('WebSocket disconnected');
    const handleError = (error: any) => console.error('WebSocket error:', error);
    const handleReconnectFailed = () => console.error('WebSocket reconnection failed');

    wsService.on('connected', handleConnect);
    wsService.on('disconnected', handleDisconnect);
    wsService.on('error', handleError);
    wsService.on('reconnect_failed', handleReconnectFailed);

    return () => {
      wsService.removeListener('connected', handleConnect);
      wsService.removeListener('disconnected', handleDisconnect);
      wsService.removeListener('error', handleError);
      wsService.removeListener('reconnect_failed', handleReconnectFailed);
    };
  }, []);

  const subscribe = useCallback((event: string, handler: WebSocketEventHandler) => {
    wsService.on(event, handler);
    return () => wsService.removeListener(event, handler);
  }, []);

  const send = useCallback((data: any) => {
    wsService.send(data);
  }, []);

  return {
    subscribe,
    send,
  };
};

export default useWebSocket; 