"use client";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  TagIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  HandThumbUpIcon,
  ChatBubbleLeftEllipsisIcon,
  BellIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import { useAskInexraAI } from "@/components/AskInexraAIPanel";

// Add type for stats API response
type DashboardStats = {
  totalMessages: number;
  totalLeads: number;
  totalComplaints: number;
  totalInsights: number;
  prevTotalMessages?: number;
  prevTotalLeads?: number;
  prevTotalComplaints?: number;
  prevTotalInsights?: number;
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  aiInsight: string;
  platformHealth: {
    avgResponseTime: string;
    messagesResolved: number;
    slaBreaches: number;
    customerSatisfaction: number;
  };
  messageTrend?: number | null;
  leadTrend?: number | null;
  complaintTrend?: number | null;
  insightTrend?: number | null;
};

// Add type for message API response
type Message = {
  id: number;
  sender: string;
  tag: string;
  tagColor: string;
  preview: string;
  time: string;
  profilePic?: string;
};

function calcChange(current: number, prev?: number) {
  if (typeof prev !== "number" || prev === 0) return "N/A";
  const diff = current - prev;
  const percent = (diff / prev) * 100;
  const sign = percent > 0 ? "+" : "";
  return `${sign}${percent.toFixed(0)}%`;
}

// Helper function to get initials from a name
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Helper function to format timestamp
function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  const time = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  const formattedDate = date.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
  return { time, date: formattedDate };
}

