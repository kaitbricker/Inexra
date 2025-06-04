"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { XMarkIcon, SparklesIcon } from "@heroicons/react/24/outline";

// Context for global control
const AskInexraAIContext = createContext({ open: () => {}, close: () => {}, isOpen: false });

export function useAskInexraAI() {
  return useContext(AskInexraAIContext);
}

export function AskInexraAIProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <AskInexraAIContext.Provider value={{ open, close, isOpen }}>
      {children}
      <AskInexraAIPanel isOpen={isOpen} onClose={close} />
    </AskInexraAIContext.Provider>
  );
}

export function AskInexraAIPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setMessages((prev) => [input, ...prev]);
    setInput("");
    setTimeout(() => setLoading(false), 1200); // Simulate AI response
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "What are this week's top issues?",
    "Show me positive trends",
    "How many new leads?",
    "Summarize complaints",
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-30 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-[400px] bg-white dark:bg-gray-900 shadow-lg z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="p-6 pb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold">Ask InexraAI</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Get instant insights from your leads, trends, or message patterns.
          </p>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-2 mb-6 px-6">
          {suggestions.map((prompt, i) => (
            <button
              key={prompt}
              className="text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-full shadow-sm transition-all flex items-center gap-1"
              onClick={() => setInput(prompt)}
            >
              <span>🔍</span> {prompt}
            </button>
          ))}
        </div>
        {/* Messages/Answers or Empty State */}
        <div className="flex-1 overflow-y-auto px-6">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full"></span>
              InexraAI is thinking...
            </div>
          )}
          {messages.length === 0 && !loading && (
            <div className="bg-gray-50 p-4 rounded-md text-center text-sm text-gray-500 italic border border-dashed border-gray-200 mb-6">
              No questions asked yet.<br />Try one of the suggestions above or ask anything below.
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100 p-3 rounded-lg shadow-sm self-end max-w-[90%] mb-3">
              {msg}
            </div>
          ))}
        </div>
        {/* Input Bar */}
        <form
          className="p-6 border-t border-gray-100 dark:border-gray-800"
          onSubmit={e => { e.preventDefault(); handleSend(); }}
        >
          <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition bg-white dark:bg-gray-800">
            <SparklesIcon className="w-5 h-5 text-indigo-400" />
            <input
              type="text"
              placeholder="Ask InexraAI..."
              className="flex-grow outline-none text-sm text-gray-700 dark:text-gray-100 bg-transparent"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium px-4 py-2 rounded-md shadow hover:opacity-90 transition disabled:opacity-60"
              disabled={loading || !input.trim()}
            >
              Ask
            </button>
          </div>
        </form>
      </div>
    </>
  );
} 