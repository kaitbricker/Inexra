"use client";

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
} from "@heroicons/react/24/outline";
import { useState, useRef, useEffect } from "react";
import { useAskInexraAI } from "@/components/AskInexraAIPanel";

const metrics = [
  {
    name: "Total Messages",
    value: "64",
    change: "+19%",
    icon: ChatBubbleLeftRightIcon,
    gradient: "from-fuchsia-400 via-purple-500 to-indigo-600",
    iconBg: "bg-fuchsia-100/60",
    iconRing: "ring-fuchsia-400/30",
  },
  {
    name: "Leads",
    value: "18",
    change: "+13%",
    icon: UserGroupIcon,
    gradient: "from-cyan-400 via-blue-500 to-blue-700",
    iconBg: "bg-cyan-100/60",
    iconRing: "ring-cyan-400/30",
  },
  {
    name: "Complaints",
    value: "7",
    change: "-23%",
    icon: ExclamationTriangleIcon,
    gradient: "from-rose-400 via-red-500 to-orange-500",
    iconBg: "bg-rose-100/60",
    iconRing: "ring-rose-400/30",
  },
  {
    name: "Insights",
    value: "5",
    change: "+8%",
    icon: TagIcon,
    gradient: "from-green-400 via-emerald-500 to-teal-600",
    iconBg: "bg-green-100/60",
    iconRing: "ring-green-400/30",
  },
];

const messages = [
  {
    id: 1,
    sender: "JD",
    tag: "Leads",
    tagColor: "bg-blue-100 text-blue-800",
    preview: "Interested in enterprise pricing...",
    time: "2m ago",
  },
  {
    id: 2,
    sender: "MS",
    tag: "Complaints",
    tagColor: "bg-red-100 text-red-800",
    preview: "Service disruption reported...",
    time: "15m ago",
  },
  {
    id: 3,
    sender: "RK",
    tag: "Collab",
    tagColor: "bg-purple-100 text-purple-800",
    preview: "Partnership opportunity...",
    time: "1h ago",
  },
  {
    id: 4,
    sender: "TL",
    tag: "Positive",
    tagColor: "bg-green-100 text-green-800",
    preview: "Great experience with support...",
    time: "2h ago",
  },
  {
    id: 5,
    sender: "AB",
    tag: "Technical",
    tagColor: "bg-yellow-100 text-yellow-800",
    preview: "API integration question...",
    time: "3h ago",
  },
];

const sentimentData = [
  { label: "Positive", value: 65, color: "bg-green-500" },
  { label: "Neutral", value: 22, color: "bg-yellow-500" },
  { label: "Negative", value: 13, color: "bg-red-500" },
];

type Message = {
  id: number;
  sender: string;
  tag: string;
  tagColor: string;
  preview: string;
  time: string;
};