export default function Dashboard() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [response, setResponse] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const handleView = (message: Message) => setSelectedMessage(message);
  const handleClose = () => setSelectedMessage(null);
  const { open: openAskInexraAI } = useAskInexraAI();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch messages from API
      const messagesRes = await fetch("/api/messages?limit=5&sort=desc");
      if (!messagesRes.ok) throw new Error("Failed to fetch messages");
      const messagesData = await messagesRes.json();
      setMessages(messagesData);

      // Use static stats for now
      const staticStats: DashboardStats = {
        totalMessages: 156,
        totalLeads: 42,
        totalComplaints: 18,
        totalInsights: 96,
        prevTotalMessages: 142,
        prevTotalLeads: 38,
        prevTotalComplaints: 15,
        prevTotalInsights: 88,
        sentimentBreakdown: { positive: 65, neutral: 25, negative: 10 },
        aiInsight: "Customer satisfaction is trending up, with a 15% increase in positive sentiment this week.",
        platformHealth: {
          avgResponseTime: "2.5h",
          messagesResolved: 92,
          slaBreaches: 2,
          customerSatisfaction: 88
        },
        messageTrend: 9.8,
        leadTrend: 10.5,
        complaintTrend: 20,
        insightTrend: 9.1
      };
      setStats(staticStats);
    } catch (e) {
      setError("Failed to load dashboard stats. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchStats();
    }
  }, [mounted]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      window.addEventListener("mousedown", handleClickOutside);
    } else {
      window.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notifOpen]);

  // Replace metrics with dynamic data
  const metrics = stats
    ? [
        {
          name: "Total Messages",
          value: stats.totalMessages,
          icon: ChatBubbleLeftRightIcon,
          gradient: "from-fuchsia-400 via-purple-500 to-indigo-600",
          iconBg: "bg-fuchsia-100/60",
          iconRing: "ring-fuchsia-400/30",
          trend: stats.messageTrend,
        },
        {
          name: "Leads",
          value: stats.totalLeads,
          icon: UserGroupIcon,
          gradient: "from-cyan-400 via-blue-500 to-blue-700",
          iconBg: "bg-cyan-100/60",
          iconRing: "ring-cyan-400/30",
          trend: stats.leadTrend,
        },
        {
          name: "Complaints",
          value: stats.totalComplaints,
          icon: ExclamationTriangleIcon,
          gradient: "from-rose-400 via-red-500 to-orange-500",
          iconBg: "bg-rose-100/60",
          iconRing: "ring-rose-400/30",
          trend: stats.complaintTrend,
        },
        {
          name: "Insights",
          value: stats.totalInsights,
          icon: TagIcon,
          gradient: "from-green-400 via-emerald-500 to-teal-600",
          iconBg: "bg-green-100/60",
          iconRing: "ring-green-400/30",
          trend: stats.insightTrend,
        },
      ]
    : [];

  // Loading skeleton component
  const StatsSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>
      </div>

      {/* Metric Tiles Skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="relative rounded-xl bg-gray-100 dark:bg-gray-800 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="h-14 w-14 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Inbox & Sentiment Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                ))}
              </div>
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg">
          <div className="space-y-4">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-8 bg-gray-100 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Error component
  const ErrorBox = () => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full rounded-lg bg-red-50 dark:bg-red-900/30 p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-red-100 dark:bg-red-800/50 p-3">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
              {error}
            </h3>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">
              We couldn&apos;t load your dashboard data. This might be due to a temporary issue or network problem.
            </p>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={fetchStats}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Replace the notifications section with a real-time notifications system
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'insight',
      title: 'Pricing inquiries increased 32% this week',
      time: '2h ago',
      icon: '📈',
      color: 'blue'
    },
    {
      id: 2,
      type: 'warning',
      title: '3 new complaints flagged as urgent',
      time: 'Yesterday',
      icon: '⚠️',
      color: 'red'
    },
    {
      id: 3,
      type: 'opportunity',
      title: 'New collaboration opportunity from BioLab',
      time: '3 days ago',
      icon: '🤝',
      color: 'purple'
    }
  ]);

  // Add notification fetching logic
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (!res.ok) throw new Error('Failed to fetch notifications');
        const data = await res.json();
        setNotifications(data);
      } catch (error) {
        console.error('Failed to load notifications:', error);
        // Keep using static notifications as fallback
      }
    };

    fetchNotifications();
    // Set up polling for real-time updates
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return <StatsSkeleton />;
  }

  if (loading) {
    return <StatsSkeleton />;
  }

  if (error) {
    return <ErrorBox />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome, John!
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-base font-semibold px-6 py-2 rounded-lg shadow hover:opacity-90"
            onClick={openAskInexraAI}
          >
            Ask InexraAI
          </button>
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="Show notifications"
            >
              <BellIcon className="w-6 h-6 text-gray-700 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition" />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse">3</span>
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 animate-fade-in overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Notifications</h4>
                  <button 
                    onClick={() => setNotifOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="max-h-[480px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <BellIcon className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">No new notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                              notification.type === 'insight' ? 'bg-blue-100 dark:bg-blue-900/30' :
                              notification.type === 'warning' ? 'bg-red-100 dark:bg-red-900/30' :
                              'bg-purple-100 dark:bg-purple-900/30'
                            }`}>
                              <span className="text-lg">{notification.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {notification.title}
                                </p>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  notification.type === 'insight' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                  notification.type === 'warning' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                }`}>
                                  {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{notification.time}</p>
                              {notification.type === 'insight' && (
                                <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md">
                                  <span className="font-medium">AI Analysis:</span> This trend suggests potential opportunities for engagement.
                                </div>
                              )}
                              {notification.type === 'warning' && (
                                <div className="mt-2 text-xs text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
                                  <span className="font-medium">Action Required:</span> Please review these complaints within 24 hours.
                                </div>
                              )}
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => router.push('/notifications')}
                      className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
                    >
                      View All Notifications
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => {/* Mark all as read */}}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Mark all as read
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.name}
            className={`relative rounded-xl bg-gradient-to-br ${metric.gradient} p-6 text-white shadow-xl transition-transform hover:scale-[1.03] hover:shadow-2xl`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-80">{metric.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-3xl font-semibold drop-shadow-lg">{metric.value}</p>
                  {/* Trend icon and value */}
                  {typeof metric.trend === "number" && metric.trend !== null && (
                    <span className="flex items-center ml-2 text-base font-medium">
                      {metric.trend > 0 && (
                        <ArrowTrendingUpIcon className="h-5 w-5 text-green-300" />
                      )}
                      {metric.trend < 0 && (
                        <ArrowTrendingDownIcon className="h-5 w-5 text-red-300" />
                      )}
                      <span className={
                        metric.trend > 0
                          ? "text-green-200 ml-1"
                          : metric.trend < 0
                          ? "text-red-200 ml-1"
                          : "text-gray-200 ml-1"
                      }>
                        {metric.trend > 0 ? "+" : ""}
                        {metric.trend.toFixed(0)}%
                      </span>
                    </span>
                  )}
                </div>
              </div>
              <div className={`relative flex items-center justify-center h-14 w-14 ${metric.iconBg} rounded-full shadow-lg ring-4 ${metric.iconRing}`}>
                <metric.icon className="h-7 w-7 text-gray-700/80" />
                <span className={`absolute -z-10 h-16 w-16 rounded-full blur-2xl opacity-40 ${metric.iconBg}`}></span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Inbox & Sentiment Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inbox Preview */}
        <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Inbox (Showing 5 messages)
            </h2>
            <div className="flex space-x-2">
              {["All", "Leads", "Complaints", "Collab", "Positive", "Technical"].map(
                (filter) => (
                  <button
                    key={filter}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {filter}
                  </button>
                )
              )}
            </div>
          </div>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className="relative group flex items-stretch rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-2xl transition-all duration-200 overflow-hidden hover:scale-[1.015] cursor-pointer"
                onClick={() => handleView(message)}
              >
                {/* Sender Badge */}
                <div className="flex items-center px-4 py-4">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-fuchsia-500 text-lg font-bold text-white shadow-md border-2 border-white dark:border-gray-900">
                    {message.profilePic ? (
                      <img
                        src={message.profilePic}
                        alt={message.sender}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(message.sender)
                    )}
                  </div>
                </div>
                {/* Message Content */}
                <div className="flex flex-1 flex-col justify-center px-2 py-4 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {message.sender}
                    </span>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold shadow-sm border border-white/40 dark:border-gray-800 ${message.tagColor}`}>
                      {message.tag}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900 dark:text-white truncate">
                      {message.preview}
                    </span>
                  </div>
                </div>
                {/* Timestamp */}
                <div className="flex flex-col justify-end pr-4 pb-4">
                  <span className="text-xs font-mono text-gray-400">
                    {formatTimestamp(message.time).time}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(message.time).date}
                  </span>
                </div>
                {/* Hover Action Button */}
                <button
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full px-3 py-1 text-xs font-semibold shadow-md hover:scale-105"
                  onClick={e => { e.stopPropagation(); handleView(message); }}
                >
                  View
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button
              className="text-indigo-600 hover:text-indigo-800 font-medium"
              onClick={() => router.push("/inbox")}
            >
              View Full Inbox
            </button>
          </div>
        </div>

        {/* Sentiment Snapshot */}
        <div className="overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 p-4 space-y-4 max-w-sm flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sentiment Snapshot</h3>
          <p className="text-sm text-gray-500">AI insights from the last 30 days</p>
          <div className="bg-indigo-50 border-l-4 border-indigo-400 text-indigo-800 p-3 rounded-md text-sm leading-snug shadow-sm mt-3 mb-4 dark:bg-indigo-900/30 dark:text-indigo-100 dark:border-indigo-500">
            <p className="italic font-medium">
              {stats?.aiInsight || "Loading..."}
            </p>
          </div>
          {/* Sentiment Bars */}
          <div className="flex flex-col space-y-4">
            {/* Positive */}
            <div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2">
                  <span className="text-green-600 text-lg">😀</span> Positive
                </span>
                <span className="text-gray-600 font-medium">{stats?.sentimentBreakdown.positive || 0}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mt-1">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats?.sentimentBreakdown.positive || 0}%` }}></div>
              </div>
            </div>
            {/* Neutral */}
            <div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2">
                  <span className="text-yellow-500 text-lg">😐</span> Neutral
                </span>
                <span className="text-gray-600 font-medium">{stats?.sentimentBreakdown.neutral || 0}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mt-1">
                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${stats?.sentimentBreakdown.neutral || 0}%` }}></div>
              </div>
            </div>
            {/* Negative */}
            <div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2">
                  <span className="text-red-500 text-lg">😡</span> Negative
                </span>
                <span className="text-gray-600 font-medium">{stats?.sentimentBreakdown.negative || 0}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mt-1">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${stats?.sentimentBreakdown.negative || 0}%` }}></div>
              </div>
            </div>
          </div>
          {/* Platform Health Snapshot */}
          <div>
            <h4 className="text-sm font-semibold mt-6 mb-2 text-gray-700">Platform Health</h4>
            <div className="grid grid-cols-2 gap-4 divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              {/* Avg. Response Time */}
              <div className="flex items-center gap-3 py-3 col-span-2">
                <ClockIcon className="w-5 h-5 text-indigo-400" />
                <div className="flex-1">
                  <div className="text-xs text-gray-500">Avg. Response Time</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{stats?.platformHealth.avgResponseTime || "Loading..."}</span>
                    <span className="text-xs text-gray-500">Fair</span>
                  </div>
                </div>
                <span className="text-xs text-gray-500">+4% this week</span>
              </div>
              {/* Messages Resolved */}
              <div className="flex items-center gap-3 py-3 col-span-2">
                <CheckCircleIcon className="w-5 h-5 text-green-400" />
                <div className="flex-1">
                  <div className="text-xs text-gray-500">Messages Resolved</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{stats?.platformHealth.messagesResolved || 0}%</span>
                    <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full font-medium">Improving</span>
                  </div>
                </div>
                <span className="text-xs text-gray-500">+6% this week</span>
              </div>
              {/* SLA Breaches */}
              <div className="flex items-center gap-3 py-3 col-span-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />
                <div className="flex-1">
                  <div className="text-xs text-gray-500">SLA Breaches</div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">{stats?.platformHealth.slaBreaches || 0} SLA Breaches</span>
                </div>
                <span className="text-xs text-red-500">Needs Attention</span>
              </div>
              {/* Customer Satisfaction */}
              <div className="flex items-center gap-3 py-3 col-span-2">
                <HandThumbUpIcon className="w-5 h-5 text-green-400" />
                <div className="flex-1">
                  <div className="text-xs text-gray-500">Customer Satisfaction</div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">{stats?.platformHealth.customerSatisfaction || 0}% Satisfied</span>
                  <div className="w-full h-1 bg-gray-200 rounded mt-1">
                    <div className="bg-green-500 h-1 rounded" style={{ width: `${stats?.platformHealth.customerSatisfaction || 0}%` }}></div>
                  </div>
                </div>
                <span className="text-xs text-green-600">Great</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Details Drawer */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/40 transition-opacity duration-300" onClick={handleClose}></div>
          <div className="relative w-full max-w-md h-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-y-auto transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)] translate-x-0">
            {/* Header - Sender Info */}
            <div className="flex items-center gap-4 mb-4 px-8 pt-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                {selectedMessage.profilePic ? (
                  <img
                    src={selectedMessage.profilePic}
                    alt={selectedMessage.sender}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(selectedMessage.sender)
                )}
              </div>
              <div>
                <p className="text-sm text-gray-400">Sender</p>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedMessage.sender}</h2>
                <span className="inline-block mt-1 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">{selectedMessage.tag}</span>
              </div>
            </div>
            {/* InexraAI Context Callout */}
            <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-md mb-5 shadow-sm mx-8">
              <div className="flex items-center gap-2 mb-1">
                <SparklesIcon className="w-4 h-4 text-indigo-500" />
                <h4 className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">InexraAI Context</h4>
              </div>
              <p className="text-sm text-gray-800 leading-snug">
                This message was classified as a <span className="font-medium text-blue-600">{selectedMessage.tag}</span> and contains high buyer intent.
              </p>
              <p className="text-xs mt-2 text-indigo-700 font-medium">AI Confidence Score: <span className="text-indigo-800 font-semibold">91%</span></p>
            </div>
            {/* Message Bubble */}
            <div className="mx-8">
              <p className="text-xs text-gray-400 mb-1">🔍 Analyzed by InexraAI</p>
              <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm text-sm leading-relaxed text-gray-800 mb-4">
                {`"${selectedMessage.preview}"`}
              </div>
            </div>
            {/* Metadata */}
            <p className="text-xs text-gray-400 mb-6 mx-8">Received {selectedMessage.time}</p>
            {/* Suggested Replies */}
            <div className="mx-8">
              <h4 className="text-xs text-gray-400 mb-2">Suggested replies</h4>
              <div className="flex flex-col gap-2 mb-4">
                <button 
                  className="text-sm bg-gray-100 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 text-left transition" 
                  onClick={() => setResponse("Thanks for your interest! I&apos;d be happy to share more about enterprise pricing.")}
                >
                  Thanks for your interest! I&apos;d be happy to share more about enterprise pricing.
                </button>
                <button 
                  className="text-sm bg-gray-100 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 text-left transition" 
                  onClick={() => setResponse("Can you tell me more about your use case?")}
                >
                  Can you tell me more about your use case?
                </button>
                <button 
                  className="text-sm bg-gray-100 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 text-left transition" 
                  onClick={() => setResponse("I&apos;ll connect you with our sales team for a custom quote.")}
                >
                  I&apos;ll connect you with our sales team for a custom quote.
                </button>
              </div>
            </div>
            {/* Respond Box */}
            <div className="sticky bottom-0 z-10 bg-white dark:bg-gray-900 rounded-b-2xl border-t border-gray-200/60 dark:border-gray-800/60 px-8 py-6">
              <label htmlFor="response" className="text-sm font-medium text-gray-700 mb-2 block">Respond</label>
              <textarea 
                id="response" 
                rows={3} 
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                placeholder="Type your response..." 
                value={response} 
                onChange={e => setResponse(e.target.value)} 
              />
              <button className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow hover:opacity-90 transition flex items-center justify-center gap-2">
                <SparklesIcon className="w-4 h-4" />
                Send with AI Assist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 