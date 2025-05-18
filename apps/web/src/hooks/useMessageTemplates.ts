import { useState, useCallback, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';

interface Template {
  id: string;
  name: string;
  content: string;
  category: 'sales' | 'support' | 'collaboration' | 'custom';
  keywords: string[];
}

export function useMessageTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [suggestedTemplates, setSuggestedTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket } = useWebSocket();

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/templates');
        if (!response.ok) {
          throw new Error('Failed to load templates');
        }
        const data = await response.json();
        setTemplates(data.templates);
        setSuggestedTemplates(data.suggestedTemplates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load templates');
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  // Save new template
  const saveTemplate = useCallback(
    async (template: Omit<Template, 'id'>) => {
      try {
        const response = await fetch('/api/templates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(template),
        });

        if (!response.ok) {
          throw new Error('Failed to save template');
        }

        const savedTemplate = await response.json();
        setTemplates(prev => [...prev, savedTemplate]);

        // Notify other users about the new template
        socket?.emit('template:created', savedTemplate);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save template');
        throw err;
      }
    },
    [socket]
  );

  // Update existing template
  const updateTemplate = useCallback(
    async (template: Template) => {
      try {
        const response = await fetch(`/api/templates/${template.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(template),
        });

        if (!response.ok) {
          throw new Error('Failed to update template');
        }

        const updatedTemplate = await response.json();
        setTemplates(prev => prev.map(t => (t.id === template.id ? updatedTemplate : t)));

        // Notify other users about the template update
        socket?.emit('template:updated', updatedTemplate);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update template');
        throw err;
      }
    },
    [socket]
  );

  // Delete template
  const deleteTemplate = useCallback(
    async (templateId: string) => {
      try {
        const response = await fetch(`/api/templates/${templateId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete template');
        }

        setTemplates(prev => prev.filter(t => t.id !== templateId));

        // Notify other users about the template deletion
        socket?.emit('template:deleted', templateId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete template');
        throw err;
      }
    },
    [socket]
  );

  // Get suggested templates based on context
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
        setSuggestedTemplates(data.templates);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get suggested templates');
      }
    },
    []
  );

  // Listen for template events from other users
  useEffect(() => {
    if (!socket) return;

    const handleTemplateCreated = (template: Template) => {
      setTemplates(prev => [...prev, template]);
    };

    const handleTemplateUpdated = (template: Template) => {
      setTemplates(prev => prev.map(t => (t.id === template.id ? template : t)));
    };

    const handleTemplateDeleted = (templateId: string) => {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    };

    socket.on('template:created', handleTemplateCreated);
    socket.on('template:updated', handleTemplateUpdated);
    socket.on('template:deleted', handleTemplateDeleted);

    return () => {
      socket.off('template:created', handleTemplateCreated);
      socket.off('template:updated', handleTemplateUpdated);
      socket.off('template:deleted', handleTemplateDeleted);
    };
  }, [socket]);

  return {
    templates,
    suggestedTemplates,
    isLoading,
    error,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    getSuggestedTemplates,
  };
}
