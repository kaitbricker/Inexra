'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  platform: string;
}

interface MessageListProps {
  messages: Message[];
  onMessageClick?: (message: Message) => void;
  onLoadMore?: () => Promise<void>;
  isLoading?: boolean;
  hasMore?: boolean;
}

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  },
} as const;

const STATUS_COLORS = {
  sent: 'text-blue-500',
  delivered: 'text-green-500',
  read: 'text-purple-500',
  failed: 'text-red-500',
} as const;

const MessageList: React.FC<MessageListProps> = ({
  messages,
  onMessageClick,
  onLoadMore,
  isLoading = false,
  hasMore = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const filteredMessages = useMemo(() => {
    return messages.filter((message) => {
      const matchesSearch = message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.sender.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform = !selectedPlatform || message.platform === selectedPlatform;
      const matchesStatus = !selectedStatus || message.status === selectedStatus;
      return matchesSearch && matchesPlatform && matchesStatus;
    });
  }, [messages, searchQuery, selectedPlatform, selectedStatus]);

  const platforms = useMemo(() => {
    const uniquePlatforms = new Set(messages.map((message) => message.platform));
    return Array.from(uniquePlatforms);
  }, [messages]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handlePlatformFilter = useCallback((platform: string) => {
    setSelectedPlatform(selectedPlatform === platform ? null : platform);
  }, [selectedPlatform]);

  const handleStatusFilter = useCallback((status: string) => {
    setSelectedStatus(selectedStatus === status ? null : status);
  }, [selectedStatus]);

  const handleLoadMore = useCallback(async () => {
    if (onLoadMore) {
      await onLoadMore();
    }
  }, [onLoadMore]);

  return (
    <motion.div
      variants={ANIMATION_VARIANTS.container}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>View and manage your messages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {platforms.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <Button
                  key={platform}
                  variant={selectedPlatform === platform ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePlatformFilter(platform)}
                >
                  {platform}
                </Button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {Object.keys(STATUS_COLORS).map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusFilter(status)}
                className={selectedStatus === status ? STATUS_COLORS[status as keyof typeof STATUS_COLORS] : ''}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredMessages.map((message) => (
              <motion.div
                key={message.id}
                variants={ANIMATION_VARIANTS.item}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => onMessageClick?.(message)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{message.sender}</p>
                    <p className="text-sm text-gray-500">{message.content}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-sm ${STATUS_COLORS[message.status]}`}>
                      {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500">{message.timestamp}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

MessageList.displayName = 'MessageList';

export default MessageList; 