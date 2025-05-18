import { EventEmitter } from 'events';

class WebSocketService extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000;
  private url: string;

  constructor(url: string) {
    super();
    this.url = url;
    this.connect();
  }

  private connect() {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          this.emit('message', data);
          // Emit specific events based on message type
          if (data.type) {
            this.emit(data.type, data.payload);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.emit('disconnected');
        this.reconnect();
      };

      this.ws.onerror = error => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.reconnect();
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), this.reconnectTimeout * this.reconnectAttempts);
    } else {
      this.emit('reconnect_failed');
    }
  }

  public send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Create a singleton instance that's only initialized on the client side
let wsService: WebSocketService | null = null;

if (typeof window !== 'undefined') {
  const wsUrl =
    process.env.NODE_ENV === 'production'
      ? `wss://${window.location.host}/api/ws`
      : 'ws://localhost:3000/api/ws';
  wsService = new WebSocketService(wsUrl);
}

export default wsService;
