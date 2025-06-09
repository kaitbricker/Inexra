"use client";
import { useState, useRef, useEffect } from "react";
import { messages, Message } from "@/app/messages";
import MessageCard from "@/components/MessageCard";
import { SparklesIcon } from "@heroicons/react/24/outline";

const TAGS = ["All", "Leads", "Complaints", "Collab", "Positive", "Technical"];
const SORTS = ["Newest First", "Oldest First", "By Sentiment"];

const TEMPLATE_OPTIONS = [
  {
    label: 'General Acknowledgment',
    value: "Thank you for your message. We&apos;ll follow up shortly.",
  },
  {
    label: 'Processing Timeline',
    value: "We&apos;ve reviewed your request and will get back to you within 1 business day.",
  },
  {
    label: 'Warm Handoff',
    value: "Thanks for reaching out! Let me connect you with our specialist.",
  },
];

export default function InboxPage() {
  const [selected, setSelected] = useState<Message | null>(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(SORTS[0]);
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<number>>(new Set());
  const [response, setResponse] = useState("");
  const [isImproving, setIsImproving] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const bulkActionsRef = useRef<HTMLDivElement>(null);
  const templateBtnRef = useRef<HTMLButtonElement>(null);
  const templateDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        templateDropdownRef.current &&
        !templateDropdownRef.current.contains(event.target as Node) &&
        templateBtnRef.current &&
        !templateBtnRef.current.contains(event.target as Node)
      ) {
        setTemplateOpen(false);
      }
    }
    if (templateOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    } else {
      window.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [templateOpen]);

  const handleBulkAction = (action: string) => {
    if (selectedMessages.size === 0) {
      alert("Please select messages first");
      return;
    }

    switch (action) {
      case 'mark-read':
        console.log(`Marking ${selectedMessages.size} messages as read`);
        break;
      case 'mark-unread':
        console.log(`Marking ${selectedMessages.size} messages as unread`);
        break;
      case 'archive':
        console.log(`Archiving ${selectedMessages.size} messages`);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete ${selectedMessages.size} messages?`)) {
          console.log(`Deleting ${selectedMessages.size} messages`);
        }
        break;
    }
    setBulkActionsOpen(false);
  };

  const toggleMessageSelection = (messageId: number) => {
    setSelectedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedMessages.size === filtered.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(filtered.map(m => m.id)));
    }
  };

  const handleImproveWithAI = async () => {
    if (!response.trim()) return;
    
    setIsImproving(true);
    try {
      // Simulate AI improvement - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const improvedResponse = `AI-enhanced: ${response}`;
      setResponse(improvedResponse);
    } catch (error) {
      console.error('Failed to improve response:', error);
    } finally {
      setIsImproving(false);
    }
  };

  const handleSend = () => {
    if (!response.trim()) return;
    // Handle sending the response
    console.log('Sending response:', response);
  };

  const filtered = messages
    .filter(m => filter === "All" || m.tag === filter)
    .filter(m => m.sender.toLowerCase().includes(search.toLowerCase()) || m.preview.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "Newest First") return b.id - a.id;
      if (sort === "Oldest First") return a.id - b.id;
      return 0;
    });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
      {/* Left: Message List */}
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Inbox</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View and respond to messages across all categories. Powered by InexraAI.
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {messages.length} total messages • Last updated 2 minutes ago
              </p>
            </div>
          </div>
        </div>
        {/* Filters, Search, Sort */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {TAGS.map(tag => (
            <button
              key={tag}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition ${filter === tag ? "bg-indigo-100 text-indigo-700 border-indigo-300" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-indigo-50 hover:text-indigo-700"}`}
              onClick={() => setFilter(tag)}
            >
              {tag}
            </button>
          ))}
          <div className="relative ml-auto" ref={bulkActionsRef}>
            <button 
              className={`flex items-center gap-2 px-3 py-1 text-xs font-medium border rounded-full transition ${
                selectedMessages.size > 0 
                  ? "bg-indigo-100 text-indigo-700 border-indigo-300" 
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setBulkActionsOpen(!bulkActionsOpen)}
            >
              Bulk Actions
              {selectedMessages.size > 0 && (
                <span className="bg-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                  {selectedMessages.size}
                </span>
              )}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {bulkActionsOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="py-1">
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleBulkAction('mark-read')}
                  >
                    Mark as Read
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleBulkAction('mark-unread')}
                  >
                    Mark as Unread
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleBulkAction('archive')}
                  >
                    Archive Selected
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    onClick={() => handleBulkAction('delete')}
                  >
                    Delete Selected
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full p-2 rounded-md border border-gray-300 text-sm shadow-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="p-2 rounded-md border border-gray-300 text-sm shadow-sm"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            {SORTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        {/* Message List */}
        <div className="flex-1 overflow-y-auto pr-2">
          {/* Select All Checkbox */}
          <div className="flex items-center gap-2 mb-3 px-2">
            <input
              type="checkbox"
              checked={selectedMessages.size === filtered.length && filtered.length > 0}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-600">
              {selectedMessages.size > 0 
                ? `Selected ${selectedMessages.size} of ${filtered.length} messages`
                : 'Select all messages'}
            </span>
          </div>
          {filtered.map(msg => (
            <div key={msg.id} className="relative">
              <div className="pl-0">
                <div
                  className={`rounded-lg border border-gray-100 bg-white shadow-sm p-4 hover:bg-gray-50 transition cursor-pointer mb-2 flex items-center gap-4 ${selected && selected.id === msg.id ? 'ring-2 ring-indigo-400 border-indigo-200' : ''}`}
                  onClick={() => setSelected(msg)}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={selectedMessages.has(msg.id)}
                      onChange={e => {
                        e.stopPropagation();
                        toggleMessageSelection(msg.id);
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="h-8 w-px bg-gray-200"></div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-base">
                      {msg.sender}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-medium text-gray-800">{msg.sender}</span>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{msg.preview}</p>
                        <span className="text-xs text-gray-400">{msg.time}</span>
                      </div>
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${msg.tagColor}`}>{msg.tag}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Right: AI Panel */}
      <div className="h-full flex flex-col">
        {selected ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">{selected.sender}</div>
              <div>
                <span className="text-xs text-gray-400">Sender</span>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selected.sender}</h3>
                <span className={`inline-block mt-1 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full`}>{selected.tag}</span>
              </div>
            </div>
            {/* AI Context */}
            <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-md mb-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <SparklesIcon className="w-4 h-4 text-indigo-500" />
                <h4 className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">InexraAI Context</h4>
              </div>
              <p className="text-sm text-gray-800 leading-snug">{selected.aiContext}</p>
              <p className="text-xs mt-2 text-indigo-700 font-medium">AI Confidence Score: <span className="text-indigo-800 font-semibold">{selected.aiConfidence}%</span></p>
            </div>
            {/* Full Message */}
            <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm text-sm leading-relaxed text-gray-800 mb-4">
              {selected.content}
            </div>
            {/* Metadata */}
            <p className="text-xs text-gray-400 mb-6">Received {selected.time}</p>
            {/* Suggested Replies */}
            <h4 className="text-xs text-gray-400 mb-2">Suggested replies</h4>
            <div className="flex flex-col gap-2 mb-4">
              {selected.aiSuggestions.map((s, i) => (
                <button 
                  key={i} 
                  className="text-sm bg-gray-100 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 text-left transition"
                  onClick={() => setResponse(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            {/* Respond Box */}
            <div className="sticky bottom-0 z-10 bg-white dark:bg-gray-900 rounded-b-2xl border-t border-gray-200/60 dark:border-gray-800/60 px-8 py-6">
              {/* Templates Button Dropdown */}
              <div className="flex justify-end mb-2 relative">
                <button
                  ref={templateBtnRef}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 text-sm rounded-md text-gray-700 hover:bg-gray-50 shadow-sm transition"
                  onClick={() => setTemplateOpen((open) => !open)}
                  type="button"
                >
                  <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h6" /></svg>
                  Templates
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {templateOpen && (
                  <div
                    ref={templateDropdownRef}
                    className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                  >
                    {TEMPLATE_OPTIONS.map((tpl, idx) => (
                      <button
                        key={tpl.label}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition"
                        onClick={() => {
                          setResponse(tpl.value);
                          setTemplateOpen(false);
                        }}
                      >
                        <span className="font-medium">{tpl.label}</span>
                        <div className="text-xs text-gray-500 truncate">{tpl.value}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <label htmlFor="response" className="text-sm font-medium text-gray-700 mb-2 block">Respond</label>
              <textarea 
                id="response" 
                rows={3} 
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                placeholder="Type your response..." 
                value={response} 
                onChange={e => setResponse(e.target.value)} 
              />
              <div className="flex justify-end gap-3">
                {/* Improve with AI */}
                <button 
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-sm rounded-md text-gray-700 hover:bg-gray-50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleImproveWithAI}
                  disabled={!response.trim() || isImproving}
                >
                  <SparklesIcon className={`w-4 h-4 text-indigo-500 ${isImproving ? 'animate-pulse' : ''}`} />
                  {isImproving ? 'Improving...' : 'Improve with AI'}
                </button>
                {/* Send Button */}
                <button 
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold rounded-md shadow hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSend}
                  disabled={!response.trim()}
                >
                  Send
                </button>
              </div>
              {response.trim() && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  AI rewrite preview only. You still have full control.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 italic">
            Select a message to view AI context
          </div>
        )}
      </div>
    </div>
  );
} 