import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '../common/Button';
import { Textarea } from '../common/Textarea';
import { Select } from '../common/Select';
import { captureMessage } from '@/lib/sentry';

interface FeedbackWidgetProps {
  className?: string;
}

type FeedbackType = 'bug' | 'feature' | 'improvement' | 'other';

export function FeedbackWidget({ className = '' }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [type, setType] = useState<FeedbackType>('improvement');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          feedback,
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      // Log feedback submission
      captureMessage('Feedback submitted', {
        type,
        url: window.location.href,
      });

      setFeedback('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`mb-4 w-96 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-4`}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Share Your Feedback
              </h3>
              <Select
                label="Feedback Type"
                value={type}
                onChange={e => setType(e.target.value as FeedbackType)}
                options={[
                  { value: 'bug', label: 'Bug Report' },
                  { value: 'feature', label: 'Feature Request' },
                  { value: 'improvement', label: 'Improvement' },
                  { value: 'other', label: 'Other' },
                ]}
              />
              <Textarea
                label="Your Feedback"
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Tell us what you think..."
                rows={4}
                required
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-full p-4 shadow-lg ${
          isDark ? 'bg-primary-600' : 'bg-primary-500'
        } text-white`}
        aria-label="Open feedback form"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
      </motion.button>
    </div>
  );
}
