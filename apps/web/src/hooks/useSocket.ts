import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const joinConversation = (conversationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join-conversation', conversationId);
    }
  };

  const leaveConversation = (conversationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave-conversation', conversationId);
    }
  };

  const onNewMessage = (callback: (message: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('new-message', callback);
    }
  };

  const onMessageUpdate = (callback: (message: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('message-update', callback);
    }
  };

  return {
    socket: socketRef.current,
    joinConversation,
    leaveConversation,
    onNewMessage,
    onMessageUpdate,
  };
}
