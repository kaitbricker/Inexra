'use client';

import { Conversation } from '@prisma/client';
import { Message } from '@prisma/client';
import { SocialAccount } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { Instagram, Twitter, Linkedin } from 'lucide-react';

interface ConversationListProps {
  conversations: (Conversation & {
    messages: (Message & {
      socialAccount: SocialAccount;
    })[];
  })[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

const platformIcons = {
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
};

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Conversations</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map(conversation => {
          const lastMessage = conversation.messages[0];
          const PlatformIcon = platformIcons[conversation.platform as keyof typeof platformIcons];

          return (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`w-full p-4 border-b hover:bg-gray-50 transition-colors ${
                selectedConversationId === conversation.id ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <PlatformIcon className="h-6 w-6 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {lastMessage.socialAccount.username || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(lastMessage.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{lastMessage.content}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
