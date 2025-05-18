import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { formatDistanceToNow } from 'date-fns';

interface Feedback {
  id: string;
  type: 'bug' | 'feature' | 'improvement' | 'other';
  content: string;
  url: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface FeedbackListProps {
  feedback: Feedback[];
  onStatusChange?: (id: string, status: string) => void;
}

export function FeedbackList({ feedback, onStatusChange }: FeedbackListProps) {
  const { isDark } = useTheme();
  const [filter, setFilter] = useState<string>('all');

  const filteredFeedback = feedback.filter(item => filter === 'all' || item.type === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">User Feedback</h2>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
        >
          <option value="all">All Types</option>
          <option value="bug">Bugs</option>
          <option value="feature">Features</option>
          <option value="improvement">Improvements</option>
          <option value="other">Other</option>
        </select>
      </div>

      <AnimatePresence>
        {filteredFeedback.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-gray-800 dark:text-gray-200">{item.content}</p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>From: {item.user.name}</p>
                  <p>URL: {item.url}</p>
                </div>
              </div>
              {onStatusChange && (
                <select
                  onChange={e => onStatusChange(item.id, e.target.value)}
                  className="px-2 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                >
                  <option value="new">New</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {filteredFeedback.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">No feedback found</div>
      )}
    </div>
  );
}
