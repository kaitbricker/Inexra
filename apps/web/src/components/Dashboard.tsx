import React, { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import SearchBar from './SearchBar';
import { useMessageTemplates } from '../hooks/useMessageTemplates';
import MessageTemplate from './MessageTemplate';
import { useTemplateSelection } from '../hooks/useTemplateSelection';

interface Message {
  id: string;
  content: string;
  sentimentScore: number;
  leadScore: number;
  keywords: string[];
  createdAt: string;
}

interface Conversation {
  id: string;
  status: string;
  sentimentSummary: number;
  engagementScore: number;
  leadScore: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface KeywordFrequency {
  keyword: string;
  count: number;
}

interface SearchFilters {
  sentiment: 'positive' | 'negative' | 'neutral' | 'all';
  priority: 'high' | 'medium' | 'low' | 'all';
  dateRange: '1h' | '24h' | '7d' | 'all';
  keywords: string[];
}

export default function Dashboard() {
  const { onMessage, onConversation, onError } = useWebSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [keywordFrequencies, setKeywordFrequencies] = useState<KeywordFrequency[]>([]);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    sentiment: 'all',
    priority: 'all',
    dateRange: 'all',
    keywords: [],
  });
  const {
    templates,
    suggestedTemplates,
    isLoading: templatesLoading,
    saveTemplate,
    updateTemplate,
    deleteTemplate,
    getSuggestedTemplates,
  } = useMessageTemplates();

  const {
    insertTemplate,
    getSuggestedTemplates: getContextualTemplates,
  } = useTemplateSelection({
    onTemplateInserted: (template) => {
      // Show success notification
      console.log('Template inserted:', template);
    },
    onError: (error) => {
      // Show error notification
      console.error('Error inserting template:', error);
    },
  });

  useEffect(() => {
    const unsubscribeMessage = onMessage((message) => {
      setMessages((prev) => [...prev, message]);
      updateKeywordFrequencies([...messages, message]);
    });

    const unsubscribeConversation = onConversation((conversation) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversation.id ? { ...c, ...conversation } : c
        )
      );
    });

    const unsubscribeError = onError((error) => {
      console.error('WebSocket error:', error);
    });

    return () => {
      unsubscribeMessage();
      unsubscribeConversation();
      unsubscribeError();
    };
  }, [onMessage, onConversation, onError]);

  const updateKeywordFrequencies = (msgs: Message[]) => {
    const frequencies = msgs.reduce((acc, msg) => {
      msg.keywords.forEach((keyword) => {
        acc[keyword] = (acc[keyword] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    setKeywordFrequencies(
      Object.entries(frequencies)
        .map(([keyword, count]) => ({ keyword, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    );
  };

  const handleSearch = useCallback((query: string, filters: SearchFilters) => {
    setSearchQuery(query);
    setSearchFilters(filters);
  }, []);

  const getFilteredMessages = useCallback(() => {
    let filtered = messages;

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (msg) =>
          msg.content.toLowerCase().includes(query) ||
          msg.keywords.some((k) => k.toLowerCase().includes(query))
      );
    }

    // Apply sentiment filter
    if (searchFilters.sentiment !== 'all') {
      filtered = filtered.filter((msg) => {
        const score = msg.sentimentScore;
        switch (searchFilters.sentiment) {
          case 'positive':
            return score >= 0.7;
          case 'neutral':
            return score >= 0.4 && score < 0.7;
          case 'negative':
            return score < 0.4;
          default:
            return true;
        }
      });
    }

    // Apply priority filter
    if (searchFilters.priority !== 'all') {
      const conversationIds = conversations
        .filter((c) => c.priority === searchFilters.priority.toUpperCase())
        .map((c) => c.id);
      filtered = filtered.filter((msg) =>
        conversationIds.includes(msg.conversationId)
      );
    }

    // Apply date range filter
    if (searchFilters.dateRange !== 'all') {
      const now = new Date();
      const timeRanges = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
      };
      filtered = filtered.filter(
        (msg) =>
          now.getTime() - new Date(msg.createdAt).getTime() <=
          timeRanges[searchFilters.dateRange]
      );
    }

    // Apply keyword filter
    if (searchFilters.keywords.length > 0) {
      filtered = filtered.filter((msg) =>
        searchFilters.keywords.some((keyword) =>
          msg.keywords.includes(keyword.toLowerCase())
        )
      );
    }

    return filtered;
  }, [messages, conversations, searchQuery, searchFilters]);

  const getFilteredConversations = useCallback(() => {
    let filtered = conversations;

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (conv) =>
          conv.id.toLowerCase().includes(query) ||
          messages
            .filter((msg) => msg.conversationId === conv.id)
            .some((msg) => msg.content.toLowerCase().includes(query))
      );
    }

    // Apply priority filter
    if (searchFilters.priority !== 'all') {
      filtered = filtered.filter(
        (conv) => conv.priority === searchFilters.priority.toUpperCase()
      );
    }

    // Apply date range filter
    if (searchFilters.dateRange !== 'all') {
      const now = new Date();
      const timeRanges = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
      };
      filtered = filtered.filter((conv) =>
        messages
          .filter((msg) => msg.conversationId === conv.id)
          .some(
            (msg) =>
              now.getTime() - new Date(msg.createdAt).getTime() <=
              timeRanges[searchFilters.dateRange]
          )
      );
    }

    return filtered;
  }, [conversations, messages, searchQuery, searchFilters]);

  const getSentimentColor = (score: number) => {
    if (score >= 0.7) return '#10B981'; // green
    if (score >= 0.4) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  // Handle template selection
  const handleTemplateSelect = async (template: any) => {
    try {
      // Get the current conversation context
      const activeConversation = getFilteredConversations()[0];
      if (!activeConversation) {
        throw new Error('No active conversation found');
      }

      // Insert the template into the conversation
      await insertTemplate(template, {
        conversationId: activeConversation.id,
      });
    } catch (error) {
      console.error('Error selecting template:', error);
    }
  };

  // Get suggested templates based on current message context
  const handleGetSuggestedTemplates = async (message: string) => {
    try {
      const templates = await getContextualTemplates({
        message,
        category: 'support', // TODO: Determine category based on context
      });
      // Update suggested templates in the MessageTemplate component
      // This will be handled by the useMessageTemplates hook
    } catch (error) {
      console.error('Error getting suggested templates:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-2">
          {(['1h', '24h', '7d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                timeRange === range
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <SearchBar onSearch={handleSearch} onFilterChange={setSearchFilters} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <h2 className="text-lg font-semibold mb-4">Sentiment Trend</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getFilteredMessages()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="createdAt"
                  tickFormatter={(date) =>
                    formatDistanceToNow(new Date(date), { addSuffix: true })
                  }
                />
                <YAxis domain={[0, 1]} />
                <Tooltip
                  labelFormatter={(date) =>
                    new Date(date).toLocaleString()
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sentimentScore"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <h2 className="text-lg font-semibold mb-4">Keyword Frequency</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={keywordFrequencies}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="keyword" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6">
                  {keywordFrequencies.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(${(index * 360) / keywordFrequencies.length}, 70%, 50%)`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <h2 className="text-lg font-semibold mb-4">Recent Messages</h2>
          <div className="space-y-4">
            <AnimatePresence>
              {getFilteredMessages().slice(-5).map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="border-b pb-4 last:border-b-0"
                >
                  <p className="text-sm text-gray-600">{message.content}</p>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: getSentimentColor(message.sentimentScore),
                        }}
                      />
                      <span className="text-xs text-gray-500">
                        {message.sentimentScore.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <h2 className="text-lg font-semibold mb-4">Active Conversations</h2>
          <div className="space-y-4">
            <AnimatePresence>
              {getFilteredConversations()
                .filter((c) => c.status === 'OPEN')
                .slice(-5)
                .map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="border-b pb-4 last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Conversation {conversation.id}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          conversation.priority === 'HIGH'
                            ? 'bg-red-100 text-red-800'
                            : conversation.priority === 'MEDIUM'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {conversation.priority}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Engagement: {conversation.engagementScore.toFixed(2)}</span>
                      <span>Lead: {conversation.leadScore.toFixed(2)}</span>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <h2 className="text-lg font-semibold mb-4">Lead Score Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getFilteredConversations()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="leadScore" fill="#3B82F6">
                  {getFilteredConversations().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.priority === 'HIGH'
                          ? '#EF4444'
                          : entry.priority === 'MEDIUM'
                          ? '#F59E0B'
                          : '#10B981'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <h2 className="text-lg font-semibold mb-4">Message Templates</h2>
          <MessageTemplate
            templates={templates}
            suggestedTemplates={suggestedTemplates}
            onSelect={handleTemplateSelect}
            onSave={saveTemplate}
            onUpdate={updateTemplate}
            onDelete={deleteTemplate}
          />
        </motion.div>
      </div>
    </div>
  );
} 