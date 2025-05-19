import { PrismaClient } from '@prisma/client';
import { processNewMessage } from '../messages/processor';

const prisma = new PrismaClient();

interface InstagramMessage {
  id: string;
  text: string;
  from: {
    id: string;
    username: string;
  };
  timestamp: string;
}

export class InstagramService {
  private accessToken: string;
  private socialAccountId: string;

  constructor(accessToken: string, socialAccountId: string) {
    this.accessToken = accessToken;
    this.socialAccountId = socialAccountId;
  }

  async handleWebhook(payload: any) {
    try {
      if (payload.object === 'instagram' && payload.entry) {
        for (const entry of payload.entry) {
          for (const change of entry.changes) {
            if (change.field === 'messages') {
              await this.processMessage(change.value);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error handling Instagram webhook:', error);
      throw error;
    }
  }

  private async processMessage(message: InstagramMessage) {
    try {
      // Create or get conversation
      let conversation = await prisma.conversation.findFirst({
        where: {
          platform: 'instagram',
          messages: {
            some: {
              OR: [
                { senderId: message.from.id, recipientId: 'me' },
                { senderId: 'me', recipientId: message.from.id },
              ],
            },
          },
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            platform: 'instagram',
            status: 'active',
          },
        });
      }

      // Create message in database
      const dbMessage = await prisma.message.create({
        data: {
          platform: 'instagram',
          senderId: message.from.id,
          recipientId: 'me',
          content: message.text,
          timestamp: new Date(message.timestamp),
          socialAccountId: this.socialAccountId,
          conversationId: conversation.id,
        },
      });

      // Process message with AI
      await processNewMessage(dbMessage);

      return dbMessage;
    } catch (error) {
      console.error('Error processing Instagram message:', error);
      throw error;
    }
  }

  async sendMessage(recipientId: string, text: string) {
    try {
      const response = await fetch(`https://graph.instagram.com/v12.0/me/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send Instagram message: ${response.statusText}`);
      }

      const result = await response.json();

      // Create message in database
      const conversation = await prisma.conversation.findFirst({
        where: {
          platform: 'instagram',
          messages: {
            some: {
              OR: [
                { senderId: 'me', recipientId },
                { senderId: recipientId, recipientId: 'me' },
              ],
            },
          },
        },
      });

      if (conversation) {
        await prisma.message.create({
          data: {
            platform: 'instagram',
            senderId: 'me',
            recipientId,
            content: text,
            timestamp: new Date(),
            socialAccountId: this.socialAccountId,
            conversationId: conversation.id,
          },
        });
      }

      return result;
    } catch (error) {
      console.error('Error sending Instagram message:', error);
      throw error;
    }
  }
}
