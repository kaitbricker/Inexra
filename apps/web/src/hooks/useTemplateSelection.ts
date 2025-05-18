import { useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

interface Template {
  id: string;
  name: string;
  content: string;
  category: 'sales' | 'support' | 'collaboration' | 'custom';
  keywords: string[];
}

interface UseTemplateSelectionProps {
  onTemplateInserted?: (template: Template) => void;
  onError?: (error: Error) => void;
}

export function useTemplateSelection({
  onTemplateInserted,
  onError,
}: UseTemplateSelectionProps = {}) {
  const { socket } = useWebSocket();

  const insertTemplate = useCallback(
    async (template: Template, context?: { messageId?: string; conversationId?: string }) => {
      try {
        // If we have a message ID, insert the template as a reply
        if (context?.messageId) {
          const response = await fetch(`/api/messages/${context.messageId}/reply`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: template.content,
              templateId: template.id,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to insert template reply');
          }

          const message = await response.json();
          socket?.emit('message:new', message);
          onTemplateInserted?.(template);
          return message;
        }

        // If we have a conversation ID, insert the template as a new message
        if (context?.conversationId) {
          const response = await fetch(`/api/conversations/${context.conversationId}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: template.content,
              templateId: template.id,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to insert template message');
          }

          const message = await response.json();
          socket?.emit('message:new', message);
          onTemplateInserted?.(template);
          return message;
        }

        throw new Error('No message or conversation context provided');
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to insert template');
        onError?.(err);
        throw err;
      }
    },
    [socket, onTemplateInserted, onError]
  );

  const getSuggestedTemplates = useCallback(
    async (context: { message?: string; category?: string }) => {
      try {
        const response = await fetch('/api/templates/suggest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(context),
        });

        if (!response.ok) {
          throw new Error('Failed to get suggested templates');
        }

        const data = await response.json();
        return data.templates as Template[];
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Failed to get suggested templates');
        onError?.(err);
        throw err;
      }
    },
    [onError]
  );

  return {
    insertTemplate,
    getSuggestedTemplates,
  };
}
