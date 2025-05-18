import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../common/Card';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Skeleton } from '../common/Skeleton';
import { useTheme } from '@/hooks/useTheme';

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface DashboardProps {
  title: string;
  subtitle?: string;
  data: ChartData[];
  type: 'line' | 'bar' | 'area';
  metrics: {
    label: string;
    value: number | string;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
  }[];
  filters?: {
    label: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
  }[];
  dateRange?: {
    start: Date;
    end: Date;
    onChange: (start: Date, end: Date) => void;
  };
  isLoading?: boolean;
  error?: string;
  className?: string;
}

const chartColors = {
  primary: {
    light: '#8884d8',
    dark: '#a5a4e0',
  },
  secondary: {
    light: '#82ca9d',
    dark: '#9ed9b8',
  },
  accent: {
    light: '#ffc658',
    dark: '#ffd380',
  },
};

export function Dashboard({
  title,
  subtitle,
  data,
  type,
  metrics,
  filters,
  dateRange,
  isLoading = false,
  error,
  className = '',
}: DashboardProps) {
  const [isRealTime, setIsRealTime] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartTheme = {
    text: isDark ? '#e2e8f0' : '#1a202c',
    grid: isDark ? '#2d3748' : '#e2e8f0',
    tooltip: {
      background: isDark ? '#2d3748' : '#ffffff',
      border: isDark ? '#4a5568' : '#e2e8f0',
    },
  };

  const renderChart = () => {
    if (isLoading) {
      return <Skeleton variant="rectangular" height={400} />;
    }

    if (error) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center h-[400px] text-red-500"
        >
          {error}
        </motion.div>
      );
    }

    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    };

    const chartComponents = {
      line: (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
          <XAxis dataKey="name" stroke={chartTheme.text} />
          <YAxis stroke={chartTheme.text} />
          <Tooltip
            contentStyle={{
              backgroundColor: chartTheme.tooltip.background,
              border: `1px solid ${chartTheme.tooltip.border}`,
              color: chartTheme.text,
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke={isDark ? chartColors.primary.dark : chartColors.primary.light}
            activeDot={{ r: 8 }}
            strokeWidth={2}
            dot={{ r: 4 }}
            animationDuration={1000}
          />
        </LineChart>
      ),
      bar: (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
          <XAxis dataKey="name" stroke={chartTheme.text} />
          <YAxis stroke={chartTheme.text} />
          <Tooltip
            contentStyle={{
              backgroundColor: chartTheme.tooltip.background,
              border: `1px solid ${chartTheme.tooltip.border}`,
              color: chartTheme.text,
            }}
          />
          <Legend />
          <Bar
            dataKey="value"
            fill={isDark ? chartColors.primary.dark : chartColors.primary.light}
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
          />
        </BarChart>
      ),
      area: (
        <AreaChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
          <XAxis dataKey="name" stroke={chartTheme.text} />
          <YAxis stroke={chartTheme.text} />
          <Tooltip
            contentStyle={{
              backgroundColor: chartTheme.tooltip.background,
              border: `1px solid ${chartTheme.tooltip.border}`,
              color: chartTheme.text,
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="value"
            stroke={isDark ? chartColors.primary.dark : chartColors.primary.light}
            fill={isDark ? chartColors.primary.dark : chartColors.primary.light}
            fillOpacity={0.3}
            strokeWidth={2}
            animationDuration={1000}
          />
        </AreaChart>
      ),
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-[400px] w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          {chartComponents[type]}
        </ResponsiveContainer>
      </motion.div>
    );
  };

  return (
    <Card
      title={title}
      subtitle={subtitle}
      className={`${className} transition-colors duration-200`}
      footer={
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex flex-wrap items-center gap-4">
            {filters?.map(filter => (
              <Select
                key={filter.label}
                label={filter.label}
                options={filter.options}
                value={filter.value}
                onChange={e => filter.onChange(e.target.value)}
                className="w-40"
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isRealTime ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setIsRealTime(!isRealTime)}
              className="transition-all duration-200"
            >
              {isRealTime ? 'Stop Real-Time' : 'Start Real-Time'}
            </Button>
          </div>
        </motion.div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <AnimatePresence>
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200"
            >
              <div className="text-sm text-gray-500 dark:text-gray-400">{metric.label}</div>
              <div className="mt-1 flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {metric.value}
                </div>
                {metric.change && (
                  <div
                    className={`ml-2 flex items-baseline text-sm font-semibold ${
                      metric.trend === 'up'
                        ? 'text-green-600 dark:text-green-400'
                        : metric.trend === 'down'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                    {metric.change}%
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {renderChart()}
    </Card>
  );
}

interface MetricCardProps {
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  isLoading?: boolean;
}

export function MetricCard({ label, value, change, trend, isLoading = false }: MetricCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (isLoading) {
    return <Skeleton variant="rectangular" height={100} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200"
    >
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
      <div className="mt-1 flex items-baseline">
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
        {change && (
          <div
            className={`ml-2 flex items-baseline text-sm font-semibold ${
              trend === 'up'
                ? 'text-green-600 dark:text-green-400'
                : trend === 'down'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
            {change}%
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string;
}

export function ChartCard({ title, children, isLoading = false, error }: ChartCardProps) {
  return (
    <Card title={title}>
      {isLoading ? (
        <Skeleton variant="rectangular" height={400} />
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center h-[400px] text-red-500 dark:text-red-400"
        >
          {error}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      )}
    </Card>
  );
}
