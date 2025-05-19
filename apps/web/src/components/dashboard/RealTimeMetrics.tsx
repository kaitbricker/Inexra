'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';

interface MessageMetrics {
  timestamp: number;
  count: number;
  sentiment: number;
}

interface LeadMetrics {
  timestamp: number;
  high: number;
  medium: number;
  low: number;
}

export function RealTimeMetrics() {
  const { socket } = useSocket();
  const [isConnected, setIsConnected] = useState(false);
  const [messageMetrics, setMessageMetrics] = useState<MessageMetrics[]>([]);
  const [leadMetrics, setLeadMetrics] = useState<LeadMetrics[]>([]);
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: any) => {
      setMessageMetrics(prev => {
        const newMetrics = [...prev];
        const timestamp = Date.now();
        const sentiment = data.metadata?.sentiment || 0;

        newMetrics.push({
          timestamp,
          count: 1,
          sentiment,
        });

        // Keep only last 30 minutes of data
        const thirtyMinutesAgo = timestamp - 30 * 60 * 1000;
        return newMetrics.filter(m => m.timestamp > thirtyMinutesAgo);
      });
    };

    const handleLeadUpdate = (data: any) => {
      setLeadMetrics(prev => {
        const newMetrics = [...prev];
        const timestamp = Date.now();
        const priority = data.priority;

        const lastMetric = newMetrics[newMetrics.length - 1] || {
          timestamp,
          high: 0,
          medium: 0,
          low: 0,
        };

        newMetrics.push({
          timestamp,
          high: priority === 'high' ? lastMetric.high + 1 : lastMetric.high,
          medium: priority === 'medium' ? lastMetric.medium + 1 : lastMetric.medium,
          low: priority === 'low' ? lastMetric.low + 1 : lastMetric.low,
        });

        // Keep only last 30 minutes of data
        const thirtyMinutesAgo = timestamp - 30 * 60 * 1000;
        return newMetrics.filter(m => m.timestamp > thirtyMinutesAgo);
      });
    };

    const handleUserActivity = (data: any) => {
      setActiveUsers(data.count);
    };

    socket.on('message:created', handleNewMessage);
    socket.on('lead:updated', handleLeadUpdate);
    socket.on('user:activity', handleUserActivity);

    return () => {
      socket.off('message:created', handleNewMessage);
      socket.off('lead:updated', handleLeadUpdate);
      socket.off('user:activity', handleUserActivity);
    };
  }, [socket]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Message Activity</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={messageMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(timestamp: number) => new Date(timestamp).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip labelFormatter={(timestamp: number) => new Date(timestamp).toLocaleString()} />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" name="Messages" />
              <Line type="monotone" dataKey="sentiment" stroke="#82ca9d" name="Sentiment" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Lead Distribution</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={leadMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(timestamp: number) => new Date(timestamp).toLocaleTimeString()}
              />
              <YAxis />
              <Tooltip labelFormatter={(timestamp: number) => new Date(timestamp).toLocaleString()} />
              <Legend />
              <Line type="monotone" dataKey="high" stroke="#ef4444" name="High Priority" />
              <Line type="monotone" dataKey="medium" stroke="#f59e0b" name="Medium Priority" />
              <Line type="monotone" dataKey="low" stroke="#10b981" name="Low Priority" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Active Users</h2>
        <div className="flex items-center justify-center h-32">
          <motion.div
            key={activeUsers}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-bold"
          >
            {activeUsers}
          </motion.div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className="text-lg">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
