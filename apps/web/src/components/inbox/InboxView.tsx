'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Conversation } from '@prisma/client';
import { Message } from '@prisma/client';
import { SocialAccount } from '@prisma/client';
import { ConversationList } from './ConversationList';
import { ConversationThread } from './ConversationThread';

interface InboxViewProps {
  conversations: (Conversation & {
    messages: (Message & {
      socialAccount: SocialAccount;
    })[];
  })[];
}

export function InboxView({ conversations: initialConversations }: InboxViewProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState(initialConversations);

  const selectedConversation = conversations.find(
    conversation => conversation.id === selectedConversationId
  );

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const handleNewMessage = (conversationId: string, message: Message) => {
    setConversations(prevConversations =>
      prevConversations.map(conversation => {
        if (conversation.id === conversationId) {
          return {
            ...conversation,
            messages: [message, ...conversation.messages],
            updatedAt: new Date(),
          };
        }
        return conversation;
      })
    );
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
      <div className="col-span-4">
        <Card className="h-full overflow-hidden">
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleConversationSelect}
          />
        </Card>
      </div>
      <div className="col-span-8">
        <Card className="h-full overflow-hidden">
          {selectedConversation ? (
            <ConversationThread
              conversation={selectedConversation}
              onNewMessage={handleNewMessage}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a conversation to view messages
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
