'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/styles/theme';

interface AnalyticsData {
  retention: {
    date: string;
    rate: number;
  }[];
  referrals: {
    date: string;
    count: number;
    conversions: number;
  }[];
  segments: {
    name: string;
    value: number;
  }[];
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

export function UserAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch('/api/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics data');
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className={cn('p-6 rounded-lg shadow-lg', isDark ? 'bg-gray-800' : 'bg-white')}>
          <h3 className="text-lg font-semibold mb-2">User Retention</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.retention}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="rate" stroke="#4F46E5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cn('p-6 rounded-lg shadow-lg', isDark ? 'bg-gray-800' : 'bg-white')}>
          <h3 className="text-lg font-semibold mb-2">Referral Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.referrals}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" />
                <Bar dataKey="conversions" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cn('p-6 rounded-lg shadow-lg', isDark ? 'bg-gray-800' : 'bg-white')}>
          <h3 className="text-lg font-semibold mb-2">User Segments</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.segments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={COLORS[0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={cn('p-6 rounded-lg shadow-lg', isDark ? 'bg-gray-800' : 'bg-white')}
      >
        <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900">
            <p className="text-sm text-blue-600 dark:text-blue-200">Active Users</p>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-100">
              {data.retention[data.retention.length - 1]?.rate || 0}%
            </p>
          </div>
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900">
            <p className="text-sm text-green-600 dark:text-green-200">Total Referrals</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-100">
              {data.referrals.reduce((sum, item) => sum + item.count, 0)}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900">
            <p className="text-sm text-yellow-600 dark:text-yellow-200">Conversion Rate</p>
            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-100">
              {(
                (data.referrals.reduce((sum, item) => sum + item.conversions, 0) /
                  data.referrals.reduce((sum, item) => sum + item.count, 0)) *
                100
              ).toFixed(1)}
              %
            </p>
          </div>
          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900">
            <p className="text-sm text-purple-600 dark:text-purple-200">User Segments</p>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-100">
              {data.segments.length}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
