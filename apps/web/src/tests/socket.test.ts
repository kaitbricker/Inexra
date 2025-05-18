import { io as Client } from 'socket.io-client';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import { socketService } from '@/lib/socket';

describe('WebSocket Server', () => {
  let httpServer: any;
  let clientSocket: any;
  let serverAddress: AddressInfo;

  beforeAll(done => {
    httpServer = createServer();
    socketService.initialize(httpServer);
    httpServer.listen(() => {
      serverAddress = httpServer.address() as AddressInfo;
      done();
    });
  });

  afterAll(() => {
    httpServer.close();
  });

  beforeEach(done => {
    clientSocket = Client(`http://localhost:${serverAddress.port}`, {
      auth: {
        userId: 'test-user',
      },
    });
    clientSocket.on('connect', done);
  });

  afterEach(() => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  it('should connect with valid authentication', done => {
    expect(clientSocket.connected).toBe(true);
    done();
  });

  it('should disconnect with invalid authentication', done => {
    const invalidSocket = Client(`http://localhost:${serverAddress.port}`);
    invalidSocket.on('disconnect', () => {
      expect(invalidSocket.connected).toBe(false);
      done();
    });
  });

  it('should handle message events', done => {
    const messageData = {
      content: 'Test message',
      senderId: 'test-user',
      recipientId: 'other-user',
      conversationId: 'test-conversation',
    };

    clientSocket.emit('message:new', messageData);

    clientSocket.on('message:created', (data: any) => {
      expect(data).toMatchObject({
        content: messageData.content,
        senderId: messageData.senderId,
        recipientId: messageData.recipientId,
        conversationId: messageData.conversationId,
      });
      done();
    });
  });

  it('should handle conversation events', done => {
    const conversationId = 'test-conversation';

    clientSocket.emit('conversation:join', conversationId);

    // Create another client to simulate a conversation partner
    const otherClient = Client(`http://localhost:${serverAddress.port}`, {
      auth: {
        userId: 'other-user',
      },
    });

    otherClient.on('connect', () => {
      otherClient.emit('conversation:join', conversationId);

      // Send a message that should be received by both clients
      const messageData = {
        content: 'Test message',
        senderId: 'test-user',
        recipientId: 'other-user',
        conversationId,
      };

      clientSocket.emit('message:new', messageData);

      otherClient.on('message:created', (data: any) => {
        expect(data).toMatchObject(messageData);
        otherClient.disconnect();
        done();
      });
    });
  });

  it('should handle lead score updates', done => {
    const leadData = {
      conversationId: 'test-conversation',
      score: 0.8,
    };

    clientSocket.emit('lead:update', leadData);

    clientSocket.on('lead:updated', (data: any) => {
      expect(data).toMatchObject({
        id: leadData.conversationId,
        leadScore: leadData.score,
        priority: 'high',
      });
      done();
    });
  });

  it('should enforce connection limits', done => {
    const clients = [];
    const maxConnections = 3;

    // Create multiple connections for the same user
    for (let i = 0; i < maxConnections + 1; i++) {
      const client = Client(`http://localhost:${serverAddress.port}`, {
        auth: {
          userId: 'test-user',
        },
      });
      clients.push(client);
    }

    // The last client should be disconnected
    clients[maxConnections].on('error', (error: any) => {
      expect(error.message).toBe('Connection limit exceeded');
      clients.forEach(client => client.disconnect());
      done();
    });
  });

  it('should handle disconnection cleanup', done => {
    const userId = 'test-user';
    const conversationId = 'test-conversation';

    clientSocket.emit('conversation:join', conversationId);

    clientSocket.on('disconnect', () => {
      // Create a new client to verify the old one was cleaned up
      const newClient = Client(`http://localhost:${serverAddress.port}`, {
        auth: {
          userId,
        },
      });

      newClient.on('connect', () => {
        expect(newClient.connected).toBe(true);
        newClient.disconnect();
        done();
      });
    });

    clientSocket.disconnect();
  });
});