export default function Dashboard() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [response, setResponse] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const handleView = (message: Message) => setSelectedMessage(message);
  const handleClose = () => setSelectedMessage(null);
  const { open: openAskInexraAI } = useAskInexraAI();

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
              className="relative"
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="Show notifications"
            >
              <BellIcon className="w-6 h-6 text-gray-700 hover:text-indigo-500 transition" />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">3</span>
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fade-in">
                <div className="p-4 border-b">
                  <h4 className="text-sm font-semibold text-gray-800">Notifications</h4>
                </div>
                <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {/* Today's Notifications */}
                  <li className="px-4 py-2 bg-gray-50">
                    <p className="text-xs text-gray-500 font-semibold">Today</p>
                  </li>
                  <li className="px-4 py-3 hover:bg-gray-50 transition cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 text-blue-600 p-2 rounded-full text-sm">
                        📈
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-800 font-medium">Pricing inquiries increased 32% this week.</p>
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">Insight</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">2h ago</p>
                      </div>
                    </div>
                  </li>
                  <li className="px-4 py-3 hover:bg-gray-50 transition cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <div className="bg-red-100 text-red-600 p-2 rounded-full text-sm">
                        ⚠️
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-800 font-medium">3 new complaints flagged as urgent.</p>
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Warning</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Yesterday</p>
                      </div>
                    </div>
                  </li>
                  {/* Yesterday's Notifications */}
                  <li className="px-4 py-2 bg-gray-50">
                    <p className="text-xs text-gray-500 font-semibold">Yesterday</p>
                  </li>
                  <li className="px-4 py-3 hover:bg-gray-50 transition cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <div className="bg-purple-100 text-purple-600 p-2 rounded-full text-sm">
                        🤝
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-800 font-medium">New collaboration opportunity from BioLab.</p>
                          <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium">Opportunity</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">3 days ago</p>
                      </div>
                    </div>
                  </li>
                </ul>
                <div className="p-3 border-t">
                  <button className="w-full text-center text-sm text-indigo-600 font-medium py-2 hover:underline hover:text-indigo-700 flex items-center justify-center gap-1">
                    View All Notifications
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
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
                <p className="mt-2 text-3xl font-semibold drop-shadow-lg">{metric.value}</p>
                <p className="mt-1 text-sm opacity-80">{metric.change} last 30 days</p>
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
                className="relative group flex items-stretch rounded-2xl bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-2xl transition-all duration-200 overflow-hidden hover:scale-[1.015]"
              >
                {/* Sender Badge */}
                <div className="flex items-center px-4 py-4">
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-fuchsia-500 text-lg font-bold text-white shadow-md border-2 border-white dark:border-gray-900">
                    {message.sender}
                  </div>
                </div>
                {/* Message Content */}
                <div className="flex flex-1 flex-col justify-center px-2 py-4 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
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
                    {message.time}
                  </span>
                </div>
                {/* Hover Action Button */}
                <button
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full px-3 py-1 text-xs font-semibold shadow-md hover:scale-105"
                  onClick={() => handleView(message)}
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Snapshot */}
        <div className="overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 p-4 space-y-4 max-w-sm flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sentiment Snapshot</h3>
          <p className="text-sm text-gray-500">AI insights from the last 30 days</p>
          <div className="bg-indigo-50 border-l-4 border-indigo-400 text-indigo-800 p-3 rounded-md text-sm leading-snug shadow-sm mt-3 mb-4 dark:bg-indigo-900/30 dark:text-indigo-100 dark:border-indigo-500">
            <p className="italic font-medium">
              You've seen a spike in positive sentiment this week. Most messages are related to new pricing inquiries.
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
                <span className="text-gray-600 font-medium">65%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mt-1">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            {/* Neutral */}
            <div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2">
                  <span className="text-yellow-500 text-lg">😐</span> Neutral
                </span>
                <span className="text-gray-600 font-medium">22%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mt-1">
                <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '22%' }}></div>
              </div>
            </div>
            {/* Negative */}
            <div>
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2">
                  <span className="text-red-500 text-lg">😡</span> Negative
                </span>
                <span className="text-gray-600 font-medium">13%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mt-1">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '13%' }}></div>
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
                    <span className="text-sm font-medium text-gray-900 dark:text-white">2h 14m</span>
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
                    <span className="text-sm font-medium text-gray-900 dark:text-white">82%</span>
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
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">3 SLA Breaches</span>
                </div>
                <span className="text-xs text-red-500">Needs Attention</span>
              </div>
              {/* Customer Satisfaction */}
              <div className="flex items-center gap-3 py-3 col-span-2">
                <HandThumbUpIcon className="w-5 h-5 text-green-400" />
                <div className="flex-1">
                  <div className="text-xs text-gray-500">Customer Satisfaction</div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">92% Satisfied</span>
                  <div className="w-full h-1 bg-gray-200 rounded mt-1">
                    <div className="bg-green-500 h-1 rounded" style={{ width: '92%' }}></div>
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
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">{selectedMessage.sender}</div>
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
                  onClick={() => setResponse("Thanks for your interest! I'd be happy to share more about enterprise pricing.")}
                >
                  Thanks for your interest! I'd be happy to share more about enterprise pricing.
                </button>
                <button 
                  className="text-sm bg-gray-100 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 text-left transition" 
                  onClick={() => setResponse("Can you tell me more about your use case?")}
                >
                  Can you tell me more about your use case?
                </button>
                <button 
                  className="text-sm bg-gray-100 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 text-left transition" 
                  onClick={() => setResponse("I'll connect you with our sales team for a custom quote.")}
                >
                  I'll connect you with our sales team for a custom quote.
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