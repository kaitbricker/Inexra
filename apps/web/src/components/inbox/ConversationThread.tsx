'use client';

import { useState, useEffect } from 'react';
import { Conversation, Message, SocialAccount } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageAnalysis as MessageAnalysisType } from '@/types/analysis';
import { useSocket } from '@/hooks/useSocket';
import { MessageAnalysis } from './MessageAnalysis';

interface ConversationThreadProps {
  conversation: (Conversation & { userId: string }) & {
    messages: (Message & {
      socialAccount: SocialAccount;
      metadata?: {
        analysis?: MessageAnalysisType;
      };
    })[];
  };
  onNewMessage: (message: Message & { socialAccount: SocialAccount }) => void;
}

export function ConversationThread({ conversation, onNewMessage }: ConversationThreadProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { joinConversation, leaveConversation, onNewMessage: onSocketNewMessage } = useSocket();

  useEffect(() => {
    joinConversation(conversation.id);
    const handleNewMessage = (message: Message & { socialAccount: SocialAccount }) => {
      onNewMessage(message);
    };
    onSocketNewMessage(handleNewMessage);
    return () => {
      leaveConversation(conversation.id);
    };
  }, [conversation.id, joinConversation, leaveConversation, onSocketNewMessage, onNewMessage]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: conversation.id,
          content: newMessage,
          platform: conversation.platform,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const message = await response.json();
      onNewMessage(message);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.map(message => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === conversation.userId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.senderId === conversation.userId
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
              </p>
              {message.metadata?.analysis && (
                <div className="mt-2">
                  <MessageAnalysis analysis={message.metadata.analysis} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={isSending}
          />
          <Button type="submit" disabled={isSending}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
