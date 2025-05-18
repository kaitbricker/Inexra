import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  XMarkIcon,
  ChartBarIcon,
  ClockIcon,
  TagIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { TemplateAnalytics as TemplateAnalyticsType } from '../../types';

interface TemplateAnalyticsProps {
  analytics: Record<string, TemplateAnalyticsType>;
  onClose: () => void;
  onUpdate: (templateId: string, updates: Partial<TemplateAnalyticsType>) => Promise<void>;
}

export const TemplateAnalytics: React.FC<TemplateAnalyticsProps> = ({
  analytics,
  onClose,
  onUpdate,
}) => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Process data for charts
  const processTimeData = (data: TemplateAnalyticsType) => {
    const timeStats = data.timeStats || {};
    const hourly = Object.entries(timeStats.hourly || {}).map(([hour, value]) => ({
      time: `${hour}:00`,
      value,
    }));
    const daily = Object.entries(timeStats.daily || {}).map(([date, value]) => ({
      date,
      value,
    }));
    const weekly = Object.entries(timeStats.weekly || {}).map(([week, value]) => ({
      week,
      value,
    }));

    return { hourly, daily, weekly };
  };

  // Get top performing templates
  const topTemplates = Object.entries(analytics)
    .sort(([, a], [, b]) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, 5);

  // Get category performance
  const categoryPerformance = Object.entries(analytics).reduce(
    (acc, [, data]) => {
      const category = data.categoryStats?.category || 'uncategorized';
      if (!acc[category]) {
        acc[category] = {
          usageCount: 0,
          avgResponseTime: 0,
          engagementRate: 0,
          conversionRate: 0,
        };
      }
      acc[category].usageCount += data.usageCount || 0;
      acc[category].avgResponseTime += data.avgResponseTime || 0;
      acc[category].engagementRate += data.engagementRate || 0;
      acc[category].conversionRate += data.conversionRate || 0;
      return acc;
    },
    {} as Record<string, any>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Template Analytics</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 overflow-auto max-h-[calc(90vh-8rem)]">
          {/* Filters */}
          <div className="flex space-x-4 mb-4">
            <select
              value={timeRange}
              onChange={e => setTimeRange(e.target.value as 'day' | 'week' | 'month')}
              className="select select-bordered"
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
            </select>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="select select-bordered"
            >
              <option value="all">All Categories</option>
              <option value="sales">Sales</option>
              <option value="support">Support</option>
              <option value="collaboration">Collaboration</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Usage Over Time */}
            <div className="card">
              <div className="card-body">
                <h3 className="card-title">Usage Over Time</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={processTimeData(analytics[Object.keys(analytics)[0]]).daily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" name="Usage Count" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Category Performance */}
            <div className="card">
              <div className="card-body">
                <h3 className="card-title">Category Performance</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(categoryPerformance).map(([category, data]) => ({
                        category,
                        usageCount: data.usageCount,
                        engagementRate: data.engagementRate,
                        conversionRate: data.conversionRate,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="usageCount" fill="#8884d8" name="Usage Count" />
                      <Bar dataKey="engagementRate" fill="#82ca9d" name="Engagement Rate" />
                      <Bar dataKey="conversionRate" fill="#ffc658" name="Conversion Rate" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Top Templates */}
            <div className="card">
              <div className="card-body">
                <h3 className="card-title">Top Templates</h3>
                <div className="space-y-4">
                  {topTemplates.map(([id, data]) => (
                    <div
                      key={id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <div className="font-medium">{data.template?.name}</div>
                        <div className="text-sm text-gray-500">{data.template?.category}</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm">
                          <DocumentDuplicateIcon className="h-4 w-4 inline mr-1" />
                          {data.usageCount}
                        </div>
                        <div className="text-sm">
                          <ClockIcon className="h-4 w-4 inline mr-1" />
                          {data.avgResponseTime}s
                        </div>
                        <div className="text-sm">
                          <ChartBarIcon className="h-4 w-4 inline mr-1" />
                          {data.engagementRate}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Response Time Distribution */}
            <div className="card">
              <div className="card-body">
                <h3 className="card-title">Response Time Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(analytics).map(([id, data]) => ({
                        template: data.template?.name,
                        responseTime: data.avgResponseTime,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="template" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="responseTime" fill="#8884d8" name="Response Time (s)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
