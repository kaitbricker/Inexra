import React from 'react';
import { FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 bg-transparent">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">×</span>
          </div>
          <span className="text-2xl font-bold text-gray-900 tracking-tight">Inexra</span>
        </div>
        <nav className="flex items-center gap-8 text-gray-700 font-medium">
          <a href="#features" className="hover:text-indigo-600 transition">Features</a>
          <a href="#pricing" className="hover:text-indigo-600 transition">Pricing</a>
          <a href="#support" className="hover:text-indigo-600 transition">Support</a>
          <a href="/sign-in" className="ml-4 px-5 py-2 rounded bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition font-semibold">Sign In</a>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center px-8 py-12 gap-12 relative">
        <div className="max-w-xl z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Unlock Insights<br />from Your Conversations
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Turn direct messages, emails, and chats into actionable intelligence using powerful AI.
          </p>
          <a href="#get-started" className="inline-block px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded shadow hover:bg-indigo-700 transition">Get Started</a>
        </div>

        {/* Conversation Preview Widget */}
        <div className="hidden md:block absolute right-16 top-24 z-0">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-96">
            <div className="flex items-center gap-3 mb-4">
              <FaInstagram className="text-pink-500 text-2xl" />
              <FaTwitter className="text-sky-500 text-2xl" />
              <FaLinkedin className="text-blue-700 text-2xl" />
            </div>
            <div className="mb-4">
              <div className="font-semibold text-gray-800 mb-2">Conversations</div>
              <div className="flex items-center gap-2 mb-2">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Kathryn Murphy" className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Kathryn Murphy</div>
                  <div className="text-xs text-gray-500">Are you available for call?...</div>
                </div>
                <span className="text-xs text-gray-400">2h ago</span>
                <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold">Positive</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Dariene Robertson" className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Dariene Robertson</div>
                  <div className="text-xs text-gray-500">Can you tell me more about your product?</div>
                </div>
                <span className="text-xs text-gray-400">Fri</span>
                <span className="ml-2 px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">Neutral</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-indigo-600 font-bold">MT</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Message Templates</div>
                  <div className="text-xs text-gray-500">Save and reuse</div>
                </div>
                <span className="ml-auto px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-xs font-semibold">42</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Highlights Section */}
      <section id="features" className="max-w-5xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow p-6 flex items-start gap-4">
          <div className="bg-indigo-100 p-3 rounded-full">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M16 3h-1a2 2 0 0 0-2 2v2" /></svg>
          </div>
          <div>
            <div className="font-bold text-lg text-gray-900 mb-1">Unified Inbox</div>
            <div className="text-gray-600">Manage all your conversations in one place.</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex items-start gap-4">
          <div className="bg-indigo-100 p-3 rounded-full">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M9 17v-2a4 4 0 0 1 4-4h2" /><circle cx="12" cy="12" r="10" /></svg>
          </div>
          <div>
            <div className="font-bold text-lg text-gray-900 mb-1">AI Analysis</div>
            <div className="text-gray-600">Summarize, classify, and detect sentiment.</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex items-start gap-4">
          <div className="bg-indigo-100 p-3 rounded-full">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3h-1a2 2 0 0 0-2 2v2" /></svg>
          </div>
          <div>
            <div className="font-bold text-lg text-gray-900 mb-1">Message Templates</div>
            <div className="text-gray-600">Save and reuse common responses.</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex items-start gap-4">
          <div className="bg-indigo-100 p-3 rounded-full">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M3 3v18h18" /><rect x="7" y="7" width="10" height="10" rx="2" /></svg>
          </div>
          <div>
            <div className="font-bold text-lg text-gray-900 mb-1">Engagement Stats</div>
            <div className="text-gray-600">Track reply rates and key metrics.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
