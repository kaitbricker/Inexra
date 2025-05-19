import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
} from 'recharts';
import { motion } from 'framer-motion';
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
  conversationId: string;
}

interface Conversation {
  id: string;
  status: string;
  sentimentSummary: number;
  engagementScore: number;
  leadScore: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  createdAt: string;
  keywords: string[];
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

type TimeRange = '1h' | '24h' | '7d';

const TIME_RANGE_MAP: Record<TimeRange, number> = {
  '1h': 3600000,
  '24h': 86400000,
  '7d': 604800000,
};

const SENTIMENT_COLORS = {
  positive: '#10B981',
  neutral: '#F59E0B',
  negative: '#EF4444',
} as const;

const PRIORITY_COLORS = {
  HIGH: 'bg-red-100 text-red-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-green-100 text-green-800',
} as const;

const Dashboard: React.FC = () => {
  const { send, connected } = useWebSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [keywordFrequencies, setKeywordFrequencies] = useState<KeywordFrequency[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
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
    saveTemplate,
    updateTemplate,
    deleteTemplate,
  } = useMessageTemplates();

  const { insertTemplate, getSuggestedTemplates: getContextualTemplates } = useTemplateSelection({
    onTemplateInserted: (template) => {
      // TODO: Add toast notification
    },
    onError: (error) => {
      // TODO: Add error notification
    },
  });

  useEffect(() => {
    if (!connected) return;

    const handleMessage = (data: Message | Conversation) => {
      if ('content' in data) {
        setMessages((prev) => [...prev, data as Message]);
        updateKeywordFrequencies([...messages, data as Message]);
      } else {
        setConversations((prev) =>
          prev.map((c) => (c.id === data.id ? { ...c, ...data } : c))
        );
      }
    };

    // WebSocket event listeners would be set up here
    return () => {
      // Cleanup would be handled by useWebSocket hook
    };
  }, [connected, messages]);

  const updateKeywordFrequencies = useCallback((msgs: Message[]) => {
    const now = Date.now();
    const filteredMessages = msgs.filter(
      (msg) => now - new Date(msg.createdAt).getTime() <= TIME_RANGE_MAP[timeRange]
    );

    const frequencies: Record<string, number> = {};
    filteredMessages.forEach((msg) => {
      msg.keywords.forEach((keyword) => {
        frequencies[keyword] = (frequencies[keyword] || 0) + 1;
      });
    });

    setKeywordFrequencies(
      Object.entries(frequencies)
        .map(([keyword, count]) => ({ keyword, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    );
  }, [timeRange]);

  const handleSearch = useCallback((query: string, filters: SearchFilters) => {
    setSearchQuery(query);
    setSearchFilters(filters);
  }, []);

  const getFilteredMessages = useMemo(() => {
    let filtered = messages;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (msg) =>
          msg.content.toLowerCase().includes(query) ||
          msg.keywords.some((k) => k.toLowerCase().includes(query))
      );
    }

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

    if (searchFilters.priority !== 'all') {
      const conversationIds = conversations
        .filter((c) => c.priority === searchFilters.priority.toUpperCase())
        .map((c) => c.id);
      filtered = filtered.filter((msg) => conversationIds.includes(msg.conversationId));
    }

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
          timeRanges[searchFilters.dateRange as '1h' | '24h' | '7d']
      );
    }

    if (searchFilters.keywords.length > 0) {
      filtered = filtered.filter((msg) =>
        searchFilters.keywords.some((keyword) => msg.keywords.includes(keyword.toLowerCase()))
      );
    }

    return filtered;
  }, [messages, conversations, searchQuery, searchFilters]);

  const getFilteredConversations = useMemo(() => {
    const now = Date.now();
    return conversations.filter((conv) => {
      let matchesTimeRange = true;
      if (searchFilters.dateRange !== 'all') {
        matchesTimeRange =
          now - new Date(conv.createdAt).getTime() <=
          TIME_RANGE_MAP[searchFilters.dateRange as TimeRange];
      }

      const matchesPriority =
        searchFilters.priority === 'all' || conv.priority.toLowerCase() === searchFilters.priority;

      const matchesSentiment =
        searchFilters.sentiment === 'all' ||
        (searchFilters.sentiment === 'positive' && conv.sentimentSummary > 0) ||
        (searchFilters.sentiment === 'negative' && conv.sentimentSummary < 0) ||
        (searchFilters.sentiment === 'neutral' && conv.sentimentSummary === 0);

      const matchesKeywords =
        searchFilters.keywords.length === 0 ||
        searchFilters.keywords.some((keyword) => conv.keywords.includes(keyword));

      return matchesTimeRange && matchesPriority && matchesSentiment && matchesKeywords;
    });
  }, [conversations, searchFilters]);

  const getSentimentColor = useCallback((score: number): string => {
    if (score >= 0.7) return SENTIMENT_COLORS.positive;
    if (score >= 0.4) return SENTIMENT_COLORS.neutral;
    return SENTIMENT_COLORS.negative;
  }, []);

  const handleTemplateSelect = useCallback(async (template: any) => {
    try {
      const activeConversation = getFilteredConversations[0];
      if (!activeConversation) {
        throw new Error('No active conversation found');
      }

      await insertTemplate(template, {
        conversationId: activeConversation.id,
      });
    } catch (error) {
      // TODO: Add error handling
    }
  }, [getFilteredConversations, insertTemplate]);

  const handleTimeRangeChange = useCallback((range: TimeRange) => {
    setTimeRange(range);
    updateKeywordFrequencies(messages);
  }, [messages, updateKeywordFrequencies]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-2">
          {(['1h', '24h', '7d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => handleTimeRangeChange(range)}
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
              <LineChart data={getFilteredMessages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="createdAt"
                  tickFormatter={(date: string) =>
                    formatDistanceToNow(new Date(date), { addSuffix: true })
                  }
                />
                <YAxis domain={[0, 1]} />
                <Tooltip labelFormatter={(date: string) => new Date(date).toLocaleString()} />
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
                    <motion.div
                      key={`cell-${index}`}
                      className="h-6 w-6 rounded-full"
                      style={{
                        backgroundColor: `hsl(${(index * 360) / keywordFrequencies.length}, 70%, 50%)`,
                      }}
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
            {getFilteredMessages.slice(-5).map((message) => (
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
            {getFilteredConversations
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
                    <span className="text-sm font-medium">Conversation {conversation.id}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        PRIORITY_COLORS[conversation.priority]
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
              <BarChart data={getFilteredConversations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="leadScore" fill="#3B82F6">
                  {getFilteredConversations.map((entry, index) => (
                    <motion.div
                      key={`cell-${index}`}
                      className="h-6 w-6 rounded-full"
                      style={{
                        backgroundColor:
                          entry.priority === 'HIGH'
                            ? SENTIMENT_COLORS.negative
                            : entry.priority === 'MEDIUM'
                            ? SENTIMENT_COLORS.neutral
                            : SENTIMENT_COLORS.positive,
                      }}
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
};

Dashboard.displayName = 'Dashboard';

export default Dashboard;
