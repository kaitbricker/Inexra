import { io, Socket } from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';

interface SocketOptions {
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  timeout?: number;
}

interface Message {
  type: string;
  payload: any;
}

class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private messageQueue: Message[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private batchInterval = 100; // ms

  private constructor() {}

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  connect(options: SocketOptions = {}) {
    if (this.socket?.connected) return;

    const {
      autoConnect = true,
      reconnection = true,
      reconnectionAttempts = 5,
      reconnectionDelay = 1000,
      timeout = 20000,
    } = options;

    this.maxReconnectAttempts = reconnectionAttempts;
    this.reconnectDelay = reconnectionDelay;

    this.socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3000', {
      autoConnect,
      reconnection,
      timeout,
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
      this.processMessageQueue();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.handleReconnect();
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.socket?.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private processMessageQueue() {
    if (!this.socket?.connected || this.messageQueue.length === 0) return;

    const batch = this.messageQueue.splice(0, 10); // Process up to 10 messages at a time
    batch.forEach((message) => {
      this.socket?.emit(message.type, message.payload);
    });

    if (this.messageQueue.length > 0) {
      this.batchTimeout = setTimeout(() => this.processMessageQueue(), this.batchInterval);
    }
  }

  emit(type: string, payload: any) {
    if (!this.socket?.connected) {
      this.messageQueue.push({ type, payload });
      return;
    }

    this.socket.emit(type, payload);
  }

  on(type: string, callback: (payload: any) => void) {
    this.socket?.on(type, callback);
  }

  off(type: string, callback: (payload: any) => void) {
    this.socket?.off(type, callback);
  }

  disconnect() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }
    this.socket?.disconnect();
  }
}

// React hook for using the socket
export function useSocket(options: SocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const socketManager = useRef(SocketManager.getInstance());

  useEffect(() => {
    const socket = socketManager.current;

    socket.connect(options);

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    return () => {
      socket.disconnect();
    };
  }, [options]);

  return {
    socket: socketManager.current,
    isConnected,
  };
}

// Export singleton instance
export const socketManager = SocketManager.getInstance(); 