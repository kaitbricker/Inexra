'use client';

import { motion } from 'framer-motion';
import { FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';
import React from 'react';

function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;
    let incrementTime = 10;
    let step = Math.ceil(end / 100);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setDisplay(start);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
}

export function HeroAnimated({ stats }: { stats: { label: string; value: number }[] }) {
  return (
    <div className="relative z-10 flex flex-col md:flex-row items-center justify-center px-10 py-20 gap-16">
      {/* Animated Hero Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg width="100%" height="100%" className="w-full h-full" style={{ minHeight: '100vh' }}>
          <defs>
            <radialGradient id="bg-gradient" cx="50%" cy="40%" r="80%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0a1837" stopOpacity="0.9" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#bg-gradient)" />
          {/* Abstract lines */}
          <motion.path
            d="M0 200 Q400 100 800 200 T1600 200"
            stroke="#6366f1" strokeWidth="2" fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
          />
        </svg>
      </div>
      <div className="max-w-xl space-y-8">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold leading-tight bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Unlock the Power of Conversations
        </motion.h1>
        <motion.p
          className="text-xl text-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Bring clarity to your conversations. Inexra uses cutting-edge AI to turn fragmented messages into actionable insights, helping businesses connect better, respond faster, and grow smarter.
        </motion.p>
        <motion.a
          href="#get-started"
          className="inline-block px-10 py-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg font-bold rounded-xl shadow-xl hover:scale-105 hover:shadow-2xl transition active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-400"
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.97 }}
        >
          Get Started
        </motion.a>
        <div className="flex gap-8 mt-10">
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex flex-col items-center">
              <span className="text-3xl font-extrabold text-indigo-400">
                <AnimatedCounter value={stat.value} />
              </span>
              <span className="text-sm text-gray-300 mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Conversation Preview Widget */}
      <motion.div
        className="hidden md:block relative z-10"
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <div className="bg-gradient-to-br from-[#1a2747] to-[#232b3b] rounded-2xl shadow-2xl p-7 w-96 border border-indigo-700/30">
          <div className="flex items-center gap-3 mb-4">
            <FaInstagram className="text-pink-500 text-2xl" />
            <FaTwitter className="text-sky-500 text-2xl" />
            <FaLinkedin className="text-blue-700 text-2xl" />
          </div>
          <div className="mb-4">
            <div className="font-semibold text-gray-100 mb-2">Conversations</div>
            <div className="flex items-center gap-2 mb-2">
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Kathryn Murphy" className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-100">Kathryn Murphy</div>
                <div className="text-xs text-gray-400">Are you available for call?...</div>
              </div>
              <span className="text-xs text-gray-500">2h ago</span>
              <span className="ml-2 px-2 py-0.5 rounded bg-green-200/20 text-green-400 text-xs font-semibold">Positive</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Dariene Robertson" className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-100">Dariene Robertson</div>
                <div className="text-xs text-gray-400">Can you tell me more about your product?</div>
              </div>
              <span className="text-xs text-gray-500">Fri</span>
              <span className="ml-2 px-2 py-0.5 rounded bg-yellow-200/20 text-yellow-400 text-xs font-semibold">Neutral</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-200/20 flex items-center justify-center">
                <span className="text-indigo-400 font-bold">MT</span>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-100">Message Templates</div>
                <div className="text-xs text-gray-400">Save and reuse</div>
              </div>
              <span className="ml-auto px-2 py-0.5 rounded bg-indigo-200/20 text-indigo-400 text-xs font-semibold">42</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 